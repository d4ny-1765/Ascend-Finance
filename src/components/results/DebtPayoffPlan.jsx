import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, TrendingDown, Calendar } from "lucide-react";

export default function DebtPayoffPlan({ strategy, debtAmount }) {
  if (!strategy || debtAmount === 0) return null;

  const monthsToPayoff = strategy.payoff_timeline_months || 0;
  const yearsToPayoff = (monthsToPayoff / 12).toFixed(1);

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-red-600" />
          Debt Payoff Strategy
        </CardTitle>
        <p className="text-gray-600">Your path to becoming debt-free</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Total Debt</div>
              <div className="text-2xl font-bold text-gray-900">${debtAmount.toLocaleString()}</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Monthly Payment</div>
              <div className="text-2xl font-bold text-red-600">
                ${strategy.monthly_payment_suggestion?.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Payoff Timeline</div>
              <div className="text-2xl font-bold text-gray-900">
                {yearsToPayoff} years
              </div>
              <div className="text-xs text-gray-500">{monthsToPayoff} months</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Strategy</div>
              <div className="text-lg font-bold text-gray-900 capitalize">
                {strategy.strategy?.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          {/* Priority Level */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-gray-900">Priority Level</span>
            </div>
            <p className="text-gray-700">{strategy.priority}</p>
          </div>

          {/* Visual Timeline */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-gray-900">Payoff Timeline</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                style={{ width: '10%' }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Now</span>
              <span>Debt Free in {yearsToPayoff} years</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}