"""
AI-Powered Investment Coach
Provides personalized stock and ETF recommendations based on user profile,
risk tolerance, goals, and real-time market data.
"""

import json
import time
from typing import List, Dict, Any, Optional
from datetime import datetime
from huggingface_hub import InferenceClient
from schemas import UserProfile, RiskTolerance
from config import MODEL_ID, HF_TOKEN

# Investment Coach Configuration
MAX_NEW_TOKENS = 512
TEMPERATURE = 0.3
TIMEOUT_SECS = 30
TOP_P = 0.9

client = InferenceClient(token=HF_TOKEN, timeout=TIMEOUT_SECS)

# Popular ETFs by category and risk level
ETF_DATABASE = {
    "low_risk": [
        {"symbol": "AGG", "name": "iShares Core U.S. Aggregate Bond ETF", "type": "Bond", "expense_ratio": 0.03},
        {"symbol": "BND", "name": "Vanguard Total Bond Market ETF", "type": "Bond", "expense_ratio": 0.03},
        {"symbol": "SCHZ", "name": "Schwab U.S. Aggregate Bond ETF", "type": "Bond", "expense_ratio": 0.03},
        {"symbol": "TIP", "name": "iShares TIPS Bond ETF", "type": "Inflation-Protected", "expense_ratio": 0.19},
    ],
    "medium_risk": [
        {"symbol": "VOO", "name": "Vanguard S&P 500 ETF", "type": "Large Cap Equity", "expense_ratio": 0.03},
        {"symbol": "VTI", "name": "Vanguard Total Stock Market ETF", "type": "Total Market", "expense_ratio": 0.03},
        {"symbol": "SCHD", "name": "Schwab U.S. Dividend Equity ETF", "type": "Dividend", "expense_ratio": 0.06},
        {"symbol": "QQQ", "name": "Invesco QQQ Trust", "type": "Tech/Growth", "expense_ratio": 0.20},
        {"symbol": "VEA", "name": "Vanguard FTSE Developed Markets ETF", "type": "International", "expense_ratio": 0.05},
    ],
    "high_risk": [
        {"symbol": "VUG", "name": "Vanguard Growth ETF", "type": "Growth", "expense_ratio": 0.04},
        {"symbol": "VGT", "name": "Vanguard Information Technology ETF", "type": "Technology", "expense_ratio": 0.10},
        {"symbol": "VWO", "name": "Vanguard FTSE Emerging Markets ETF", "type": "Emerging Markets", "expense_ratio": 0.08},
        {"symbol": "ARKK", "name": "ARK Innovation ETF", "type": "Disruptive Innovation", "expense_ratio": 0.75},
        {"symbol": "IWM", "name": "iShares Russell 2000 ETF", "type": "Small Cap", "expense_ratio": 0.19},
    ]
}

# Sector-specific ETFs for diversification
SECTOR_ETFS = [
    {"symbol": "XLK", "name": "Technology Select Sector SPDR", "sector": "Technology"},
    {"symbol": "XLV", "name": "Health Care Select Sector SPDR", "sector": "Healthcare"},
    {"symbol": "XLF", "name": "Financial Select Sector SPDR", "sector": "Financials"},
    {"symbol": "XLE", "name": "Energy Select Sector SPDR", "sector": "Energy"},
    {"symbol": "XLY", "name": "Consumer Discretionary Select Sector SPDR", "sector": "Consumer"},
]


def get_recommended_etfs(risk_tolerance: str, investment_amount: float) -> List[Dict[str, Any]]:
    """
    Get ETF recommendations based on risk tolerance
    """
    risk_key = f"{risk_tolerance.lower()}_risk"

    # Get base recommendations
    base_etfs = ETF_DATABASE.get(risk_key, ETF_DATABASE["medium_risk"])

    # Add some diversification with other risk levels
    recommendations = base_etfs.copy()

    if risk_tolerance == "medium":
        recommendations.append(ETF_DATABASE["low_risk"][0])  # Add some bonds
        recommendations.append(ETF_DATABASE["high_risk"][0])  # Add some growth
    elif risk_tolerance == "low":
        recommendations.append(ETF_DATABASE["medium_risk"][0])  # Add some equity exposure

    return recommendations


def calculate_allocation(
    risk_tolerance: str,
    age: int,
    monthly_capacity: float,
    goal_timeline_months: int
) -> Dict[str, Any]:
    """
    Calculate suggested portfolio allocation based on user profile
    """
    # Rule of thumb: stocks % = 110 - age, but adjusted by risk tolerance
    base_stock_allocation = 110 - age

    # Adjust based on risk tolerance
    if risk_tolerance == "low":
        stock_allocation = min(base_stock_allocation - 20, 60)
    elif risk_tolerance == "high":
        stock_allocation = min(base_stock_allocation + 10, 90)
    else:
        stock_allocation = base_stock_allocation

    # Ensure reasonable bounds
    stock_allocation = max(20, min(90, stock_allocation))
    bond_allocation = 100 - stock_allocation

    # Further breakdown of stock allocation
    us_large_cap = stock_allocation * 0.50  # 50% in US large cap
    us_small_mid = stock_allocation * 0.20  # 20% in US small/mid
    international = stock_allocation * 0.20  # 20% international
    emerging_growth = stock_allocation * 0.10  # 10% emerging/growth

    return {
        "total_stocks": stock_allocation,
        "total_bonds": bond_allocation,
        "breakdown": {
            "us_large_cap": round(us_large_cap, 1),
            "us_small_mid": round(us_small_mid, 1),
            "international": round(international, 1),
            "emerging_growth": round(emerging_growth, 1),
            "bonds": round(bond_allocation, 1)
        }
    }


def generate_investment_recommendations(
    profile: UserProfile,
    monthly_capacity: float,
    goal_amount: float,
    goal_timeline_months: int
) -> Dict[str, Any]:
    """
    Generate AI-powered investment recommendations
    """
    t0 = time.perf_counter()

    # Get user's risk tolerance
    risk_tolerance = profile.quiz.risk_tolerance or RiskTolerance.medium
    risk_str = risk_tolerance.value if hasattr(risk_tolerance, 'value') else str(risk_tolerance)

    # Calculate portfolio allocation
    allocation = calculate_allocation(
        risk_str,
        profile.age,
        monthly_capacity,
        goal_timeline_months
    )

    # Get ETF recommendations
    recommended_etfs = get_recommended_etfs(risk_str, monthly_capacity)

    # Build context for AI
    market_context = _build_market_context(recommended_etfs, allocation)

    # Create prompt for investment advice
    prompt = _create_investment_prompt(
        profile,
        monthly_capacity,
        goal_amount,
        goal_timeline_months,
        allocation,
        market_context
    )

    # Get AI recommendations
    try:
        ai_response = _call_chat(prompt)
        t1 = time.perf_counter()

        # Parse AI response
        recommendations = _parse_ai_recommendations(ai_response)

        return {
            "success": True,
            "allocation": allocation,
            "recommended_etfs": recommended_etfs[:5],  # Top 5 recommendations
            "ai_insights": recommendations,
            "monthly_investment_breakdown": _calculate_monthly_breakdown(
                monthly_capacity, allocation, recommended_etfs[:5]
            ),
            "rebalancing_suggestions": _generate_rebalancing_tips(allocation, profile.age),
            "risk_level": risk_str,
            "timing": {
                "total_s": round(t1 - t0, 2)
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to generate recommendations: {str(e)}",
            "allocation": allocation,
            "recommended_etfs": recommended_etfs[:5]
        }


def _build_market_context(etfs: List[Dict], allocation: Dict) -> str:
    """Build market context for AI prompt"""
    etf_list = "\n".join([
        f"- {etf['symbol']}: {etf['name']} ({etf['type']}, expense ratio: {etf['expense_ratio']}%)"
        for etf in etfs[:6]
    ])

    return f"""
Available ETFs for consideration:
{etf_list}

Suggested allocation:
- Stocks: {allocation['total_stocks']}%
- Bonds: {allocation['total_bonds']}%
"""


def _create_investment_prompt(
    profile: UserProfile,
    monthly_capacity: float,
    goal_amount: float,
    goal_timeline_months: int,
    allocation: Dict,
    market_context: str
) -> str:
    """Create prompt for AI investment coach"""

    timeline_years = goal_timeline_months / 12 if goal_timeline_months else 5
    risk_str = profile.quiz.risk_tolerance.value if profile.quiz.risk_tolerance else "medium"

    return f"""You are an expert investment advisor. Provide personalized investment recommendations.

USER PROFILE:
- Name: {profile.name}
- Age: {profile.age}
- Risk Tolerance: {risk_str}
- Monthly Investment Capacity: ${monthly_capacity:,.2f}
- Savings Goal: ${goal_amount:,.2f} in {timeline_years:.1f} years
- Current Concerns: {', '.join([c.value for c in profile.quiz.top_concerns]) if profile.quiz.top_concerns else 'General investing'}

{market_context}

TASK:
Provide specific, actionable investment recommendations in JSON format with these keys:
1. "greeting": A personalized greeting
2. "strategy_overview": Brief overview of the recommended strategy (2-3 sentences)
3. "specific_recommendations": Array of 3-5 specific ETF/fund recommendations with:
   - "symbol": ETF symbol
   - "name": Full name
   - "allocation_percent": What % of monthly investment
   - "reasoning": Why this fits their profile (1-2 sentences)
4. "action_steps": Array of 3-5 immediate action steps
5. "risk_considerations": Array of 2-3 risk warnings
6. "rebalancing_schedule": When and how to rebalance

Focus on:
- Low-cost, diversified ETFs
- Tax efficiency
- Dollar-cost averaging strategy
- Matching their risk tolerance
- Clear explanations for every recommendation

Output ONLY valid JSON, no additional text."""


def _call_chat(prompt: str) -> str:
    """Call the LLM for investment recommendations"""
    messages = [
        {"role": "system", "content": "You are an expert investment advisor. Provide clear, actionable advice in JSON format."},
        {"role": "user", "content": prompt},
    ]

    resp = client.chat.completions.create(
        model=MODEL_ID,
        messages=messages,
        max_tokens=MAX_NEW_TOKENS,
        temperature=TEMPERATURE,
    )

    return (resp.choices[0].message.content or "").strip()


def _parse_ai_recommendations(ai_response: str) -> Dict[str, Any]:
    """Parse AI response into structured recommendations"""
    try:
        # Try to extract JSON from response
        start_idx = ai_response.find('{')
        end_idx = ai_response.rfind('}') + 1

        if start_idx != -1 and end_idx > start_idx:
            json_str = ai_response[start_idx:end_idx]
            return json.loads(json_str)
        else:
            # Fallback structure
            return {
                "greeting": "Welcome to your personalized investment plan!",
                "strategy_overview": ai_response[:200],
                "specific_recommendations": [],
                "action_steps": ["Review the recommended ETFs", "Start with dollar-cost averaging", "Set up automatic investments"],
                "risk_considerations": ["Markets can be volatile", "Past performance doesn't guarantee future results"],
                "rebalancing_schedule": "Review quarterly, rebalance if allocation drifts 5%+"
            }
    except Exception:
        return {
            "greeting": "Welcome to your personalized investment plan!",
            "strategy_overview": "Based on your profile, we recommend a diversified portfolio approach.",
            "specific_recommendations": [],
            "action_steps": ["Review the recommended ETFs", "Start with dollar-cost averaging"],
            "risk_considerations": ["Investing involves risk"],
            "rebalancing_schedule": "Quarterly review recommended"
        }


def _calculate_monthly_breakdown(
    monthly_capacity: float,
    allocation: Dict,
    etfs: List[Dict]
) -> List[Dict[str, Any]]:
    """Calculate dollar amounts for each ETF based on allocation"""
    breakdown = allocation["breakdown"]

    investment_map = []

    if monthly_capacity <= 0:
        return investment_map

    # Map allocation to specific ETFs
    allocations = [
        ("us_large_cap", breakdown.get("us_large_cap", 0)),
        ("international", breakdown.get("international", 0)),
        ("emerging_growth", breakdown.get("emerging_growth", 0)),
        ("bonds", breakdown.get("bonds", 0)),
    ]

    for i, (category, percent) in enumerate(allocations):
        if i < len(etfs) and percent > 0:
            dollar_amount = (percent / 100) * monthly_capacity
            investment_map.append({
                "etf": etfs[i]["symbol"],
                "name": etfs[i]["name"],
                "allocation_percent": percent,
                "monthly_amount": round(dollar_amount, 2)
            })

    return investment_map


def _generate_rebalancing_tips(allocation: Dict, age: int) -> List[str]:
    """Generate rebalancing and micro-investing tips"""
    tips = [
        f"Review your portfolio quarterly to ensure your {allocation['total_stocks']}% stocks / {allocation['total_bonds']}% bonds allocation is maintained.",
        "Rebalance when any asset class drifts more than 5% from target allocation.",
        "Consider tax-loss harvesting opportunities during rebalancing.",
    ]

    if age < 35:
        tips.append("At your age, you can afford more market volatility - consider increasing stock allocation during market dips.")

    tips.append("Set up automatic investments to take advantage of dollar-cost averaging.")

    return tips


# Example usage
if __name__ == "__main__":
    import os
    from pathlib import Path

    assert os.getenv("HUGGINGFACEHUB_API_TOKEN"), "Set HUGGINGFACEHUB_API_TOKEN in your environment."

    # Load sample user profile
    sample_path = Path("sample_json")
    if sample_path.exists():
        with sample_path.open("r", encoding="utf-8") as f:
            payload = json.load(f)
        profile = UserProfile.model_validate(payload)

        recommendations = generate_investment_recommendations(
            profile=profile,
            monthly_capacity=500,
            goal_amount=50000,
            goal_timeline_months=60
        )

        print(json.dumps(recommendations, indent=2))
    else:
        print("No sample_json file found. Create one to test.")
