/**
 * Investment Coach API Service
 * Handles communication between React frontend and Python backend
 */

const API_BASE_URL = import.meta.env.VITE_INVESTMENT_API_URL || 'http://localhost:8000';

/**
 * Generate investment recommendations from the AI coach
 * @param {Object} params - Request parameters
 * @param {Object} params.userProfile - User's financial profile
 * @param {number} params.monthlyCapacity - Monthly investment capacity
 * @param {number} params.goalAmount - Financial goal amount
 * @param {number} params.goalTimelineMonths - Timeline to reach goal in months
 * @returns {Promise<Object>} Investment recommendations
 */
export async function generateInvestmentRecommendations({
  userProfile,
  monthlyCapacity,
  goalAmount,
  goalTimelineMonths
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/investment-coach/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_profile: userProfile,
        monthly_capacity: monthlyCapacity,
        goal_amount: goalAmount,
        goal_timeline_months: goalTimelineMonths
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating investment recommendations:', error);

    // Return mock data if API is unavailable (for development)
    return getMockRecommendations(userProfile, monthlyCapacity, goalAmount, goalTimelineMonths);
  }
}

/**
 * Get ETF information
 * @param {string} symbol - ETF symbol
 * @returns {Promise<Object>} ETF details
 */
export async function getETFInfo(symbol) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/investment-coach/etf/${symbol}`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ETF info for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get market trends and analysis
 * @returns {Promise<Object>} Market analysis
 */
export async function getMarketAnalysis() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/investment-coach/market-analysis`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching market analysis:', error);
    return null;
  }
}

/**
 * Generate rebalancing suggestions
 * @param {Object} currentPortfolio - Current portfolio allocation
 * @param {Object} targetAllocation - Target allocation percentages
 * @returns {Promise<Object>} Rebalancing suggestions
 */
export async function getRebalancingSuggestions(currentPortfolio, targetAllocation) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/investment-coach/rebalance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_portfolio: currentPortfolio,
        target_allocation: targetAllocation
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating rebalancing suggestions:', error);
    return null;
  }
}

/**
 * Diversified ETF Database - Provider-neutral recommendations
 */
const ETF_OPTIONS = {
  large_cap: [
    { symbol: "VOO", name: "Vanguard S&P 500 ETF", provider: "Vanguard", expense: 0.03 },
    { symbol: "IVV", name: "iShares Core S&P 500 ETF", provider: "BlackRock", expense: 0.03 },
    { symbol: "SPLG", name: "SPDR Portfolio S&P 500 ETF", provider: "State Street", expense: 0.02 },
  ],
  total_market: [
    { symbol: "VTI", name: "Vanguard Total Stock Market ETF", provider: "Vanguard", expense: 0.03 },
    { symbol: "ITOT", name: "iShares Core S&P Total US Stock Market ETF", provider: "BlackRock", expense: 0.03 },
    { symbol: "SPTM", name: "SPDR Portfolio S&P 1500 Composite Stock Market ETF", provider: "State Street", expense: 0.03 },
  ],
  international: [
    { symbol: "VEA", name: "Vanguard FTSE Developed Markets ETF", provider: "Vanguard", expense: 0.05 },
    { symbol: "IEFA", name: "iShares Core MSCI EAFE ETF", provider: "BlackRock", expense: 0.07 },
    { symbol: "SCHF", name: "Schwab International Equity ETF", provider: "Schwab", expense: 0.06 },
  ],
  bonds: [
    { symbol: "BND", name: "Vanguard Total Bond Market ETF", provider: "Vanguard", expense: 0.03 },
    { symbol: "AGG", name: "iShares Core US Aggregate Bond ETF", provider: "BlackRock", expense: 0.03 },
    { symbol: "SCHZ", name: "Schwab US Aggregate Bond ETF", provider: "Schwab", expense: 0.04 },
  ],
  growth: [
    { symbol: "VUG", name: "Vanguard Growth ETF", provider: "Vanguard", expense: 0.04 },
    { symbol: "IWF", name: "iShares Russell 1000 Growth ETF", provider: "BlackRock", expense: 0.19 },
    { symbol: "SCHG", name: "Schwab U.S. Large-Cap Growth ETF", provider: "Schwab", expense: 0.04 },
  ],
  small_cap: [
    { symbol: "VB", name: "Vanguard Small-Cap ETF", provider: "Vanguard", expense: 0.05 },
    { symbol: "IJR", name: "iShares Core S&P Small-Cap ETF", provider: "BlackRock", expense: 0.06 },
    { symbol: "SCHA", name: "Schwab U.S. Small-Cap ETF", provider: "Schwab", expense: 0.04 },
  ],
  emerging: [
    { symbol: "VWO", name: "Vanguard FTSE Emerging Markets ETF", provider: "Vanguard", expense: 0.08 },
    { symbol: "IEMG", name: "iShares Core MSCI Emerging Markets ETF", provider: "BlackRock", expense: 0.09 },
    { symbol: "SCHE", name: "Schwab Emerging Markets Equity ETF", provider: "Schwab", expense: 0.11 },
  ]
};

/**
 * Select diversified ETFs - ensures variety across providers
 */
function selectDiversifiedETFs(riskLevel, stockAllocation) {
  const selectedProviders = new Set();
  const pickETF = (category) => {
    const options = ETF_OPTIONS[category];
    // Try to pick from a provider we haven't used yet
    const unused = options.filter(etf => !selectedProviders.has(etf.provider));
    const selected = unused.length > 0 ? unused[0] : options[0];
    selectedProviders.add(selected.provider);
    return selected;
  };

  const selections = {
    large_cap: pickETF('large_cap'),
    total_market: pickETF('total_market'),
    international: pickETF('international'),
    bonds: pickETF('bonds'),
    growth: riskLevel === 'high' ? pickETF('growth') : null,
    small_cap: riskLevel === 'high' ? pickETF('small_cap') : null,
    emerging: stockAllocation > 60 ? pickETF('emerging') : null
  };

  return Object.fromEntries(Object.entries(selections).filter(([_, v]) => v !== null));
}

/**
 * Mock data generator for development/fallback
 * This provides realistic recommendations when the backend is unavailable
 */
function getMockRecommendations(userProfile, monthlyCapacity, goalAmount, goalTimelineMonths) {
  const riskLevel = userProfile?.quiz?.risk_tolerance || userProfile?.risk_tolerance || "medium";
  const age = userProfile?.age || userProfile?.quiz?.age || userProfile?.current_age || 25;

  // Calculate allocation based on age and risk
  const baseStockAllocation = Math.min(110 - age, 90);
  const riskAdjustment = {
    low: -20,
    medium: 0,
    high: 15
  };

  const stockAllocation = Math.max(20, Math.min(90,
    baseStockAllocation + (riskAdjustment[riskLevel] || 0)
  ));
  const bondAllocation = 100 - stockAllocation;

  // Select diversified ETFs
  const selectedETFs = selectDiversifiedETFs(riskLevel, stockAllocation);

  // Build dynamic allocation based on risk level
  const breakdown = riskLevel === 'low' ? {
    us_large_cap: stockAllocation * 0.60,
    international: stockAllocation * 0.25,
    emerging_growth: stockAllocation * 0.15,
    bonds: bondAllocation
  } : riskLevel === 'high' ? {
    us_large_cap: stockAllocation * 0.30,
    growth: stockAllocation * 0.25,
    small_cap: stockAllocation * 0.20,
    international: stockAllocation * 0.15,
    emerging_growth: stockAllocation * 0.10,
    bonds: bondAllocation
  } : {
    us_large_cap: stockAllocation * 0.40,
    us_total_market: stockAllocation * 0.25,
    international: stockAllocation * 0.20,
    emerging_growth: stockAllocation * 0.15,
    bonds: bondAllocation
  };

  // Build recommended ETFs list dynamically
  const recommended_etfs = [];
  if (riskLevel === 'low') {
    recommended_etfs.push({
      symbol: selectedETFs.large_cap.symbol,
      name: selectedETFs.large_cap.name,
      provider: selectedETFs.large_cap.provider,
      type: "Large Cap Equity",
      expense_ratio: selectedETFs.large_cap.expense,
      allocation_percent: breakdown.us_large_cap
    });
    recommended_etfs.push({
      symbol: selectedETFs.international.symbol,
      name: selectedETFs.international.name,
      provider: selectedETFs.international.provider,
      type: "International",
      expense_ratio: selectedETFs.international.expense,
      allocation_percent: breakdown.international
    });
    if (bondAllocation > 10) {
      recommended_etfs.push({
        symbol: selectedETFs.bonds.symbol,
        name: selectedETFs.bonds.name,
        provider: selectedETFs.bonds.provider,
        type: "Bond",
        expense_ratio: selectedETFs.bonds.expense,
        allocation_percent: breakdown.bonds
      });
    }
  } else if (riskLevel === 'high') {
    recommended_etfs.push({
      symbol: selectedETFs.large_cap.symbol,
      name: selectedETFs.large_cap.name,
      provider: selectedETFs.large_cap.provider,
      type: "Large Cap Equity",
      expense_ratio: selectedETFs.large_cap.expense,
      allocation_percent: breakdown.us_large_cap
    });
    if (selectedETFs.growth) {
      recommended_etfs.push({
        symbol: selectedETFs.growth.symbol,
        name: selectedETFs.growth.name,
        provider: selectedETFs.growth.provider,
        type: "Growth",
        expense_ratio: selectedETFs.growth.expense,
        allocation_percent: breakdown.growth
      });
    }
    if (selectedETFs.small_cap) {
      recommended_etfs.push({
        symbol: selectedETFs.small_cap.symbol,
        name: selectedETFs.small_cap.name,
        provider: selectedETFs.small_cap.provider,
        type: "Small Cap",
        expense_ratio: selectedETFs.small_cap.expense,
        allocation_percent: breakdown.small_cap
      });
    }
    recommended_etfs.push({
      symbol: selectedETFs.international.symbol,
      name: selectedETFs.international.name,
      provider: selectedETFs.international.provider,
      type: "International",
      expense_ratio: selectedETFs.international.expense,
      allocation_percent: breakdown.international
    });
    if (selectedETFs.emerging) {
      recommended_etfs.push({
        symbol: selectedETFs.emerging.symbol,
        name: selectedETFs.emerging.name,
        provider: selectedETFs.emerging.provider,
        type: "Emerging Markets",
        expense_ratio: selectedETFs.emerging.expense,
        allocation_percent: breakdown.emerging_growth
      });
    }
    if (bondAllocation > 5) {
      recommended_etfs.push({
        symbol: selectedETFs.bonds.symbol,
        name: selectedETFs.bonds.name,
        provider: selectedETFs.bonds.provider,
        type: "Bond",
        expense_ratio: selectedETFs.bonds.expense,
        allocation_percent: breakdown.bonds
      });
    }
  } else { // medium risk
    recommended_etfs.push({
      symbol: selectedETFs.large_cap.symbol,
      name: selectedETFs.large_cap.name,
      provider: selectedETFs.large_cap.provider,
      type: "Large Cap Equity",
      expense_ratio: selectedETFs.large_cap.expense,
      allocation_percent: breakdown.us_large_cap
    });
    recommended_etfs.push({
      symbol: selectedETFs.total_market.symbol,
      name: selectedETFs.total_market.name,
      provider: selectedETFs.total_market.provider,
      type: "Total Market",
      expense_ratio: selectedETFs.total_market.expense,
      allocation_percent: breakdown.us_total_market
    });
    recommended_etfs.push({
      symbol: selectedETFs.international.symbol,
      name: selectedETFs.international.name,
      provider: selectedETFs.international.provider,
      type: "International",
      expense_ratio: selectedETFs.international.expense,
      allocation_percent: breakdown.international
    });
    if (selectedETFs.emerging) {
      recommended_etfs.push({
        symbol: selectedETFs.emerging.symbol,
        name: selectedETFs.emerging.name,
        provider: selectedETFs.emerging.provider,
        type: "Emerging Markets",
        expense_ratio: selectedETFs.emerging.expense,
        allocation_percent: breakdown.emerging_growth
      });
    }
    if (bondAllocation > 10) {
      recommended_etfs.push({
        symbol: selectedETFs.bonds.symbol,
        name: selectedETFs.bonds.name,
        provider: selectedETFs.bonds.provider,
        type: "Bond",
        expense_ratio: selectedETFs.bonds.expense,
        allocation_percent: breakdown.bonds
      });
    }
  }

  return {
    success: true,
    risk_level: riskLevel,
    allocation: {
      total_stocks: stockAllocation,
      total_bonds: bondAllocation,
      breakdown
    },
    recommended_etfs: recommended_etfs.filter(etf => etf.allocation_percent > 3), // Only show ETFs with >3% allocation
    ai_insights: {
      greeting: `Hi ${userProfile?.name || userProfile?.quiz?.name || 'there'}! Let's build your personalized investment strategy.`,
      strategy_overview: `Based on your ${riskLevel} risk tolerance and ${age}-year age, I recommend a ${stockAllocation}% stocks / ${bondAllocation}% bonds allocation. This balanced approach focuses on low-cost index funds with automatic rebalancing to help you reach your $${goalAmount?.toLocaleString()} goal in ${Math.round((goalTimelineMonths || 60) / 12)} years.`,
      specific_recommendations: recommended_etfs
        .filter(etf => etf.allocation_percent > 3)
        .map(etf => {
          // Generate reasoning based on ETF type
          let reasoning = "";
          if (etf.type === "Large Cap Equity") {
            reasoning = `Core holding providing broad US large-cap market exposure with low ${etf.expense_ratio}% expense ratio. Tracks the S&P 500 index, giving you ownership in America's largest companies.`;
          } else if (etf.type === "Total Market Equity") {
            reasoning = `Provides complete US market exposure including large, mid, and small-cap stocks, increasing diversification across the entire market including emerging growth companies.`;
          } else if (etf.type === "Growth Equity") {
            reasoning = `Focuses on high-growth companies with strong earnings potential. Higher volatility but offers significant upside for long-term investors.`;
          } else if (etf.type === "Small Cap Equity") {
            reasoning = `Small-cap stocks historically outperform over long periods. Adds growth potential and diversification beyond large-cap holdings.`;
          } else if (etf.type === "International Equity") {
            reasoning = `International diversification reduces US-specific risk and provides exposure to developed economies in Europe, Asia, and Australia.`;
          } else if (etf.type === "Emerging Markets") {
            reasoning = `Emerging markets offer higher growth potential in developing economies. Adds geographic diversification with higher risk/reward.`;
          } else if (etf.type === "Bond") {
            reasoning = `Provides stability and income, balancing the volatility of stocks while maintaining competitive returns. Essential for risk management.`;
          }

          return {
            symbol: etf.symbol,
            name: etf.name,
            allocation_percent: etf.allocation_percent,
            reasoning
          };
        }),
      action_steps: [
        `Open a brokerage account with ${[...new Set(recommended_etfs.map(e => e.provider))].join(', ')} or any major broker offering commission-free ETF trading`,
        `Set up automatic monthly investments of $${monthlyCapacity?.toFixed(2) || '500.00'} on the same day each month`,
        "Enable dividend reinvestment (DRIP) on all holdings to compound your returns",
        "Schedule quarterly portfolio reviews (March, June, September, December)",
        "Consider increasing contributions by 1% whenever you receive a raise or bonus",
        "Keep 3-6 months of expenses in a high-yield savings account before investing aggressively"
      ],
      risk_considerations: [
        "Stock markets can decline 20-40% during recessions - this is normal and temporary. Stay invested through volatility.",
        "Your portfolio may experience short-term losses, but historically the market has always recovered and reached new highs.",
        "Avoid panic selling during market downturns - every major market crash in history has been followed by a recovery.",
        "Don't try to time the market. Time IN the market beats timing the market.",
        `With your ${goalTimelineMonths ? Math.round(goalTimelineMonths / 12) : 5}-year timeline, you have time to recover from market downturns.`
      ],
      rebalancing_schedule: "Review your portfolio quarterly. Rebalance only if any position drifts more than 5% from its target allocation. This maintains your risk profile while minimizing transaction costs."
    },
    monthly_investment_breakdown: recommended_etfs
      .filter(etf => etf.allocation_percent > 3)
      .map(etf => ({
        etf: etf.symbol,
        name: etf.name,
        allocation_percent: etf.allocation_percent,
        monthly_amount: parseFloat(((monthlyCapacity || 500) * etf.allocation_percent / 100).toFixed(2))
      })),
    rebalancing_suggestions: [
      `Review your portfolio quarterly (every 3 months) to maintain your ${stockAllocation}% stocks / ${bondAllocation}% bonds target allocation.`,
      "Rebalance when any asset class drifts more than 5% from its target allocation.",
      "Consider tax-loss harvesting opportunities during rebalancing to offset capital gains.",
      age < 35 ? "At your age, you can afford more market volatility - consider increasing stock allocation during market dips (buying the dip)." : "Focus on maintaining your allocation as you approach retirement age.",
      "Set up automatic investments to take advantage of dollar-cost averaging and reduce the impact of market timing.",
      "Avoid emotional decisions - stick to your quarterly review schedule even during volatile markets."
    ],
    projected_growth: calculateProjectedGrowth(monthlyCapacity, goalTimelineMonths, stockAllocation),
    last_updated: new Date().toISOString()
  };
}

/**
 * Calculate projected portfolio growth
 */
function calculateProjectedGrowth(monthlyInvestment, months, stockAllocation) {
  // Assume historical average returns: stocks ~10%, bonds ~4%
  const stockReturn = 0.10;
  const bondReturn = 0.04;
  const bondAllocation = 100 - stockAllocation;

  // Weighted average return
  const expectedAnnualReturn = (stockAllocation / 100 * stockReturn) + (bondAllocation / 100 * bondReturn);
  const monthlyReturn = expectedAnnualReturn / 12;

  // Future value of annuity formula
  const totalMonths = months || 60;
  const futureValue = monthlyInvestment * (Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn;
  const totalInvested = monthlyInvestment * totalMonths;
  const totalGains = futureValue - totalInvested;

  return {
    total_invested: Math.round(totalInvested),
    projected_value: Math.round(futureValue),
    projected_gains: Math.round(totalGains),
    expected_annual_return: Math.round(expectedAnnualReturn * 100) / 100
  };
}

export default {
  generateInvestmentRecommendations,
  getETFInfo,
  getMarketAnalysis,
  getRebalancingSuggestions
};
