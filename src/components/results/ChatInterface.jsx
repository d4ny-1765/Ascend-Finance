import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatInterface({ quizResponse }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi ${quizResponse.user_name}! 👋 I'm your AI financial advisor. I've reviewed your complete financial profile and personalized plan.

Ask me anything about your portfolio, investment strategies, employer benefits, or any financial questions you have. How can I help you today?`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Calculate additional metrics
      const monthlyIncome = quizResponse.monthly_income || 0;
      const monthlyExpenses = quizResponse.monthly_expenses || 0;
      const monthlySurplus = monthlyIncome - monthlyExpenses;
      const savingsRate = monthlyIncome > 0 ? ((monthlySurplus / monthlyIncome) * 100).toFixed(1) : 0;

      const context = `You are an expert financial advisor chatbot helping a newly employed individual navigate their first "adult" financial responsibilities. You have their complete financial profile and personalized plan.

PLATFORM FEATURES AVAILABLE:

NEW AI Investment Coach Feature:
- IMPORTANT: We now have an AI-Powered Investment Coach available on this platform!
- Users can access it from the Results page or directly at /InvestmentCoach
- The Investment Coach provides:
  * Personalized stock and ETF recommendations based on user's age, risk tolerance, goals
  * Smart portfolio allocation (stocks vs bonds breakdown)
  * Specific ETF recommendations (VOO, VTI, VEA, BND, etc.) with clear explanations
  * Monthly investment breakdown showing exact dollar amounts for each ETF
  * Rebalancing guidance and strategies
  * Dollar-cost averaging recommendations
  * Tax-efficient investing strategies
- The coach analyzes their profile and generates tailored recommendations in seconds
- All recommendations include clear reasoning so users understand WHY each investment fits their situation

NEW Brokerage Account Opening Feature:
- IMPORTANT: Users can now open a brokerage account directly through our platform (dummy/demo version)!
- The feature includes:
  * 4-step guided account opening process
  * Choice of brokers: Principal Securities (BEST CHOICE/Recommended), Vanguard, Fidelity, Schwab, E*TRADE
  * Principal Securities is our TOP recommendation with comprehensive retirement planning and top-rated service
  * Account type selection: Individual, Traditional IRA, Roth IRA, or Joint accounts
  * Complete explanation of tax advantages for each account type
  * Secure form with personal info, address, employment details
  * Multiple funding options: Bank Transfer, Wire Transfer, Check
  * Generates account number upon completion
  * Clear next steps after account creation
- The process is user-friendly and educational, explaining each choice
- Users access it via the "Open Brokerage Account" button in Investment Coach → Action Plan tab

When users ask about:
- "How do I start investing?" → Mention the AI Investment Coach feature
- "What should I invest in?" → Direct them to the Investment Coach
- "How do I open an account?" → Tell them about our Brokerage Account Opening feature
- "Which broker should I use?" → Recommend Principal Securities as the best choice, also mention Vanguard/Fidelity
- "What's an IRA?" or account types → Explain and mention they can open one through our platform
- Anything about ETFs, stocks, portfolio allocation → Reference the Investment Coach

COMPLETE USER PROFILE:

Basic Info:
- Name: ${quizResponse.user_name}
- Age: ${quizResponse.age}
- Employment Duration: ${quizResponse.employment_duration?.replace(/_/g, ' ')}
- State: ${quizResponse.state}
- Annual Salary: $${quizResponse.annual_salary?.toLocaleString()}
- Marital Status: ${quizResponse.marital_status}
- Top Concerns: ${(quizResponse.top_financial_concerns || []).map(c => c.replace(/_/g, ' ')).join(", ")}

Current Finances:
- Monthly Take-Home: $${monthlyIncome.toLocaleString()}
- Monthly Expenses: $${monthlyExpenses.toLocaleString()}
- Monthly Surplus: $${monthlySurplus.toLocaleString()}
- Savings Rate: ${savingsRate}%
- Current Savings: $${quizResponse.current_savings?.toLocaleString() || 0}
- Emergency Fund Coverage: ${(quizResponse.emergency_fund_plan?.current_coverage_months || 0).toFixed(1)} months

Debt Situation:
- Debt Type: ${quizResponse.debt_type || 'None'}
- Total Debt: $${quizResponse.debt_amount?.toLocaleString() || 0}
- Monthly Payment: $${quizResponse.debt_monthly_payment?.toLocaleString() || 0}
- Interest Rate: ${quizResponse.debt_interest_rate || 0}%
${quizResponse.debt_payoff_strategy ? `- Payoff Strategy: ${quizResponse.debt_payoff_strategy.strategy}
- Recommended Payment: $${quizResponse.debt_payoff_strategy.monthly_payment_suggestion?.toLocaleString()}
- Timeline: ${quizResponse.debt_payoff_strategy.payoff_timeline_months} months` : ''}

Employer Benefits:
- Has Health Insurance: ${quizResponse.has_employer_health_insurance ? "Yes" : "No"}
- Enrolled: ${quizResponse.enrolled_in_health_insurance ? "Yes" : "No"}
- Monthly Premium: $${quizResponse.health_insurance_premium || 0}
- Has HSA/FSA: ${quizResponse.has_hsa_fsa ? "Yes" : "No"}
- Has 401k: ${quizResponse.has_employer_retirement ? "Yes" : "No"}
- Employer Match: ${quizResponse.employer_match_percentage || 0}%
- Currently Contributing: ${quizResponse.contributing_to_retirement ? "Yes" : "No"}
- Current Contribution: $${quizResponse.retirement_contribution_amount || 0}/month

Retirement Plan:
${quizResponse.retirement_strategy ? `- Recommended Monthly: $${quizResponse.retirement_strategy.recommended_monthly?.toLocaleString()}
- Employer Match Value: $${quizResponse.retirement_strategy.employer_match_value?.toLocaleString()}
- Projected at 65: $${quizResponse.retirement_strategy.projected_at_65?.toLocaleString()}
- Account Types: ${(quizResponse.retirement_strategy.account_recommendations || []).join(", ")}` : 'Not calculated yet'}

Emergency Fund Plan:
${quizResponse.emergency_fund_plan ? `- Target: $${quizResponse.emergency_fund_plan.target_amount?.toLocaleString()}
- Current Coverage: ${quizResponse.emergency_fund_plan.current_coverage_months?.toFixed(1)} months
- Monthly Contribution: $${quizResponse.emergency_fund_plan.monthly_contribution?.toLocaleString()}
- Timeline: ${quizResponse.emergency_fund_plan.timeline_months} months` : 'Not calculated yet'}

Financial Goal:
- Goal: ${quizResponse.financial_goal_description || 'Not specified'}
- Target Amount: $${quizResponse.goal_target_amount?.toLocaleString() || 0}
- Timeline: ${quizResponse.goal_timeline_years || 0} years

Portfolio Allocation:
${quizResponse.portfolio_recommendation ? `- Stocks: ${quizResponse.portfolio_recommendation.stocks}%
- Bonds: ${quizResponse.portfolio_recommendation.bonds}%
- Cash: ${quizResponse.portfolio_recommendation.cash}%
- Alternatives: ${quizResponse.portfolio_recommendation.alternatives}%` : 'Not calculated yet'}
- Monthly Investment Target: $${quizResponse.monthly_investment_target?.toLocaleString() || 0}

Key Recommendations:
${(quizResponse.key_recommendations || []).map((rec, i) => `${i + 1}. ${rec}`).join("\n")}

Action Checklist (First 30-90 Days):
${(quizResponse.action_checklist || []).map((item, i) => `${i + 1}. ${item}`).join("\n")}

Financial Health Score: ${quizResponse.financial_health_score || 'Not calculated'}/100

USER'S QUESTION: ${userMessage}

INSTRUCTIONS:
- Provide helpful, personalized, conversational responses
- Reference their specific numbers and situation
- Be encouraging and educational
- Keep responses concise but informative (2-4 paragraphs max)
- If they ask "what if" questions, do calculations based on their data
- Explain financial concepts in simple, jargon-free terms
- Suggest specific, actionable next steps
- If they're confused about recommendations, explain the reasoning clearly
- Help them understand tradeoffs (e.g., paying debt vs investing)
- Be empathetic to the overwhelming nature of new employment finances
- Use their name occasionally for personalization
- IMPORTANT: Answer questions about platform features (Investment Coach, Brokerage Account Opening)
- If asked about account opening, explain the 4-step process in detail
- If asked about brokers, recommend Principal Securities as the best choice
- If asked about the Investment Coach, explain how it works and encourage them to try it
- You CAN and SHOULD answer questions about how to use this platform's features
- Don't restrict yourself to only traditional financial advice - help users navigate the platform too!`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: context
      });

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I apologize, but I encountered an error. Please try asking your question again." 
      }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-indigo-600" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-sm">
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about your portfolio..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}