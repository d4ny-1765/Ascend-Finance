"""
AI Market Insights Feed
Provides personalized market updates and analysis based on user's portfolio.
Explains market movements in simple, easy-to-understand language.
"""

import json
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from huggingface_hub import InferenceClient
from config import MODEL_ID, HF_TOKEN

# Market Insights Configuration
MAX_NEW_TOKENS = 400
TEMPERATURE = 0.4
client = InferenceClient(token=HF_TOKEN, timeout=30)

# Mock market data (in production, would fetch from real APIs like Alpha Vantage, Yahoo Finance, etc.)
MARKET_DATA = {
    "indices": {
        "S&P 500": {"symbol": "SPY", "change_percent": 1.2, "price": 450.25, "trend": "up"},
        "NASDAQ": {"symbol": "QQQ", "change_percent": 2.4, "price": 380.50, "trend": "up"},
        "Dow Jones": {"symbol": "DIA", "change_percent": 0.8, "price": 350.75, "trend": "up"},
        "Russell 2000": {"symbol": "IWM", "change_percent": -0.5, "price": 195.30, "trend": "down"}
    },
    "sectors": {
        "Technology": {"change_percent": 2.4, "trend": "up", "top_movers": ["AAPL", "MSFT", "NVDA"]},
        "Healthcare": {"change_percent": 0.8, "trend": "up", "top_movers": ["JNJ", "UNH"]},
        "Financials": {"change_percent": 1.5, "trend": "up", "top_movers": ["JPM", "BAC"]},
        "Energy": {"change_percent": -1.2, "trend": "down", "top_movers": ["XOM", "CVX"]},
        "Consumer": {"change_percent": 0.5, "trend": "up", "top_movers": ["AMZN", "WMT"]}
    },
    "bonds": {
        "10-Year Treasury": {"yield_percent": 4.25, "change": 0.05, "trend": "up"},
        "Corporate Bonds": {"yield_percent": 5.10, "change": 0.03, "trend": "up"}
    },
    "economic_indicators": {
        "Fed Interest Rate": {"value": 5.25, "next_meeting": "2 weeks", "expected_move": "hold"},
        "Inflation (CPI)": {"value": 3.2, "trend": "down", "previous": 3.7},
        "Unemployment": {"value": 3.8, "trend": "stable"}
    },
    "news_headlines": [
        "Federal Reserve signals interest rate cuts may begin in Q2 2024",
        "Tech stocks rally on strong AI chip demand",
        "Healthcare sector sees gains on new drug approvals",
        "Bond yields rise as investors reassess Fed policy",
        "Consumer spending remains resilient despite inflation"
    ]
}

# ETF-specific data
ETF_PERFORMANCE = {
    "VOO": {"name": "Vanguard S&P 500", "change_percent": 1.2, "volume": "high", "sector_exposure": "broad"},
    "VTI": {"name": "Vanguard Total Market", "change_percent": 1.1, "volume": "high", "sector_exposure": "broad"},
    "VEA": {"name": "Vanguard International", "change_percent": 0.6, "volume": "moderate", "sector_exposure": "international"},
    "VWO": {"name": "Vanguard Emerging Markets", "change_percent": -0.3, "volume": "moderate", "sector_exposure": "emerging"},
    "BND": {"name": "Vanguard Total Bond", "change_percent": -0.2, "volume": "moderate", "sector_exposure": "bonds"},
    "AGG": {"name": "iShares Aggregate Bond", "change_percent": -0.15, "volume": "high", "sector_exposure": "bonds"},
    "QQQ": {"name": "Invesco QQQ", "change_percent": 2.4, "volume": "very_high", "sector_exposure": "tech"},
    "SCHD": {"name": "Schwab Dividend", "change_percent": 0.9, "volume": "moderate", "sector_exposure": "dividend"}
}


def calculate_portfolio_impact(portfolio_allocation: Dict[str, float]) -> Dict[str, Any]:
    """
    Calculate how market movements impact the user's specific portfolio

    Args:
        portfolio_allocation: Dict of {ETF_symbol: allocation_percent}

    Returns:
        Portfolio performance and impact data
    """
    total_change = 0.0
    etf_impacts = []

    for symbol, allocation in portfolio_allocation.items():
        if symbol in ETF_PERFORMANCE:
            etf_data = ETF_PERFORMANCE[symbol]
            weighted_change = etf_data["change_percent"] * (allocation / 100)
            total_change += weighted_change

            etf_impacts.append({
                "symbol": symbol,
                "name": etf_data["name"],
                "allocation": allocation,
                "change_percent": etf_data["change_percent"],
                "contribution_to_portfolio": weighted_change
            })

    return {
        "total_portfolio_change": round(total_change, 2),
        "etf_impacts": sorted(etf_impacts, key=lambda x: abs(x["contribution_to_portfolio"]), reverse=True),
        "best_performer": max(etf_impacts, key=lambda x: x["change_percent"]) if etf_impacts else None,
        "worst_performer": min(etf_impacts, key=lambda x: x["change_percent"]) if etf_impacts else None
    }


def generate_market_insights(
    user_profile: Dict[str, Any],
    portfolio_allocation: Dict[str, float],
    insight_type: str = "daily"
) -> Dict[str, Any]:
    """
    Generate AI-powered market insights personalized to user's portfolio

    Args:
        user_profile: User's financial profile
        portfolio_allocation: Current portfolio allocation {symbol: percent}
        insight_type: "daily" or "weekly"

    Returns:
        Personalized market insights and analysis
    """
    t0 = time.perf_counter()

    # Calculate portfolio impact
    portfolio_impact = calculate_portfolio_impact(portfolio_allocation)

    # Build context for AI
    market_context = _build_market_context(portfolio_allocation, portfolio_impact)

    # Create prompt for AI analysis
    prompt = _create_insights_prompt(
        user_profile,
        portfolio_allocation,
        portfolio_impact,
        market_context,
        insight_type
    )

    # Get AI analysis
    try:
        ai_response = _call_chat(prompt)
        t1 = time.perf_counter()

        # Parse AI response
        insights = _parse_insights(ai_response)

        return {
            "success": True,
            "type": insight_type,
            "timestamp": datetime.now().isoformat(),
            "portfolio_change_percent": portfolio_impact["total_portfolio_change"],
            "market_summary": _generate_market_summary(),
            "personalized_insights": insights,
            "etf_performance": portfolio_impact["etf_impacts"],
            "action_items": _generate_action_items(portfolio_impact, market_context),
            "next_update": _calculate_next_update(insight_type),
            "timing": {
                "total_s": round(t1 - t0, 2)
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to generate insights: {str(e)}",
            "portfolio_change_percent": portfolio_impact["total_portfolio_change"],
            "market_summary": _generate_market_summary()
        }


def _build_market_context(portfolio: Dict[str, float], impact: Dict[str, Any]) -> str:
    """Build comprehensive market context"""

    # Market indices summary
    indices_text = "\n".join([
        f"- {name}: {data['change_percent']:+.1f}% ({data['trend']})"
        for name, data in MARKET_DATA["indices"].items()
    ])

    # Sector performance
    sectors_text = "\n".join([
        f"- {sector}: {data['change_percent']:+.1f}% ({data['trend']})"
        for sector, data in MARKET_DATA["sectors"].items()
    ])

    # Portfolio ETF performance
    etfs_text = "\n".join([
        f"- {etf['symbol']} ({etf['name']}): {etf['change_percent']:+.1f}% (your allocation: {etf['allocation']:.0f}%)"
        for etf in impact["etf_impacts"]
    ])

    # Economic news
    news_text = "\n".join([f"- {headline}" for headline in MARKET_DATA["news_headlines"][:3]])

    return f"""
CURRENT MARKET DATA:

Major Indices Performance:
{indices_text}

Sector Performance:
{sectors_text}

Your Portfolio ETFs:
{etfs_text}

Economic Indicators:
- Fed Rate: {MARKET_DATA['economic_indicators']['Fed Interest Rate']['value']}%
- Inflation: {MARKET_DATA['economic_indicators']['Inflation (CPI)']['value']}% (trending {MARKET_DATA['economic_indicators']['Inflation (CPI)']['trend']})
- Unemployment: {MARKET_DATA['economic_indicators']['Unemployment']['value']}%

Recent News:
{news_text}
"""


def _create_insights_prompt(
    user_profile: Dict[str, Any],
    portfolio: Dict[str, float],
    impact: Dict[str, Any],
    market_context: str,
    insight_type: str
) -> str:
    """Create prompt for AI market insights"""

    name = user_profile.get("name", "there")
    age = user_profile.get("age", 25)
    risk_tolerance = user_profile.get("quiz", {}).get("risk_tolerance", "medium")

    return f"""You are an expert financial analyst providing personalized market insights. Explain market movements in SIMPLE, EASY-TO-UNDERSTAND language.

USER PROFILE:
- Name: {name}
- Age: {age}
- Risk Tolerance: {risk_tolerance}
- Portfolio Change Today: {impact['total_portfolio_change']:+.2f}%

{market_context}

TASK:
Generate a personalized {insight_type} market update in JSON format with these keys:

1. "greeting": Personalized greeting mentioning their portfolio performance
2. "main_insight": THE most important market movement that affected their portfolio (2-3 sentences, simple language)
3. "portfolio_impact_explanation": Explain WHY their portfolio changed (use specific percentages, relate to their ETFs)
4. "whats_happening": Array of 2-3 key market events explained simply:
   - "event": What happened (e.g., "Tech stocks rallied")
   - "simple_explanation": Why it matters in plain English
   - "impact_on_you": How it affects THEIR portfolio specifically
5. "looking_ahead": What to watch for in the coming days/week
6. "should_i_worry": Boolean + brief explanation if they should be concerned
7. "opportunity": Any actionable insight or opportunity

RULES:
- Use SIMPLE language (explain like they're new to investing)
- Always relate back to THEIR specific portfolio
- Use percentages and numbers for clarity
- Be encouraging, not alarming
- Avoid jargon - if you must use a term, explain it
- Keep each point concise but informative

Output ONLY valid JSON, no additional text."""


def _call_chat(prompt: str) -> str:
    """Call LLM for market insights"""
    messages = [
        {"role": "system", "content": "You are an expert financial analyst who explains markets in simple, clear language."},
        {"role": "user", "content": prompt},
    ]

    resp = client.chat.completions.create(
        model=MODEL_ID,
        messages=messages,
        max_tokens=MAX_NEW_TOKENS,
        temperature=TEMPERATURE,
    )

    return (resp.choices[0].message.content or "").strip()


def _parse_insights(ai_response: str) -> Dict[str, Any]:
    """Parse AI response into structured insights"""
    try:
        # Extract JSON from response
        start_idx = ai_response.find('{')
        end_idx = ai_response.rfind('}') + 1

        if start_idx != -1 and end_idx > start_idx:
            json_str = ai_response[start_idx:end_idx]
            return json.loads(json_str)
        else:
            # Fallback
            return {
                "greeting": "Here's your market update!",
                "main_insight": "Markets showed mixed performance today with technology leading gains.",
                "portfolio_impact_explanation": "Your diversified portfolio benefited from tech sector strength.",
                "whats_happening": [],
                "looking_ahead": "Continue monitoring your portfolio's performance.",
                "should_i_worry": False,
                "opportunity": "Stay the course with your long-term strategy."
            }
    except Exception:
        return {
            "greeting": "Here's your market update!",
            "main_insight": "Markets were active today.",
            "portfolio_impact_explanation": "Your portfolio moved with the broader market.",
            "whats_happening": [],
            "looking_ahead": "We'll keep you updated.",
            "should_i_worry": False,
            "opportunity": "Maintain your investment discipline."
        }


def _generate_market_summary() -> Dict[str, Any]:
    """Generate quick market summary"""
    sp500 = MARKET_DATA["indices"]["S&P 500"]
    nasdaq = MARKET_DATA["indices"]["NASDAQ"]
    bonds = MARKET_DATA["bonds"]["10-Year Treasury"]

    return {
        "sp500_change": sp500["change_percent"],
        "nasdaq_change": nasdaq["change_percent"],
        "bond_yield": bonds["yield_percent"],
        "market_sentiment": "bullish" if sp500["change_percent"] > 0.5 else "bearish" if sp500["change_percent"] < -0.5 else "neutral",
        "top_sector": max(MARKET_DATA["sectors"].items(), key=lambda x: x[1]["change_percent"])[0]
    }


def _generate_action_items(impact: Dict[str, Any], context: str) -> List[str]:
    """Generate actionable items for the user"""
    actions = []

    portfolio_change = impact["total_portfolio_change"]

    if abs(portfolio_change) > 2:
        actions.append(f"Portfolio moved significantly ({portfolio_change:+.1f}%) - this is normal market volatility")

    if portfolio_change > 1:
        actions.append("Great day! Stay disciplined - don't get overexcited by short-term gains")
    elif portfolio_change < -1:
        actions.append("Portfolio dipped - remember your long-term strategy, don't panic sell")

    # Check if rebalancing might be needed
    best = impact.get("best_performer")
    worst = impact.get("worst_performer")
    if best and worst and (best["change_percent"] - worst["change_percent"]) > 5:
        actions.append("Large divergence between holdings - review if rebalancing is needed")

    actions.append("Continue your regular dollar-cost averaging schedule")

    return actions[:3]  # Return top 3 action items


def _calculate_next_update(insight_type: str) -> str:
    """Calculate when next update will be available"""
    now = datetime.now()

    if insight_type == "daily":
        # Next market close (4 PM ET)
        next_update = now.replace(hour=16, minute=0, second=0, microsecond=0)
        if now.hour >= 16:
            next_update += timedelta(days=1)
    else:  # weekly
        # Next Monday
        days_ahead = 7 - now.weekday()
        next_update = now + timedelta(days=days_ahead)
        next_update = next_update.replace(hour=16, minute=0, second=0, microsecond=0)

    return next_update.strftime("%Y-%m-%d %H:%M:%S")


# Example usage
if __name__ == "__main__":
    import os

    assert os.getenv("HUGGINGFACEHUB_API_TOKEN"), "Set HUGGINGFACEHUB_API_TOKEN in your environment."

    # Example user profile
    user_profile = {
        "name": "Alex",
        "age": 28,
        "quiz": {"risk_tolerance": "medium"}
    }

    # Example portfolio (70% stocks, 30% bonds)
    portfolio = {
        "VOO": 40,  # 40% S&P 500
        "VTI": 20,  # 20% Total Market
        "VEA": 10,  # 10% International
        "BND": 30   # 30% Bonds
    }

    insights = generate_market_insights(user_profile, portfolio, "daily")
    print(json.dumps(insights, indent=2))
