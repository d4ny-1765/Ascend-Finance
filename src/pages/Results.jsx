
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, GraduationCap, Briefcase, Target, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import PortfolioChart from "../components/results/PortfolioChart";
import RecommendationsList from "../components/results/RecommendationsList";
import FinancialBreakdown from "../components/results/FinancialBreakdown";
import DebtPayoffPlan from "../components/results/DebtPayoffPlan";
import EmergencyFundProgress from "../components/results/EmergencyFundProgress";
import RetirementProjection from "../components/results/RetirementProjection";
import FloatingChat from "../components/results/FloatingChat"; // New import
import InvestmentCoach from "../components/investment/InvestmentCoach";

export default function Results() {
  const urlParams = new URLSearchParams(window.location.search);
  const responseId = urlParams.get("id");

  const { data: quizResponse, isLoading } = useQuery({
    queryKey: ['quizResponse', responseId],
    queryFn: async () => {
      const responses = await base44.entities.QuizResponse.filter({ id: responseId });
      return responses[0];
    },
    enabled: !!responseId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!quizResponse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Not Found</h1>
          <p className="text-gray-600">Please complete the quiz and form first.</p>
        </div>
      </div>
    );
  }

  const healthScore = quizResponse.financial_health_score || 0;
  const healthColor = healthScore >= 70 ? "text-green-600" : healthScore >= 50 ? "text-yellow-600" : "text-red-600";
  const healthBgColor = healthScore >= 70 ? "bg-green-600" : healthScore >= 50 ? "bg-yellow-600" : "bg-red-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full mb-4">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Your Plan is Ready!</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Your Personalized Financial Plan
          </h1>
          <p className="text-xl text-gray-600">
            Here's your roadmap to achieving ${quizResponse.goal_target_amount?.toLocaleString()} in {quizResponse.goal_timeline_years} years
          </p>
        </motion.div>

        {/* Financial Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Financial Health Score</h3>
                  <p className="text-gray-600 mb-4">Your overall financial wellness rating</p>
                  <div className="flex items-center gap-4">
                    <div className={`text-6xl font-bold ${healthColor}`}>{healthScore}</div>
                    <div className="flex-1">
                      <Progress value={healthScore} className="h-3" />
                      <p className="text-sm text-gray-600 mt-2">
                        {healthScore >= 70 ? "Excellent! You're on a strong path." :
                         healthScore >= 50 ? "Good! Room for improvement." :
                         "Needs attention. Let's build a stronger foundation."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-indigo-600">
                      {quizResponse.has_emergency_fund ? "✓" : "○"}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Emergency Fund</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">
                      {quizResponse.debt_amount > 0 ? (quizResponse.debt_amount < 10000 ? "△" : "○") : "✓"}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Debt Status</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-teal-600">
                      {((quizResponse.monthly_income - quizResponse.monthly_expenses) / quizResponse.monthly_income * 100) >= 20 ? "✓" : "○"}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Savings Rate</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                      {quizResponse.employer_match_401k ? "✓" : "○"}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Retirement</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Monthly Plan</CardTitle>
                <DollarSign className="w-5 h-5 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                ${quizResponse.monthly_investment_target?.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">Recommended total</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Your Capacity</CardTitle>
                <DollarSign className="w-5 h-5 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                ${quizResponse.monthly_investment_capacity?.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">Available monthly</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Goal Target</CardTitle>
                <Target className="w-5 h-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                ${quizResponse.goal_target_amount?.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">In {quizResponse.goal_timeline_years} years</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
                {quizResponse.college_or_employed === "college" ? (
                  <GraduationCap className="w-5 h-5 text-orange-600" />
                ) : (
                  <Briefcase className="w-5 h-5 text-orange-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 capitalize">
                {quizResponse.college_or_employed}
              </div>
              <p className="text-sm text-gray-600 mt-1 capitalize">
                Age {quizResponse.current_age}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Investment Coach - NEW FEATURE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <InvestmentCoach
            userProfile={quizResponse}
            monthlyCapacity={quizResponse.monthly_investment_capacity}
            goalAmount={quizResponse.goal_target_amount}
            goalTimelineMonths={quizResponse.goal_timeline_years * 12}
          />
        </motion.div>

        {/* Main Content Grid - No longer has chat in it */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <PortfolioChart portfolio={quizResponse.portfolio_recommendation} />
          <FinancialBreakdown quizResponse={quizResponse} />
          {quizResponse.debt_amount > 0 && (
            <DebtPayoffPlan strategy={quizResponse.debt_payoff_strategy} debtAmount={quizResponse.debt_amount} />
          )}
          <EmergencyFundProgress recommendation={quizResponse.emergency_fund_plan} />
          {quizResponse.retirement_strategy && (
            <RetirementProjection projection={quizResponse.retirement_strategy} currentAge={quizResponse.age} />
          )}
        </div>

        {/* Recommendations */}
        <RecommendationsList recommendations={quizResponse.key_recommendations} />
      </div>

      {/* Floating Chat Component */}
      <FloatingChat quizResponse={quizResponse} />
    </div>
  );
}
