import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Loader2, DollarSign, CreditCard, Target, TrendingUp, Shield, Briefcase } from "lucide-react";

export default function Form() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get("quizId");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    monthly_income: "",
    monthly_expenses: "",
    current_savings: "",
    debt_amount: "",
    debt_type: "none",
    debt_monthly_payment: "",
    debt_interest_rate: "",
    has_employer_health_insurance: "",
    enrolled_in_health_insurance: "",
    health_insurance_premium: "",
    has_hsa_fsa: "",
    has_employer_retirement: "",
    employer_match_percentage: "",
    contributing_to_retirement: "",
    retirement_contribution_amount: "",
    financial_goal_description: "",
    goal_target_amount: "",
    goal_timeline_years: "",
    additional_context: ""
  });

  const { data: quizResponse, isLoading: loadingQuiz } = useQuery({
    queryKey: ['quizResponse', quizId],
    queryFn: async () => {
      const responses = await base44.entities.QuizResponse.filter({ id: quizId });
      return responses[0];
    },
    enabled: !!quizId
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Determine which sections to show based on quiz concerns
  const showBenefitsSection = quizResponse?.top_financial_concerns?.includes("understanding_benefits");
  const showDebtSection = quizResponse?.top_financial_concerns?.includes("paying_off_debt");
  const showEmergencyFundFocus = quizResponse?.top_financial_concerns?.includes("emergency_fund");
  const showInvestmentSection = quizResponse?.top_financial_concerns?.includes("investing_future");
  const showBudgetingSection = quizResponse?.top_financial_concerns?.includes("budgeting_tracking");
  const showBigPurchaseSection = quizResponse?.top_financial_concerns?.includes("saving_big_purchase");
  const showTaxesSection = quizResponse?.top_financial_concerns?.includes("taxes_withholdings");
  const showPaycheckSection = quizResponse?.top_financial_concerns?.includes("managing_paycheck");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Calculate key metrics
      const monthlyIncome = parseFloat(formData.monthly_income);
      const monthlyExpenses = parseFloat(formData.monthly_expenses);
      const currentSavings = parseFloat(formData.current_savings);
      const debtAmount = parseFloat(formData.debt_amount || 0);
      const debtInterestRate = parseFloat(formData.debt_interest_rate || 0);
      
      const monthlySurplus = monthlyIncome - monthlyExpenses;
      const savingsRate = (monthlySurplus / monthlyIncome) * 100;
      const emergencyFundTarget = monthlyExpenses * 6;
      const emergencyFundCoverage = currentSavings / monthlyExpenses;

      // Enhanced AI prompt for newly employed individuals
      const portfolioPrompt = `You are an expert financial advisor specializing in helping newly employed college graduates navigate their first "adult" financial responsibilities. Create a comprehensive, actionable financial plan.

USER PROFILE FROM QUIZ:
- Name: ${quizResponse.user_name}
- Age: ${quizResponse.age}
- Employment Duration: ${quizResponse.employment_duration.replace(/_/g, ' ')}
- State: ${quizResponse.state}
- Annual Salary: $${quizResponse.annual_salary.toLocaleString()}
- Marital Status: ${quizResponse.marital_status}
- Top Financial Concerns: ${quizResponse.top_financial_concerns.map(c => c.replace(/_/g, ' ')).join(", ")}

DETAILED FINANCIAL INFORMATION:
Income & Expenses:
- Monthly Take-Home: $${monthlyIncome.toLocaleString()}
- Monthly Expenses: $${monthlyExpenses.toLocaleString()}
- Monthly Surplus: $${monthlySurplus.toLocaleString()}
- Savings Rate: ${savingsRate.toFixed(1)}%
- Current Savings: $${currentSavings.toLocaleString()}
- Emergency Fund Coverage: ${emergencyFundCoverage.toFixed(1)} months

${showDebtSection ? `Debt Situation:
- Debt Type: ${formData.debt_type}
- Total Debt: $${debtAmount.toLocaleString()}
- Monthly Payment: $${parseFloat(formData.debt_monthly_payment || 0).toLocaleString()}
- Interest Rate: ${debtInterestRate}%` : 'No significant debt concerns mentioned.'}

${showBenefitsSection ? `Employer Benefits:
- Has Health Insurance Option: ${formData.has_employer_health_insurance === "true" ? "Yes" : "No"}
- Enrolled in Health Insurance: ${formData.enrolled_in_health_insurance === "true" ? "Yes" : "No"}
- Monthly Premium: $${parseFloat(formData.health_insurance_premium || 0).toLocaleString()}
- Has HSA/FSA: ${formData.has_hsa_fsa === "true" ? "Yes" : "No"}
- Has 401k Option: ${formData.has_employer_retirement === "true" ? "Yes" : "No"}
- Employer Match: ${formData.employer_match_percentage || 0}%
- Currently Contributing to 401k: ${formData.contributing_to_retirement === "true" ? "Yes" : "No"}
- Current Contribution: $${parseFloat(formData.retirement_contribution_amount || 0).toLocaleString()}/month` : 'Employer benefits details not primary concern.'}

${showBigPurchaseSection || showInvestmentSection ? `Financial Goal:
- Goal: ${formData.financial_goal_description}
- Target Amount: $${parseFloat(formData.goal_target_amount || 0).toLocaleString()}
- Timeline: ${formData.goal_timeline_years} years` : ''}

Additional Context: ${formData.additional_context || "None provided"}

INSTRUCTIONS - Create a comprehensive "New Employee Financial Success Plan":

Focus especially on their stated concerns: ${quizResponse.top_financial_concerns.map(c => c.replace(/_/g, ' ')).join(", ")}

1. FINANCIAL HEALTH ASSESSMENT (0-100 score):
   Consider:
   - Emergency fund status (critical for new employees)
   - Debt burden relative to income
   - Savings rate
   - Enrollment in employer benefits
   - Overall financial stability

2. IMMEDIATE ACTION CHECKLIST (First 30-90 Days):
   Provide 5-8 specific, time-sensitive actions directly addressing their concerns.
   ${showBenefitsSection ? 'CRITICAL: Include detailed benefits enrollment steps and deadlines.' : ''}
   ${showDebtSection ? 'CRITICAL: Include specific debt payoff strategy.' : ''}
   ${showEmergencyFundFocus ? 'CRITICAL: Include emergency fund building steps.' : ''}
   ${showPaycheckSection ? 'CRITICAL: Include paycheck management and direct deposit setup.' : ''}
   ${showTaxesSection ? 'CRITICAL: Include W-4 optimization and tax withholding guidance.' : ''}

${showBenefitsSection ? `3. EMPLOYER BENEFITS EXPLANATION (PRIORITY):
   Provide clear, jargon-free explanations:
   - Health Insurance Strategy: Should they enroll? How to compare plans? Explain deductibles, co-pays, HSA vs FSA
   - 401k Strategy: Explain matching, vesting, Roth vs Traditional, contribution limits
   - Other Benefits: Any other recommendations based on their situation` : ''}

4. EMERGENCY FUND BUILDER PLAN:
   - Target: $${emergencyFundTarget.toLocaleString()} (6 months expenses)
   - Current Coverage: ${emergencyFundCoverage.toFixed(1)} months
   - Monthly Contribution Needed: Calculate realistic amount
   - Timeline to Full Funding: Be specific

${showDebtSection ? `5. DEBT ATTACK STRATEGY (PRIORITY):
   - Should they prioritize debt payoff vs investing?
   - If high-interest debt (>6%): Aggressive payoff strategy
   - Monthly payment recommendation
   - Timeline to debt freedom
   - Strategy: Avalanche vs Snowball method` : ''}

6. RETIREMENT JUMPSTART:
   - Minimum to contribute for full employer match
   - Monthly contribution recommendation
   - Account type recommendations (401k, Roth IRA, etc.)
   - Explain the power of starting early
   - Projected value at 65 (use 7% return assumption)

7. INVESTMENT PORTFOLIO ALLOCATION:
   Generate percentages (must sum to 100%):
   - Stocks: Higher for young professionals with long timeline
   - Bonds: Some stability
   - Cash: Emergency fund + short-term goals
   - Alternatives: 0-5% if appropriate
   
   Consider their age (${quizResponse.age}), timeline, and risk capacity

8. MONTHLY BUDGET ALLOCATION:
   Break down their $${monthlySurplus.toLocaleString()} surplus:
   - Emergency Fund: $X
   - Debt Payment (extra): $X
   - 401k Contribution: $X
   - IRA Contribution: $X
   - Goal Savings: $X
   Make it add up to their actual surplus

9. KEY RECOMMENDATIONS (8-10 specific items):
   - Address ALL their top concerns
   - Be specific with dollar amounts and timelines
   - Explain WHY each recommendation matters
   - Acknowledge they're newly employed and learning
   - Make it personal to their situation
   - Include both immediate and long-term advice

Use encouraging, educational language. Acknowledge that adult finances can be overwhelming. Make complex topics simple and actionable.`;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: portfolioPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            financial_health_score: { 
              type: "number",
              description: "Score from 0-100"
            },
            action_checklist: {
              type: "array",
              items: { type: "string" },
              description: "Immediate actions for first 30-90 days"
            },
            benefits_explanation: {
              type: "object",
              properties: {
                health_insurance_advice: { type: "string" },
                retirement_plan_advice: { type: "string" },
                other_benefits_advice: { type: "string" }
              }
            },
            emergency_fund_plan: {
              type: "object",
              properties: {
                target_amount: { type: "number" },
                current_coverage_months: { type: "number" },
                monthly_contribution: { type: "number" },
                timeline_months: { type: "number" }
              }
            },
            debt_payoff_strategy: {
              type: "object",
              properties: {
                priority: { type: "string" },
                monthly_payment_suggestion: { type: "number" },
                payoff_timeline_months: { type: "number" },
                strategy: { type: "string" }
              }
            },
            retirement_strategy: {
              type: "object",
              properties: {
                recommended_monthly: { type: "number" },
                employer_match_value: { type: "number" },
                projected_at_65: { type: "number" },
                account_recommendations: { 
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            portfolio: {
              type: "object",
              properties: {
                stocks: { type: "number" },
                bonds: { type: "number" },
                cash: { type: "number" },
                alternatives: { type: "number" }
              }
            },
            monthly_investment_target: { type: "number" },
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      // Update the quiz response with comprehensive data
      await base44.entities.QuizResponse.update(quizResponse.id, {
        monthly_income: monthlyIncome,
        monthly_expenses: monthlyExpenses,
        current_savings: currentSavings,
        debt_amount: debtAmount,
        debt_type: formData.debt_type,
        debt_monthly_payment: parseFloat(formData.debt_monthly_payment || 0),
        debt_interest_rate: debtInterestRate,
        has_employer_health_insurance: formData.has_employer_health_insurance === "true",
        enrolled_in_health_insurance: formData.enrolled_in_health_insurance === "true",
        health_insurance_premium: parseFloat(formData.health_insurance_premium || 0),
        has_hsa_fsa: formData.has_hsa_fsa === "true",
        has_employer_retirement: formData.has_employer_retirement === "true",
        employer_match_percentage: parseFloat(formData.employer_match_percentage || 0),
        contributing_to_retirement: formData.contributing_to_retirement === "true",
        retirement_contribution_amount: parseFloat(formData.retirement_contribution_amount || 0),
        financial_goal_description: formData.financial_goal_description,
        goal_target_amount: parseFloat(formData.goal_target_amount || 0),
        goal_timeline_years: parseInt(formData.goal_timeline_years || 0),
        additional_context: formData.additional_context,
        portfolio_recommendation: aiResponse.portfolio,
        monthly_investment_target: aiResponse.monthly_investment_target,
        action_checklist: aiResponse.action_checklist,
        debt_payoff_strategy: aiResponse.debt_payoff_strategy,
        emergency_fund_plan: aiResponse.emergency_fund_plan,
        retirement_strategy: aiResponse.retirement_strategy,
        benefits_explanation: aiResponse.benefits_explanation,
        key_recommendations: aiResponse.recommendations,
        financial_health_score: aiResponse.financial_health_score
      });

      navigate(createPageUrl(`Results?id=${quizResponse.id}`));
    } catch (error) {
      console.error("Error generating portfolio:", error);
      setIsGenerating(false);
    }
  };

  const isFormValid = () => {
    const basicFieldsValid = formData.monthly_income && 
           formData.monthly_expenses &&
           formData.current_savings;
    
    // Conditional validation based on concerns
    if (showBenefitsSection) {
      if (!formData.has_employer_health_insurance || !formData.has_employer_retirement) {
        return false;
      }
    }

    if (showDebtSection) {
      if (formData.debt_type !== "none" && (!formData.debt_amount || !formData.debt_monthly_payment)) {
        return false;
      }
    }

    return basicFieldsValid;
  };

  if (loadingQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!quizResponse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
            <p className="text-gray-600">Please complete the quiz first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">Step 2 of 3</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Financial Snapshot
          </h1>
          <p className="text-xl text-gray-600">
            Let's dive deeper into your specific situation
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Based on your concerns: {quizResponse.top_financial_concerns.map(c => c.replace(/_/g, ' ')).join(", ")}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
              <CardTitle className="text-2xl">Detailed Financial Information</CardTitle>
              <p className="text-gray-600 text-sm mt-1">All information is kept private and secure 🔒</p>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Core Financial Info - Always Show */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Income & Budget Basics</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="monthly_income">Monthly Take-Home Pay *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="monthly_income"
                          type="number"
                          placeholder="e.g., 4200"
                          value={formData.monthly_income}
                          onChange={(e) => handleInputChange('monthly_income', e.target.value)}
                          className="pl-7 border-2"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500">Your actual paycheck after taxes</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="monthly_expenses">Monthly Expenses *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="monthly_expenses"
                          type="number"
                          placeholder="e.g., 2800"
                          value={formData.monthly_expenses}
                          onChange={(e) => handleInputChange('monthly_expenses', e.target.value)}
                          className="pl-7 border-2"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500">Rent, utilities, food, transportation, etc.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="current_savings">Current Savings *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="current_savings"
                          type="number"
                          placeholder="e.g., 3000"
                          value={formData.current_savings}
                          onChange={(e) => handleInputChange('current_savings', e.target.value)}
                          className="pl-7 border-2"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500">Total in savings/checking accounts</p>
                    </div>
                  </div>
                </div>

                {/* Conditional: Debt Section */}
                {showDebtSection && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <CreditCard className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Debt Situation</h3>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Priority Concern</span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="debt_type">Debt Type *</Label>
                        <Select value={formData.debt_type} onValueChange={(value) => handleInputChange('debt_type', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Debt</SelectItem>
                            <SelectItem value="student_loans">Student Loans</SelectItem>
                            <SelectItem value="credit_cards">Credit Cards</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.debt_type !== "none" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="debt_amount">Total Debt *</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                              <Input
                                id="debt_amount"
                                type="number"
                                placeholder="e.g., 35000"
                                value={formData.debt_amount}
                                onChange={(e) => handleInputChange('debt_amount', e.target.value)}
                                className="pl-7 border-2"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="debt_monthly_payment">Monthly Payment *</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                              <Input
                                id="debt_monthly_payment"
                                type="number"
                                placeholder="e.g., 400"
                                value={formData.debt_monthly_payment}
                                onChange={(e) => handleInputChange('debt_monthly_payment', e.target.value)}
                                className="pl-7 border-2"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="debt_interest_rate">Avg Interest Rate</Label>
                            <div className="relative">
                              <Input
                                id="debt_interest_rate"
                                type="number"
                                step="0.1"
                                placeholder="e.g., 5.5"
                                value={formData.debt_interest_rate}
                                onChange={(e) => handleInputChange('debt_interest_rate', e.target.value)}
                                className="border-2"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Conditional: Employer Benefits Section */}
                {showBenefitsSection && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Shield className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Employer Benefits</h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Priority Concern</span>
                    </div>

                    {/* Health Insurance */}
                    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-gray-900">Health Insurance</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="has_employer_health_insurance">Does your employer offer health insurance? *</Label>
                        <Select 
                          value={formData.has_employer_health_insurance} 
                          onValueChange={(value) => handleInputChange('has_employer_health_insurance', value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.has_employer_health_insurance === "true" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="enrolled_in_health_insurance">Are you enrolled?</Label>
                            <Select 
                              value={formData.enrolled_in_health_insurance} 
                              onValueChange={(value) => handleInputChange('enrolled_in_health_insurance', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes, I'm enrolled</SelectItem>
                                <SelectItem value="false">No, not yet</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {formData.enrolled_in_health_insurance === "true" && (
                            <div className="space-y-2">
                              <Label htmlFor="health_insurance_premium">Monthly Premium (your portion)</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <Input
                                  id="health_insurance_premium"
                                  type="number"
                                  placeholder="e.g., 150"
                                  value={formData.health_insurance_premium}
                                  onChange={(e) => handleInputChange('health_insurance_premium', e.target.value)}
                                  className="pl-7 border-2"
                                />
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="has_hsa_fsa">Does your employer contribute to an HSA or FSA?</Label>
                            <Select 
                              value={formData.has_hsa_fsa} 
                              onValueChange={(value) => handleInputChange('has_hsa_fsa', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                                <SelectItem value="unsure">Not sure</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Retirement Plan */}
                    <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-gray-900">Retirement Plan (401k)</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="has_employer_retirement">Does your employer offer a 401k or similar retirement plan? *</Label>
                        <Select 
                          value={formData.has_employer_retirement} 
                          onValueChange={(value) => handleInputChange('has_employer_retirement', value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.has_employer_retirement === "true" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="employer_match_percentage">Employer Match Percentage (if known)</Label>
                            <div className="relative">
                              <Input
                                id="employer_match_percentage"
                                type="number"
                                step="0.5"
                                placeholder="e.g., 4"
                                value={formData.employer_match_percentage}
                                onChange={(e) => handleInputChange('employer_match_percentage', e.target.value)}
                                className="border-2"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                            </div>
                            <p className="text-xs text-gray-500">e.g., "Company matches 100% up to 4%"</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="contributing_to_retirement">Are you contributing to it?</Label>
                            <Select 
                              value={formData.contributing_to_retirement} 
                              onValueChange={(value) => handleInputChange('contributing_to_retirement', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes, I'm contributing</SelectItem>
                                <SelectItem value="false">No, not yet</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {formData.contributing_to_retirement === "true" && (
                            <div className="space-y-2">
                              <Label htmlFor="retirement_contribution_amount">Monthly Contribution Amount</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <Input
                                  id="retirement_contribution_amount"
                                  type="number"
                                  placeholder="e.g., 200"
                                  value={formData.retirement_contribution_amount}
                                  onChange={(e) => handleInputChange('retirement_contribution_amount', e.target.value)}
                                  className="pl-7 border-2"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Conditional: Financial Goal - Show if saving for big purchase or investing */}
                {(showBigPurchaseSection || showInvestmentSection) && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Target className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Your Financial Goal</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="financial_goal_description">What are you saving for?</Label>
                        <Input
                          id="financial_goal_description"
                          type="text"
                          placeholder="e.g., Down payment on a house, Emergency fund, Pay off student loans"
                          value={formData.financial_goal_description}
                          onChange={(e) => handleInputChange('financial_goal_description', e.target.value)}
                          className="border-2"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="goal_target_amount">Target Amount</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              id="goal_target_amount"
                              type="number"
                              placeholder="e.g., 50000"
                              value={formData.goal_target_amount}
                              onChange={(e) => handleInputChange('goal_target_amount', e.target.value)}
                              className="pl-7 border-2"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="goal_timeline_years">Timeline (Years)</Label>
                          <Input
                            id="goal_timeline_years"
                            type="number"
                            placeholder="e.g., 5"
                            value={formData.goal_timeline_years}
                            onChange={(e) => handleInputChange('goal_timeline_years', e.target.value)}
                            className="border-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Context - Always Show */}
                <div className="space-y-4">
                  <Label htmlFor="additional_context">Anything else we should know?</Label>
                  <Textarea
                    id="additional_context"
                    placeholder="Questions, concerns, unique situations, or anything you'd like personalized advice on..."
                    value={formData.additional_context}
                    onChange={(e) => handleInputChange('additional_context', e.target.value)}
                    className="min-h-32 border-2"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={!isFormValid() || isGenerating}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 py-6 text-lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Your Personalized Plan...
                      </>
                    ) : (
                      <>
                        Generate My Financial Success Plan
                        <TrendingUp className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-sm text-gray-500 mt-4">
                    This usually takes 15-20 seconds
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}