import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Shield,
  TrendingUp,
  User,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BrokerageAccountModal = ({ open, onOpenChange, userProfile }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    broker: '',
    accountType: '',
    firstName: userProfile?.name?.split(' ')[0] || '',
    lastName: userProfile?.name?.split(' ').slice(1).join(' ') || '',
    email: '',
    phone: '',
    ssn: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: userProfile?.quiz?.state || '',
    zipCode: '',
    employmentStatus: '',
    annualIncome: userProfile?.salary || userProfile?.quiz?.salary || '',
    initialDeposit: '',
    fundingMethod: ''
  });
  const [accountCreated, setAccountCreated] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [copied, setCopied] = useState(false);

  const totalSteps = 4;

  const brokers = [
    {
      name: 'Principal Securities',
      icon: '🏛️',
      features: ['$0 commissions', 'Comprehensive retirement planning', 'Top-rated customer service', 'Integrated financial tools'],
      recommended: true
    },
    {
      name: 'Vanguard',
      icon: '🏦',
      features: ['$0 commissions', 'Low expense ratios', 'Excellent ETF selection'],
      recommended: true
    },
    {
      name: 'Fidelity',
      icon: '💼',
      features: ['$0 commissions', 'Great research tools', 'No account minimums'],
      recommended: true
    },
    {
      name: 'Schwab',
      icon: '📈',
      features: ['$0 commissions', 'Excellent customer service', 'Banking integration'],
      recommended: false
    },
    {
      name: 'E*TRADE',
      icon: '📊',
      features: ['$0 commissions', 'Advanced trading tools', 'Good mobile app'],
      recommended: false
    }
  ];

  const accountTypes = [
    {
      value: 'individual',
      label: 'Individual Brokerage',
      description: 'Standard investment account with no contribution limits',
      taxAdvantage: 'No',
      best: 'General investing'
    },
    {
      value: 'traditional_ira',
      label: 'Traditional IRA',
      description: 'Tax-deductible contributions, taxed at withdrawal',
      taxAdvantage: 'Yes - Upfront',
      best: 'Retirement, tax deduction now'
    },
    {
      value: 'roth_ira',
      label: 'Roth IRA',
      description: 'After-tax contributions, tax-free withdrawals in retirement',
      taxAdvantage: 'Yes - Later',
      best: 'Retirement, tax-free growth'
    },
    {
      value: 'joint',
      label: 'Joint Account',
      description: 'Shared account with another person',
      taxAdvantage: 'No',
      best: 'Couples, families'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Simulate account creation
    const accountNum = `VG${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    setAccountNumber(accountNum);
    setAccountCreated(true);
  };

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetModal = () => {
    setStep(1);
    setAccountCreated(false);
    setAccountNumber('');
    setCopied(false);
  };

  const handleClose = () => {
    resetModal();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {!accountCreated ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl">Open Brokerage Account</DialogTitle>
                  <DialogDescription>
                    Step {step} of {totalSteps} - Let's get you started investing
                  </DialogDescription>
                </div>
              </div>
              <Progress value={(step / totalSteps) * 100} className="mt-4" />
            </DialogHeader>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-purple-600" />
                      Choose Your Broker
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {brokers.map((broker) => (
                        <Card
                          key={broker.name}
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            formData.broker === broker.name
                              ? 'ring-2 ring-purple-600 bg-purple-50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleInputChange('broker', broker.name)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{broker.icon}</span>
                                <div>
                                  <h4 className="font-bold text-lg">{broker.name}</h4>
                                  {broker.recommended && (
                                    <Badge className="bg-green-600 text-white text-xs mt-1">
                                      Recommended
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {formData.broker === broker.name && (
                                <CheckCircle2 className="w-6 h-6 text-purple-600" />
                              )}
                            </div>
                            <ul className="space-y-1">
                              {broker.features.map((feature, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      Select Account Type
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {accountTypes.map((type) => (
                        <Card
                          key={type.value}
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            formData.accountType === type.value
                              ? 'ring-2 ring-purple-600 bg-purple-50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleInputChange('accountType', type.value)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-bold">{type.label}</h4>
                              {formData.accountType === type.value && (
                                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Tax Advantage:</span>
                                <span className="font-semibold">{type.taxAdvantage}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Best For:</span>
                                <span className="font-semibold">{type.best}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dob">Date of Birth *</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ssn">SSN (Last 4 digits) *</Label>
                      <Input
                        id="ssn"
                        type="text"
                        maxLength="4"
                        value={formData.ssn}
                        onChange={(e) => handleInputChange('ssn', e.target.value)}
                        placeholder="1234"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Your data is secure</p>
                      <p className="text-xs text-blue-700">
                        All information is encrypted and protected. This is a demo - no real data is stored.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Address & Employment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="123 Main Street, Apt 4B"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        maxLength="2"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="employment">Employment Status *</Label>
                      <Select
                        value={formData.employmentStatus}
                        onValueChange={(value) => handleInputChange('employmentStatus', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employed">Employed</SelectItem>
                          <SelectItem value="self-employed">Self-Employed</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="income">Annual Income *</Label>
                      <Input
                        id="income"
                        type="number"
                        value={formData.annualIncome}
                        onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                        placeholder="50000"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    Fund Your Account
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="initialDeposit">Initial Deposit Amount *</Label>
                      <Input
                        id="initialDeposit"
                        type="number"
                        value={formData.initialDeposit}
                        onChange={(e) => handleInputChange('initialDeposit', e.target.value)}
                        placeholder="1000"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum: $0 (you can start with $0 and fund later)
                      </p>
                    </div>

                    <div>
                      <Label>Funding Method *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                        {[
                          { value: 'bank', label: 'Bank Transfer', icon: '🏦', time: '3-5 days' },
                          { value: 'wire', label: 'Wire Transfer', icon: '⚡', time: 'Same day' },
                          { value: 'check', label: 'Check', icon: '📝', time: '7-10 days' }
                        ].map((method) => (
                          <Card
                            key={method.value}
                            className={`cursor-pointer transition-all ${
                              formData.fundingMethod === method.value
                                ? 'ring-2 ring-purple-600 bg-purple-50'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleInputChange('fundingMethod', method.value)}
                          >
                            <CardContent className="p-4 text-center">
                              <span className="text-3xl mb-2 block">{method.icon}</span>
                              <p className="font-semibold text-sm">{method.label}</p>
                              <p className="text-xs text-gray-500">{method.time}</p>
                              {formData.fundingMethod === method.value && (
                                <CheckCircle2 className="w-5 h-5 text-purple-600 mx-auto mt-2" />
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Account Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Broker:</span>
                          <span className="font-semibold">{formData.broker || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Account Type:</span>
                          <span className="font-semibold capitalize">
                            {formData.accountType?.replace('_', ' ') || 'Not selected'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Account Holder:</span>
                          <span className="font-semibold">
                            {formData.firstName} {formData.lastName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Initial Deposit:</span>
                          <span className="font-semibold">
                            ${parseFloat(formData.initialDeposit || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={nextStep}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={
                  (step === 1 && (!formData.broker || !formData.accountType)) ||
                  (step === 2 && (!formData.firstName || !formData.lastName || !formData.email)) ||
                  (step === 3 && (!formData.address || !formData.city || !formData.state)) ||
                  (step === 4 && !formData.fundingMethod)
                }
              >
                {step === totalSteps ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Open Account
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Account Created Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Welcome to {formData.broker}! Your investment journey starts now.
            </p>

            <Card className="max-w-md mx-auto mb-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Account Number</p>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-2xl font-mono font-bold text-purple-600">
                        {accountNumber}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyAccountNumber}
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-600">Account Type</p>
                      <p className="font-semibold capitalize">
                        {formData.accountType.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Initial Deposit</p>
                      <p className="font-semibold">
                        ${parseFloat(formData.initialDeposit || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 mb-6">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    What's Next? Complete Your Setup
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">Check Your Email</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Look for account confirmation from {formData.broker}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">Link Your Bank Account</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Transfer your initial deposit of ${parseFloat(formData.initialDeposit || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">Review Investment Recommendations</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Use our AI Investment Coach to see which ETFs to buy
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0">
                        4
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">Place Your First Trades</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Buy recommended ETFs and set up automatic investments
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-sm text-gray-900">Pro Tip</p>
                      <p className="text-xs text-gray-700 mt-1">
                        Don't wait! Once your funds clear, our Investment Coach will show you exactly which ETFs to buy and how much of each. Start investing within 48 hours!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  handleClose();
                  // Scroll to Investment Coach section
                  setTimeout(() => {
                    const investmentCoach = document.querySelector('[class*="InvestmentCoach"]');
                    if (investmentCoach) {
                      investmentCoach.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 300);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Investment Recommendations
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BrokerageAccountModal;
