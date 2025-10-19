import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import QuizStep from "../components/quiz/QuizStep";

export default function Quiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    user_name: "",
    age: "",
    employment_duration: "",
    state: "",
    annual_salary: "",
    marital_status: "",
    top_financial_concerns: []
  });

  const steps = [
    {
      question: "What's your name?",
      field: "user_name",
      type: "text",
      placeholder: "Enter your full name"
    },
    {
      question: "How old are you?",
      field: "age",
      type: "number",
      placeholder: "Enter your age"
    },
    {
      question: "How long have you been in your current (or first full-time) job?",
      subtitle: "This helps us tailor advice to your career stage",
      field: "employment_duration",
      type: "select",
      options: [
        { value: "less_than_3_months", label: "Less than 3 months" },
        { value: "3_to_12_months", label: "3-12 months" },
        { value: "1_to_3_years", label: "1-3 years" },
        { value: "more_than_3_years", label: "More than 3 years" }
      ]
    },
    {
      question: "Which state do you live in?",
      field: "state",
      type: "state-select",
      placeholder: "Select your state"
    },
    {
      question: "What's your current annual salary?",
      subtitle: "This helps us calculate your take-home pay and savings potential",
      field: "annual_salary",
      type: "number",
      placeholder: "e.g., 65000"
    },
    {
      question: "What's your marital status?",
      field: "marital_status",
      type: "select",
      options: [
        { value: "single", label: "Single" },
        { value: "married", label: "Married" }
      ]
    },
    {
      question: "What are your top financial concerns right now?",
      subtitle: "Select up to 2 that matter most to you",
      field: "top_financial_concerns",
      type: "checkbox",
      maxSelections: 2,
      options: [
        { value: "understanding_benefits", label: "Understanding my company's benefits (insurance, 401k)" },
        { value: "managing_paycheck", label: "How to manage my first 'real' paycheck" },
        { value: "paying_off_debt", label: "Paying off student loans/debt" },
        { value: "emergency_fund", label: "Starting an emergency fund" },
        { value: "saving_big_purchase", label: "Saving for a big purchase (car, down payment)" },
        { value: "investing_future", label: "Starting to invest for the future" },
        { value: "budgeting_tracking", label: "Budgeting and tracking my spending" },
        { value: "taxes_withholdings", label: "Understanding taxes and withholdings" }
      ]
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      console.log("Attempting to save quiz response:", formData);

      // Save quiz response to database
      const quizResponse = await base44.entities.QuizResponse.create({
        user_name: formData.user_name,
        age: parseInt(formData.age),
        employment_duration: formData.employment_duration,
        state: formData.state,
        annual_salary: parseFloat(formData.annual_salary),
        marital_status: formData.marital_status,
        top_financial_concerns: formData.top_financial_concerns
      });

      console.log("Quiz response saved successfully:", quizResponse);

      // Navigate to form with quiz ID
      navigate(createPageUrl(`Form?quizId=${quizResponse.id}`));
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert(`Error saving quiz: ${error.message || error}`);
      setIsSaving(false);
    }
  };

  const isStepValid = () => {
    const currentField = steps[currentStep].field;
    const value = formData[currentField];
    
    if (steps[currentStep].type === "checkbox") {
      return value && value.length > 0 && value.length <= (steps[currentStep].maxSelections || 999);
    }
    
    return value !== "" && value !== null && value !== undefined;
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-600">
              Question {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-indigo-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Quiz Card */}
        <Card className="p-8 md:p-12 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <QuizStep
              key={currentStep}
              step={steps[currentStep]}
              value={formData[steps[currentStep].field]}
              onChange={(value) => handleInputChange(steps[currentStep].field, value)}
            />
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSaving}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!isStepValid() || isSaving}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  Continue to Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}