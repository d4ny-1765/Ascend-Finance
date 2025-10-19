import React from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", 
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", 
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", 
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", 
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", 
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", 
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

export default function QuizStep({ step, value, onChange }) {
  const handleCheckboxChange = (optionValue, checked) => {
    const currentValues = value || [];
    const maxSelections = step.maxSelections || 999;
    
    if (checked) {
      if (currentValues.length < maxSelections) {
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(currentValues.filter(v => v !== optionValue));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        {step.question}
      </h2>
      {step.subtitle && (
        <p className="text-lg text-gray-600 mb-8">{step.subtitle}</p>
      )}

      {step.type === "text" && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={step.placeholder}
          className="text-lg p-6 border-2"
          autoFocus
        />
      )}

      {step.type === "number" && (
        <div className="relative">
          {step.field === "annual_salary" && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
          )}
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={step.placeholder}
            className={`text-lg p-6 border-2 ${step.field === "annual_salary" ? "pl-8" : ""}`}
            autoFocus
          />
        </div>
      )}

      {step.type === "select" && (
        <RadioGroup value={String(value)} onValueChange={onChange} className="space-y-4">
          {step.options.map((option) => (
            <motion.div
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Label
                htmlFor={option.value}
                className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${
                  value === option.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <RadioGroupItem value={option.value} id={option.value} className="mr-4" />
                <span className="text-lg font-medium text-gray-900">{option.label}</span>
              </Label>
            </motion.div>
          ))}
        </RadioGroup>
      )}

      {step.type === "checkbox" && (
        <div className="space-y-4">
          {step.options.map((option) => {
            const isChecked = (value || []).includes(option.value);
            const currentCount = (value || []).length;
            const maxReached = currentCount >= (step.maxSelections || 999);
            const isDisabled = maxReached && !isChecked;

            return (
              <motion.div
                key={option.value}
                whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                whileTap={{ scale: isDisabled ? 1 : 0.98 }}
              >
                <Label
                  htmlFor={option.value}
                  className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    isChecked
                      ? "border-indigo-500 bg-indigo-50"
                      : isDisabled
                      ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <Checkbox
                    id={option.value}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheckboxChange(option.value, checked)}
                    disabled={isDisabled}
                    className="mt-1 mr-4"
                  />
                  <span className="text-lg font-medium text-gray-900">{option.label}</span>
                </Label>
              </motion.div>
            );
          })}
          {step.maxSelections && (
            <p className="text-sm text-gray-500 mt-2">
              Selected: {(value || []).length} / {step.maxSelections}
            </p>
          )}
        </div>
      )}

      {step.type === "state-select" && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="text-lg p-6 border-2">
            <SelectValue placeholder={step.placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {US_STATES.map((state) => (
              <SelectItem key={state} value={state} className="text-lg">
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </motion.div>
  );
}