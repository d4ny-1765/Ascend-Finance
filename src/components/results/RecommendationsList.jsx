import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function RecommendationsList({ recommendations }) {
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Personalized Recommendations</CardTitle>
        <p className="text-gray-600">Action steps to achieve your financial goals</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations?.map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{recommendation}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}