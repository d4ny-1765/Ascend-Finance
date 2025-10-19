import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Brain,
  DollarSign,
  PieChart,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateInvestmentRecommendations } from "@/api/investmentCoachService";
import BrokerageAccountModal from "./BrokerageAccountModal";

const InvestmentCoach = ({ userProfile, monthlyCapacity, goalAmount, goalTimelineMonths }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Call the investment coach API
  const generateRecommendations = async () => {
    setIsLoading(true);

    try {
      const result = await generateInvestmentRecommendations({
        userProfile,
        monthlyCapacity,
        goalAmount,
        goalTimelineMonths
      });

      setRecommendations(result);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setIsLoading(false);
      // Could show an error message to the user here
    }
  };

  // Legacy mock function for reference (now handled by API service)
  const generateRecommendationsMock = async () => {
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const mockRecommendations = {
        success: true,
        risk_level: userProfile?.quiz?.risk_tolerance || "medium",
        allocation: {
          total_stocks: 70,
          total_bonds: 30,
          breakdown: {
            us_large_cap: 35,
            us_small_mid: 14,
            international: 14,
            emerging_growth: 7,
            bonds: 30
          }
        },
        recommended_etfs: [
          {
            symbol: "VOO",
            name: "Vanguard S&P 500 ETF",
            type: "Large Cap Equity",
            expense_ratio: 0.03,
            allocation_percent: 35
          },
          {
            symbol: "VTI",
            name: "Vanguard Total Stock Market ETF",
            type: "Total Market",
            expense_ratio: 0.03,
            allocation_percent: 20
          },
          {
            symbol: "VEA",
            name: "Vanguard FTSE Developed Markets ETF",
            type: "International",
            expense_ratio: 0.05,
            allocation_percent: 15
          },
          {
            symbol: "BND",
            name: "Vanguard Total Bond Market ETF",
            type: "Bond",
            expense_ratio: 0.03,
            allocation_percent: 30
          }
        ],
        ai_insights: {
          greeting: `Hi ${userProfile?.name || 'there'}! Let's build your personalized investment strategy.`,
          strategy_overview: "Based on your age, risk tolerance, and goals, I recommend a balanced portfolio focusing on low-cost index funds with automatic rebalancing.",
          specific_recommendations: [
            {
              symbol: "VOO",
              name: "Vanguard S&P 500 ETF",
              allocation_percent: 35,
              reasoning: "Core holding providing broad US market exposure with ultra-low fees. Perfect for long-term wealth building."
            },
            {
              symbol: "VTI",
              name: "Vanguard Total Stock Market ETF",
              allocation_percent: 20,
              reasoning: "Complements VOO with exposure to mid and small-cap stocks, increasing diversification across the entire US market."
            },
            {
              symbol: "VEA",
              name: "Vanguard FTSE Developed Markets ETF",
              allocation_percent: 15,
              reasoning: "International diversification reduces US-specific risk and provides exposure to developed economies globally."
            },
            {
              symbol: "BND",
              name: "Vanguard Total Bond Market ETF",
              allocation_percent: 30,
              reasoning: "Provides stability and income, balancing the volatility of stocks while maintaining competitive returns."
            }
          ],
          action_steps: [
            "Open a brokerage account (Vanguard, Fidelity, or Schwab recommended for low fees)",
            `Set up automatic monthly investments of $${monthlyCapacity || 500}`,
            "Enable dividend reinvestment (DRIP) on all holdings",
            "Schedule quarterly portfolio reviews (every 3 months)",
            "Consider increasing contributions when you get a raise"
          ],
          risk_considerations: [
            "Markets can decline 20-30% during recessions - stay invested through volatility",
            "Your portfolio may experience temporary losses, especially in the short term",
            "Avoid panic selling during market downturns - historically markets recover"
          ],
          rebalancing_schedule: "Review quarterly, rebalance if any position drifts more than 5% from target allocation"
        },
        monthly_investment_breakdown: [
          { etf: "VOO", name: "Vanguard S&P 500 ETF", allocation_percent: 35, monthly_amount: (monthlyCapacity || 500) * 0.35 },
          { etf: "VTI", name: "Vanguard Total Stock Market ETF", allocation_percent: 20, monthly_amount: (monthlyCapacity || 500) * 0.20 },
          { etf: "VEA", name: "Vanguard FTSE Developed Markets ETF", allocation_percent: 15, monthly_amount: (monthlyCapacity || 500) * 0.15 },
          { etf: "BND", name: "Vanguard Total Bond Market ETF", allocation_percent: 30, monthly_amount: (monthlyCapacity || 500) * 0.30 }
        ],
        rebalancing_suggestions: [
          "Review portfolio quarterly to maintain target allocation",
          "Rebalance when any position drifts more than 5% from target",
          "Consider tax-loss harvesting during rebalancing",
          "Set up automatic investments for dollar-cost averaging"
        ]
      };

      setRecommendations(mockRecommendations);
      setIsLoading(false);
    }, 2000);
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      low: "bg-blue-100 text-blue-800 border-blue-300",
      medium: "bg-amber-100 text-amber-800 border-amber-300",
      high: "bg-red-100 text-red-800 border-red-300"
    };
    return colors[riskLevel] || colors.medium;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-600 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  AI Investment Coach
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Personalized ETF recommendations powered by AI
                </p>
              </div>
            </div>
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          {!recommendations ? (
            <div className="text-center py-8">
              <div className="mb-6">
                <TrendingUp className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to optimize your investments?
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Get AI-powered recommendations for stocks and ETFs tailored to your goals,
                  risk level, and timeline. I'll analyze your profile and suggest specific
                  investments with clear explanations.
                </p>
              </div>
              <Button
                onClick={generateRecommendations}
                disabled={isLoading}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Your Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Investment Plan
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">Investment Plan Generated</p>
                  <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleString()}</p>
                </div>
              </div>
              <Button
                onClick={generateRecommendations}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations Display */}
      <AnimatePresence>
        {recommendations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="allocation">Allocation</TabsTrigger>
                <TabsTrigger value="actions">Action Plan</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      Strategy Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                      <p className="text-lg text-gray-800 leading-relaxed">
                        {recommendations.ai_insights.greeting}
                      </p>
                      <p className="text-gray-700 mt-3 leading-relaxed">
                        {recommendations.ai_insights.strategy_overview}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <PieChart className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-gray-900">Risk Level</span>
                        </div>
                        <Badge className={`${getRiskColor(recommendations.risk_level)} capitalize`}>
                          {recommendations.risk_level} Risk
                        </Badge>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-gray-900">Monthly Investment</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          ${monthlyCapacity?.toLocaleString() || '500'}
                        </p>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">Asset Mix</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {recommendations.allocation.total_stocks}% Stocks / {recommendations.allocation.total_bonds}% Bonds
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Considerations */}
                <Card className="border-0 shadow-lg border-l-4 border-l-amber-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      Important Considerations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {recommendations.ai_insights.risk_considerations.map((risk, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-4">
                {recommendations.ai_insights.specific_recommendations.map((rec, idx) => (
                  <motion.div
                    key={rec.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className="bg-indigo-600 text-white text-lg px-3 py-1">
                                {rec.symbol}
                              </Badge>
                              <h3 className="text-xl font-bold text-gray-900">
                                {rec.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <PieChart className="w-4 h-4" />
                                {rec.allocation_percent}% of portfolio
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                ${((monthlyCapacity || 500) * rec.allocation_percent / 100).toFixed(2)}/month
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-purple-600">
                              {rec.allocation_percent}%
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Why this investment?</p>
                          <p className="text-gray-800 leading-relaxed">{rec.reasoning}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              {/* Allocation Tab */}
              <TabsContent value="allocation" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Monthly Investment Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendations.monthly_investment_breakdown.map((item) => (
                        <div key={item.etf} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-semibold text-gray-900">{item.etf}</span>
                              <span className="text-sm text-gray-600 ml-2">{item.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900">
                                ${item.monthly_amount.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {item.allocation_percent}%
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-500"
                              style={{ width: `${item.allocation_percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Monthly Investment</span>
                        <span className="text-purple-600">
                          ${monthlyCapacity?.toFixed(2) || '500.00'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle>Rebalancing Strategy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">
                      {recommendations.ai_insights.rebalancing_schedule}
                    </p>
                    <ul className="space-y-2">
                      {recommendations.rebalancing_suggestions.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Action Plan Tab */}
              <TabsContent value="actions" className="space-y-4">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      Your Action Plan
                    </CardTitle>
                    <p className="text-gray-600 mt-2">
                      Follow these steps to start building your investment portfolio
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendations.ai_insights.action_steps.map((step, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 leading-relaxed">{step}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-600 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Ready to Start Investing?
                        </h3>
                        <p className="text-gray-700 mb-4">
                          Remember: The best time to start investing was yesterday.
                          The second best time is today. Start small, stay consistent,
                          and let compound interest work its magic!
                        </p>
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => setShowAccountModal(true)}
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Open Brokerage Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brokerage Account Opening Modal */}
      <BrokerageAccountModal
        open={showAccountModal}
        onOpenChange={setShowAccountModal}
        userProfile={userProfile}
      />
    </div>
  );
};

export default InvestmentCoach;
