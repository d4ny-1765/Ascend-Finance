import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function FinancialBreakdown({ quizResponse }) {
  const income = quizResponse.monthly_income || 0;
  const expenses = quizResponse.monthly_expenses || 0;
  const surplus = income - expenses;
  const savingsRate = income > 0 ? ((surplus / income) * 100).toFixed(1) : 0;

  const breakdown = [
    {
      label: "Emergency Fund",
      amount: quizResponse.emergency_fund_recommendation?.monthly_contribution || 0,
      color: "bg-blue-500",
      icon: "🛡️"
    },
    {
      label: "Debt Payment",
      amount: quizResponse.debt_payoff_strategy?.monthly_payment_suggestion || 0,
      color: "bg-red-500",
      icon: "💳"
    },
    {
      label: "Retirement",
      amount: quizResponse.retirement_projection?.recommended_monthly || 0,
      color: "bg-purple-500",
      icon: "🏖️"
    },
    {
      label: "Goal Savings",
      amount: Math.max(0, (quizResponse.monthly_investment_target || 0) - 
        (quizResponse.emergency_fund_recommendation?.monthly_contribution || 0) -
        (quizResponse.debt_payoff_strategy?.monthly_payment_suggestion || 0) -
        (quizResponse.retirement_projection?.recommended_monthly || 0)),
      color: "bg-green-500",
      icon: "🎯"
    }
  ].filter(item => item.amount > 0);

  const totalAllocated = breakdown.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-indigo-600" />
          Monthly Budget Allocation
        </CardTitle>
        <p className="text-gray-600">How to distribute your ${quizResponse.monthly_investment_capacity?.toLocaleString()} monthly capacity</p>
      </CardHeader>
      <CardContent>
        {/* Income vs Expenses */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Income</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">${income.toLocaleString()}</div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">Expenses</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">${expenses.toLocaleString()}</div>
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="text-sm font-medium text-indigo-700 mb-1">Savings Rate</div>
            <div className="text-2xl font-bold text-gray-900">{savingsRate}%</div>
          </div>
        </div>

        {/* Allocation Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Recommended Allocation:</h4>
          {breakdown.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">${item.amount.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} transition-all duration-500`}
                  style={{ width: `${(item.amount / totalAllocated) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {((item.amount / totalAllocated) * 100).toFixed(0)}% of your monthly budget
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Allocated</span>
            <span className="text-2xl font-bold text-indigo-600">${totalAllocated.toLocaleString()}</span>
          </div>
          {totalAllocated < quizResponse.monthly_investment_capacity && (
            <p className="text-sm text-gray-600 mt-2">
              You have ${(quizResponse.monthly_investment_capacity - totalAllocated).toLocaleString()} extra monthly capacity. Consider increasing one of the categories above.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}