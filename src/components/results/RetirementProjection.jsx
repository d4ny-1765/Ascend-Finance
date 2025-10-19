import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Briefcase } from "lucide-react";

export default function RetirementProjection({ projection, currentAge }) {
  if (!projection) return null;

  const yearsToRetirement = 65 - currentAge;
  const monthlyContribution = projection.recommended_monthly || 0;
  const projectedValue = projection.projected_at_65 || 0;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-purple-600" />
          Retirement Projection
        </CardTitle>
        <p className="text-gray-600">Planning for your future</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Projection */}
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="text-sm text-gray-600 mb-2">Projected Value at Age 65</div>
            <div className="text-4xl font-bold text-purple-600 mb-1">
              ${projectedValue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              In {yearsToRetirement} years with ${monthlyContribution}/month
            </div>
          </div>

          {/* Monthly Contribution */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Recommended Monthly</div>
              <div className="text-2xl font-bold text-gray-900">
                ${monthlyContribution.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Years Until 65</div>
              <div className="text-2xl font-bold text-gray-900">
                {yearsToRetirement}
              </div>
            </div>
          </div>

          {/* Account Types */}
          {projection.account_types && projection.account_types.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="font-semibold text-gray-900 mb-3">Recommended Accounts:</div>
              <div className="space-y-2">
                {projection.account_types.map((account, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700">{account}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Note */}
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> This projection assumes a 7% average annual return. 
              Starting early is key - even small contributions grow significantly over time thanks to compound interest.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}