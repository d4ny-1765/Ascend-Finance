import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function EmergencyFundProgress({ recommendation }) {
  if (!recommendation) return null;

  const currentMonths = recommendation.current_coverage_months || 0;
  const targetMonths = 6;
  const progress = Math.min((currentMonths / targetMonths) * 100, 100);
  const isFullyFunded = currentMonths >= targetMonths;

  return (
    <Card className={`border-0 shadow-xl ${isFullyFunded ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-yellow-50 to-amber-50'}`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Shield className={`w-6 h-6 ${isFullyFunded ? 'text-green-600' : 'text-yellow-600'}`} />
          Emergency Fund
        </CardTitle>
        <p className="text-gray-600">Your financial safety net</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            {isFullyFunded ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <div className="font-bold text-green-700">Fully Funded! 🎉</div>
                  <div className="text-sm text-gray-600">You have {currentMonths.toFixed(1)} months of expenses covered</div>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
                <div>
                  <div className="font-bold text-yellow-700">Building Your Safety Net</div>
                  <div className="text-sm text-gray-600">Currently at {currentMonths.toFixed(1)} months of coverage</div>
                </div>
              </>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Progress to 6 months</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-4" />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Target Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                ${recommendation.target_amount?.toLocaleString()}
              </div>
            </div>
            
            {!isFullyFunded && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Monthly Save</div>
                <div className="text-2xl font-bold text-indigo-600">
                  ${recommendation.monthly_contribution?.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Advice */}
          {!isFullyFunded && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-700">
                <strong>Priority:</strong> Building an emergency fund protects you from unexpected expenses. 
                Save ${recommendation.monthly_contribution?.toLocaleString()} monthly to reach 6 months coverage.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}