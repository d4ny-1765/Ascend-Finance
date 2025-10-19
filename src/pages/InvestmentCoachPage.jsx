import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import InvestmentCoach from "../components/investment/InvestmentCoach";
import { Brain, TrendingUp, Target } from "lucide-react";

export default function InvestmentCoachPage() {
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-96 mb-8" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  if (!quizResponse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600">Please complete your financial profile first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                AI Investment Coach
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Personalized stock & ETF recommendations powered by artificial intelligence
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Capacity</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${quizResponse.monthly_investment_capacity?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-indigo-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Target className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Goal Target</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${quizResponse.goal_target_amount?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-pink-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Brain className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risk Level</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {quizResponse.quiz?.risk_tolerance || 'Medium'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Investment Coach Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <InvestmentCoach
            userProfile={quizResponse}
            monthlyCapacity={quizResponse.monthly_investment_capacity}
            goalAmount={quizResponse.goal_target_amount}
            goalTimelineMonths={quizResponse.goal_timeline_years * 12}
          />
        </motion.div>
      </div>
    </div>
  );
}
