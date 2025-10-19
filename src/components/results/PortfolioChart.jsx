import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = {
  stocks: "#4F46E5",
  bonds: "#10B981",
  cash: "#F59E0B",
  alternatives: "#8B5CF6"
};

export default function PortfolioChart({ portfolio }) {
  const data = [
    { name: "Stocks", value: portfolio?.stocks || 0, color: COLORS.stocks },
    { name: "Bonds", value: portfolio?.bonds || 0, color: COLORS.bonds },
    { name: "Cash", value: portfolio?.cash || 0, color: COLORS.cash },
    { name: "Alternatives", value: portfolio?.alternatives || 0, color: COLORS.alternatives }
  ].filter(item => item.value > 0);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Asset Allocation</CardTitle>
        <p className="text-gray-600">Your diversified investment portfolio</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown */}
        <div className="mt-6 space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-gray-900">{item.name}</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}