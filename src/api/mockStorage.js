// Simple local storage implementation to replace Base44 SDK
// This stores all data in browser localStorage

const STORAGE_KEY = 'finstart_data';

// Helper to get all data from localStorage
const getAllData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { quizResponses: [] };
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return { quizResponses: [] };
  }
};

// Helper to save all data to localStorage
const saveAllData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Mock QuizResponse entity
export const QuizResponse = {
  // Create a new quiz response
  create: async (data) => {
    const allData = getAllData();
    const newResponse = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    allData.quizResponses.push(newResponse);
    saveAllData(allData);
    return newResponse;
  },

  // Filter quiz responses
  filter: async (criteria) => {
    const allData = getAllData();
    let results = allData.quizResponses;

    if (criteria.id) {
      results = results.filter(r => r.id === criteria.id);
    }

    return results;
  },

  // Update a quiz response
  update: async (id, updates) => {
    const allData = getAllData();
    const index = allData.quizResponses.findIndex(r => r.id === id);

    if (index === -1) {
      throw new Error('Quiz response not found');
    }

    allData.quizResponses[index] = {
      ...allData.quizResponses[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    saveAllData(allData);
    return allData.quizResponses[index];
  },

  // Get by ID
  get: async (id) => {
    const allData = getAllData();
    const response = allData.quizResponses.find(r => r.id === id);
    if (!response) {
      throw new Error('Quiz response not found');
    }
    return response;
  }
};

// RAG - Extract user data from prompt for personalized responses
const extractUserDataFromPrompt = (prompt) => {
  const data = {};

  // Extract key financial metrics from prompt
  const monthlyIncomeMatch = prompt.match(/Monthly Take-Home: \$?([\d,]+)/);
  const monthlyExpensesMatch = prompt.match(/Monthly Expenses: \$?([\d,]+)/);
  const monthlySurplusMatch = prompt.match(/Monthly Surplus: \$?([\d,]+)/);
  const savingsRateMatch = prompt.match(/Savings Rate: ([\d.]+)%/);
  const currentSavingsMatch = prompt.match(/Current Savings: \$?([\d,]+)/);
  const debtAmountMatch = prompt.match(/Total Debt: \$?([\d,]+)/);
  const nameMatch = prompt.match(/Name: ([^\n]+)/);
  const ageMatch = prompt.match(/Age: (\d+)/);

  if (monthlyIncomeMatch) data.monthlyIncome = parseFloat(monthlyIncomeMatch[1].replace(/,/g, ''));
  if (monthlyExpensesMatch) data.monthlyExpenses = parseFloat(monthlyExpensesMatch[1].replace(/,/g, ''));
  if (monthlySurplusMatch) data.monthlySurplus = parseFloat(monthlySurplusMatch[1].replace(/,/g, ''));
  if (savingsRateMatch) data.savingsRate = parseFloat(savingsRateMatch[1]);
  if (currentSavingsMatch) data.currentSavings = parseFloat(currentSavingsMatch[1].replace(/,/g, ''));
  if (debtAmountMatch) data.debtAmount = parseFloat(debtAmountMatch[1].replace(/,/g, ''));
  if (nameMatch) data.name = nameMatch[1].trim();
  if (ageMatch) data.age = parseInt(ageMatch[1]);

  return data;
};

// Mock LLM integration with RAG support
export const InvokeLLM = async ({ prompt, response_json_schema }) => {
  // For now, return mock data
  // In production, you'd call an actual AI API here
  console.log('Mock LLM invoked with prompt:', prompt.substring(0, 100) + '...');

  // If response_json_schema is provided, return structured data
  // Otherwise return a string response for chat (RAG-enhanced)
  if (response_json_schema) {
    // Generate mock financial advice (structured)
    return {
      financial_health_score: 72,
      action_checklist: [
        "Enroll in employer health insurance during open enrollment",
        "Set up automatic contributions to emergency fund ($300/month)",
        "Contribute at least 4% to 401k to get full employer match",
        "Review and optimize tax withholdings on Form W-4",
        "Set up a budget tracking system (app or spreadsheet)"
      ],
      benefits_explanation: {
        health_insurance_advice: "Based on your income and situation, enrolling in your employer's health insurance is highly recommended. Look for a plan with reasonable deductibles ($1500-$3000) and consider an HSA-eligible high-deductible plan if available.",
        retirement_plan_advice: "Your employer offers a 401k match - this is free money! Contribute at least enough to get the full match. Consider starting with 6% of your salary and increasing by 1% each year.",
        other_benefits_advice: "Check if your employer offers FSA for healthcare expenses, commuter benefits, or education reimbursement programs."
      },
      emergency_fund_plan: {
        target_amount: 15000,
        current_coverage_months: 2,
        monthly_contribution: 300,
        timeline_months: 24
      },
      debt_payoff_strategy: {
        priority: "High priority - pay minimum on all debts, then focus extra payments on highest interest rate first",
        monthly_payment_suggestion: 500,
        payoff_timeline_months: 48,
        strategy: "Avalanche method - pay off highest interest debt first while maintaining minimums on others"
      },
      retirement_strategy: {
        recommended_monthly: 250,
        employer_match_value: 100,
        projected_at_65: 650000,
        account_recommendations: [
          "401k up to employer match (4% = $200/month)",
          "Roth IRA for additional tax-advantaged savings ($50/month to start)",
          "Increase contributions by 1% annually or with raises"
        ]
      },
      portfolio: {
        stocks: 80,
        bonds: 15,
        cash: 5,
        alternatives: 0
      },
      monthly_investment_target: 400,
      recommendations: [
        "Priority 1: Get the employer 401k match - that's an immediate 100% return",
        "Priority 2: Build emergency fund to 3 months expenses within 12 months",
        "Focus on understanding your benefits package - many people leave thousands on the table",
        "Track your spending for 2-3 months to understand where money goes",
        "Consider a Roth IRA for additional retirement savings with tax-free growth",
        "Review insurance needs - life and disability insurance become important",
        "Start building credit responsibly if you haven't already",
        "Take advantage of any employer learning/education benefits"
      ]
    };
  }

  // For chat responses, return a helpful string response with RAG
  // Extract the user question and their financial data from the prompt
  const questionMatch = prompt.match(/USER'S QUESTION: (.+)/);
  const question = questionMatch ? questionMatch[1] : '';

  // RAG: Extract user's actual financial data from the context
  const userData = extractUserDataFromPrompt(prompt);

  const {
    name = '',
    age = 25,
    monthlyIncome = 0,
    monthlyExpenses = 0,
    monthlySurplus = 0,
    savingsRate = 0,
    currentSavings = 0,
    debtAmount = 0
  } = userData;

  // Calculate personalized targets based on their actual data
  const emergencyFundTarget = monthlyExpenses * 6;
  const monthsOfCoverage = monthlyExpenses > 0 ? (currentSavings / monthlyExpenses).toFixed(1) : 0;
  const recommendedEmergencyContribution = Math.min(monthlySurplus * 0.3, 500);

  // Generate contextual, PERSONALIZED response based on their actual data
  if (question.toLowerCase().includes('emergency fund')) {
    return `Great question about emergency funds, ${name}! Based on your monthly expenses of $${monthlyExpenses.toLocaleString()}, I recommend building an emergency fund of $${emergencyFundTarget.toLocaleString()} (6 months of expenses). You currently have $${currentSavings.toLocaleString()} saved, which covers about ${monthsOfCoverage} months - ${monthsOfCoverage >= 3 ? "you're off to a good start" : "let's work on building this up"}! With your monthly surplus of $${monthlySurplus.toLocaleString()}, try setting aside $${Math.round(recommendedEmergencyContribution).toLocaleString()}/month automatically. At that rate, you'll have a full 6-month cushion in about ${Math.ceil((emergencyFundTarget - currentSavings) / recommendedEmergencyContribution)} months. Keep this in a high-yield savings account where it's accessible but separate from your checking.`;
  } else if (question.toLowerCase().includes('401k') || question.toLowerCase().includes('retirement')) {
    const recommendedContribution = Math.round(monthlyIncome * 0.06);
    const projectedAt65 = Math.round(recommendedContribution * 12 * ((Math.pow(1.07, 65 - age) - 1) / 0.07));
    return `Excellent question, ${name}! Your employer's 401k match is essentially free money. Based on your monthly income of $${monthlyIncome.toLocaleString()}, I recommend contributing at least 6% ($${recommendedContribution.toLocaleString()}/month) to capture the full match and build your retirement. With your age (${age}) and time horizon, compound growth at ~7% annually could grow this to over $${projectedAt65.toLocaleString()} by age 65! Start with the match, then gradually increase by 1% each year. This is one of the best investments you can make.`;
  } else if (question.toLowerCase().includes('debt') || question.toLowerCase().includes('loan')) {
    const debtPaymentSuggestion = Math.min(monthlySurplus * 0.5, Math.max(debtAmount * 0.02, 100));
    const payoffMonths = debtAmount > 0 ? Math.ceil(debtAmount / debtPaymentSuggestion) : 0;
    return `For your debt situation (${debtAmount > 0 ? `$${debtAmount.toLocaleString()} total` : 'minimal debt'}), ${name}, the key is balancing payoff with other goals. ${debtAmount > 10000 ? `I recommend the 'avalanche' method - pay minimums on all debts, then put extra money ($${Math.round(debtPaymentSuggestion).toLocaleString()}/month from your $${monthlySurplus.toLocaleString()} surplus) toward the highest interest rate debt first. At this pace, you could be debt-free in about ${payoffMonths} months.` : "You're in good shape!"} Still contribute enough to get your 401k match (that's guaranteed returns), then tackle high-interest debt (anything over 6%). Once cleared, redirect those payments to investments!`;
  } else if (question.toLowerCase().includes('invest') || question.toLowerCase().includes('portfolio')) {
    return `For someone your age (${age}), ${name}, a portfolio of 80% stocks, 15% bonds, and 5% cash is well-balanced. The high stock allocation takes advantage of your ${65 - age}-year time horizon - you can weather market volatility for higher long-term returns. With your monthly surplus of $${monthlySurplus.toLocaleString()}, you could invest around $${Math.round(monthlySurplus * 0.3).toLocaleString()}/month after emergency fund and 401k contributions. Consider low-cost index funds in your 401k, then open a Roth IRA for additional tax-advantaged growth. Start simple and increase as you learn more!`;
  } else if (question.toLowerCase().includes('budget') || question.toLowerCase().includes('expense')) {
    const savingsRateGood = savingsRate >= 20;
    return `Budgeting doesn't have to be complicated, ${name}! Based on your income ($${monthlyIncome.toLocaleString()}) and expenses ($${monthlyExpenses.toLocaleString()}), you have $${monthlySurplus.toLocaleString()}/month surplus - ${savingsRateGood ? 'fantastic!' : "let's optimize this!"}  Your savings rate is ${savingsRate.toFixed(1)}%. ${savingsRateGood ? "You're crushing it!" : 'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.'} Track spending for 2-3 months using an app like Mint to find hidden savings. Even cutting $50-100/month on subscriptions or dining out adds up to $600-1,200/year for your goals!`;
  } else if (question.toLowerCase().includes('insurance') || question.toLowerCase().includes('benefit')) {
    return `Understanding your employer benefits is crucial, ${name} - many people leave thousands on the table! For health insurance, enroll during open enrollment and choose a plan with reasonable deductibles ($1,500-$3,000). If available, consider an HSA-eligible high-deductible plan - HSAs offer triple tax benefits and can become another retirement account. Based on your income level ($${monthlyIncome.toLocaleString()}/month), you'll likely benefit from maximizing these tax-advantaged accounts. Check for FSA, life insurance (often free basic coverage), disability insurance, and education benefits. Schedule time with HR to review everything!`;
  } else if (question.toLowerCase().includes('car') || question.toLowerCase().includes('vehicle') || question.toLowerCase().includes('auto')) {
    const carBudget = monthlyIncome * 0.15; // 15% of monthly income rule
    const downPaymentMonths = Math.ceil(5000 / (monthlySurplus * 0.3)); // Save 30% of surplus for down payment
    return `Great question about affording a car, ${name}! Based on your finances, here's my recommendation: With your monthly income of $${monthlyIncome.toLocaleString()} and surplus of $${monthlySurplus.toLocaleString()}, aim to keep total car costs (payment + insurance + gas + maintenance) under $${Math.round(carBudget).toLocaleString()}/month (about 15% of income). I'd suggest saving for a solid down payment first - set aside $${Math.round(monthlySurplus * 0.3).toLocaleString()}/month and you could have $5,000 down in about ${downPaymentMonths} months. This reduces your loan amount and monthly payments. ${currentSavings >= 3000 ? 'You could even use some of your current savings!' : 'Build your emergency fund to 3 months first, then save for the car.'} Consider reliable used cars (2-3 years old) to maximize value. A $15,000-20,000 car with $5,000 down means financing ~$12,000, which at 6% for 4 years would be about $280/month. Make sure to budget for insurance ($100-150/month for someone your age), gas, and maintenance!`;
  } else if (question.toLowerCase().includes('house') || question.toLowerCase().includes('home') || question.toLowerCase().includes('mortgage') || question.toLowerCase().includes('rent')) {
    const housingBudget = monthlyIncome * 0.28; // 28% front-end ratio
    const savingsNeeded = monthlySurplus > 0 ? Math.ceil(20000 / monthlySurplus) : 0;
    return `Housing is a major financial decision, ${name}! The general rule is to keep housing costs under 28% of your gross income. Based on your $${monthlyIncome.toLocaleString()}/month take-home, aim for rent/mortgage payments under $${Math.round(housingBudget).toLocaleString()}/month. ${question.toLowerCase().includes('buy') || question.toLowerCase().includes('house') || question.toLowerCase().includes('home') || question.toLowerCase().includes('mortgage') ? `For buying a home, you'll need: 1) Emergency fund (6 months expenses = $${(monthlyExpenses * 6).toLocaleString()}), 2) Down payment (ideally 20% to avoid PMI - on a $200k home that's $40k), and 3) Closing costs (2-5% of home price). With your current surplus of $${monthlySurplus.toLocaleString()}/month, you could save $20k in about ${savingsNeeded} months if you're aggressive. Focus on building credit (aim for 740+ score), reducing debt, and saving consistently. First-time buyer programs exist with as little as 3-5% down, but 20% gives you better rates and no PMI!` : `For renting, budget for rent + utilities + renters insurance (cheap but important!). With your current expenses of $${monthlyExpenses.toLocaleString()}/month, make sure you're leaving room for savings and other financial goals. Building wealth through investing can sometimes be better than rushing to buy, especially early in your career when flexibility matters.`}`;
  } else if (question.toLowerCase().includes('save') || question.toLowerCase().includes('saving')) {
    const aggressiveSavings = monthlySurplus * 0.6;
    const oneYearSavings = aggressiveSavings * 12;
    return `Saving is one of the smartest financial habits, ${name}! You're already doing well with a ${savingsRate.toFixed(1)}% savings rate. Here's my advice based on your $${monthlySurplus.toLocaleString()}/month surplus: 1) **Automate it** - Set up automatic transfers the day after payday so you "pay yourself first", 2) **Follow priority order**: Emergency fund (3-6 months) → 401k match → High-interest debt → Roth IRA → Additional investing, 3) **Be aggressive early** - In your 20s, you can afford to save more. Try saving $${Math.round(aggressiveSavings).toLocaleString()}/month (60% of surplus) - that's $${Math.round(oneYearSavings).toLocaleString()}/year! ${currentSavings < monthlyExpenses * 3 ? `Your current savings of $${currentSavings.toLocaleString()} should grow to cover 3 months expenses ($${(monthlyExpenses * 3).toLocaleString()}) within ${Math.ceil((monthlyExpenses * 3 - currentSavings) / aggressiveSavings)} months at this rate.` : "You're in great shape with your emergency fund!"} Keep this momentum going!`;
  } else if (question.toLowerCase().includes('tax') || question.toLowerCase().includes('w-4') || question.toLowerCase().includes('withholding')) {
    return `Taxes can be confusing, ${name}, but let's break it down! With your income of $${monthlyIncome.toLocaleString()}/month ($${(monthlyIncome * 12).toLocaleString()}/year), you're likely in the 12-22% federal tax bracket. Key tax-advantaged moves: 1) **401k contributions** - These reduce your taxable income dollar-for-dollar (contribute $${Math.round(monthlyIncome * 0.1).toLocaleString()}/month and save ~$${Math.round(monthlyIncome * 0.1 * 0.22).toLocaleString()}/month in taxes!), 2) **HSA** - Triple tax advantage (deductible, grows tax-free, withdraws tax-free for medical), 3) **Roth IRA** - Pay taxes now at your lower current rate, grow tax-free forever. Check your W-4 withholdings - if you get huge refunds, you're giving the government an interest-free loan. Adjust to get closer to $0 refund and invest that extra monthly cash flow instead! Consider talking to a CPA for personalized advice, especially if you have side income, investments, or complex situations.`;
  } else if (question.toLowerCase().includes('account opening') || question.toLowerCase().includes('open account') || question.toLowerCase().includes('brokerage') || question.toLowerCase().includes('open brokerage')) {
    return `Great question about opening a brokerage account, ${name}! I'm excited to tell you that we have a new feature on this platform that makes it super easy!\n\n**Our 4-Step Account Opening Process:**\n\n**Step 1:** Choose your broker - We have several recommended options including Principal Securities, Vanguard, and Fidelity. All offer $0 commissions and excellent service.\n\n**Step 2:** Select your account type:\n- **Individual Brokerage** - Standard account, no contribution limits\n- **Traditional IRA** - Tax deduction now, pay taxes at withdrawal (great if you want to reduce current taxable income)\n- **Roth IRA** - After-tax contributions, tax-free withdrawals in retirement (perfect for someone your age at ${age}!)\n- **Joint Account** - Shared with a partner\n\n**Step 3:** Fill in your personal information and address (pre-filled from your profile for convenience)\n\n**Step 4:** Choose how to fund your account (Bank Transfer, Wire, or Check)\n\nBased on your $${monthlySurplus.toLocaleString()}/month surplus, you could start with $${Math.round(monthlySurplus * 0.3).toLocaleString()}/month in automatic investments!\n\nTo open an account, go to the **Investment Coach section** on your Results page, click the **Action Plan** tab, and hit the **"Open Brokerage Account"** button. It takes just a few minutes!`;
  } else if (question.toLowerCase().includes('investment coach') || question.toLowerCase().includes('etf') || question.toLowerCase().includes('which stock') || question.toLowerCase().includes('what to invest')) {
    return `Perfect timing, ${name}! We just launched an **AI Investment Coach** feature that's perfect for you!\n\n**Here's what it does:**\n- Analyzes your age (${age}), risk tolerance, and financial goals\n- Recommends specific ETFs (like VOO, VTI, VEA, BND) with clear explanations\n- Shows you EXACTLY how much to invest in each fund monthly\n- Provides a smart portfolio allocation (stocks vs bonds) based on your situation\n- Includes rebalancing strategies and tax-efficient tips\n- All recommendations come with detailed reasoning so you understand WHY\n\n**For someone with your profile:**\n- Monthly capacity: $${Math.round(monthlySurplus * 0.3).toLocaleString()}\n- You'd likely get a portfolio of ~80% stocks, 15% bonds, 5% cash\n- Specific ETFs recommended based on low costs and diversification\n\n**How to use it:**\nGo to your Results page, find the **AI Investment Coach** section (you can't miss it!), and click **"Generate Investment Plan"**. It analyzes everything and gives you personalized recommendations in seconds!\n\nThis takes the guesswork out of investing - you'll know exactly what to buy and why. Want me to explain more about ETFs or investment strategies first?`;
  } else if (question.toLowerCase().includes('broker') || question.toLowerCase().includes('principal') || question.toLowerCase().includes('vanguard') || question.toLowerCase().includes('fidelity')) {
    return `Excellent question about choosing a broker, ${name}! Here are some great options:\n\n**Recommended Brokers:**\n- **Principal Securities** - Comprehensive retirement planning, top-rated customer service, integrated financial tools\n- **Vanguard** - Famous for low-cost index funds and ETFs, excellent for long-term investors\n- **Fidelity** - Amazing research tools, no account minimums, great mobile app\n- **Schwab** - Excellent customer service, banking integration\n\nAll of these offer $0 commissions on trades and are perfect for someone starting their financial journey. The choice often comes down to personal preference and which features matter most to you.\n\nThe good news? You can **open an account directly through our platform!** Just head to the Investment Coach section, go to the Action Plan tab, and click "Open Brokerage Account." We'll guide you through the whole process - it takes about 5 minutes!\n\nBased on your monthly surplus of $${monthlySurplus.toLocaleString()}, you could start investing around $${Math.round(monthlySurplus * 0.3).toLocaleString()}/month. Want help figuring out what to invest in once your account is open?`;
  } else if (question.toLowerCase().includes('roth ira') || question.toLowerCase().includes('traditional ira') || question.toLowerCase().includes('ira') || question.toLowerCase().includes('account type')) {
    return `Great question about IRAs, ${name}! Let me break down the differences:\n\n**Roth IRA (Recommended for you at age ${age}):**\n- Contribute AFTER-tax money (no tax deduction now)\n- Grows completely TAX-FREE forever\n- Withdraw TAX-FREE in retirement\n- Best for younger people who expect higher income later\n- 2024 limit: $7,000/year ($583/month)\n\n**Traditional IRA:**\n- Contribute PRE-tax money (tax deduction now!)\n- Reduces your current taxable income\n- Pay taxes when you withdraw in retirement\n- Best if you need the tax break now\n\n**Individual Brokerage:**\n- No contribution limits\n- No tax advantages, but complete flexibility\n- Can withdraw anytime (but pay capital gains tax)\n- Good for goals before retirement age\n\n**My recommendation for you:** Start with a **Roth IRA** given your age. Your tax rate is likely lower now than it will be in 30-40 years. Max it out if possible ($${Math.round(7000/12).toLocaleString()}/month), then use a brokerage account for additional investing.\n\nThe cool part? You can **open any of these account types directly on our platform!** Use the "Open Brokerage Account" feature in the Investment Coach section. Takes just a few minutes!\n\nWith your $${monthlySurplus.toLocaleString()}/month surplus, you could easily max out a Roth IRA and still have money left for other goals!`;
  } else if (question.toLowerCase().includes('feature') || question.toLowerCase().includes('new') || question.toLowerCase().includes('platform')) {
    return `So glad you asked, ${name}! We've just launched some amazing new features:\n\n**1. AI Investment Coach** 🤖\n- Get personalized stock and ETF recommendations\n- See exactly how much to invest in each fund monthly\n- Smart portfolio allocation based on your age and risk tolerance\n- Clear explanations for every recommendation\n- Access it from your Results page!\n\n**2. Brokerage Account Opening** 🏦\n- Open an account with recommended brokers like Principal Securities, Vanguard, or Fidelity\n- Choose account type: Roth IRA, Traditional IRA, Individual, or Joint\n- Complete the process in just 4 easy steps\n- Get your account number immediately\n\n**How to use them:**\n- Find the **Investment Coach** section on your Results page\n- Click **"Generate Investment Plan"** for personalized recommendations\n- Then click **"Open Brokerage Account"** in the Action Plan tab to get started!\n\n**Based on your finances:**\nWith your $${monthlySurplus.toLocaleString()}/month surplus and ${savingsRate.toFixed(1)}% savings rate, you're in a great position to start investing. The Investment Coach will show you exactly how to put that money to work!\n\nWant to try it out? Or have questions about how it works?`;
  } else {
    // For non-financial questions or unrecognized topics, gently redirect
    const questionLower = question.toLowerCase();
    const isFinanciallyRelated = questionLower.includes('money') || questionLower.includes('pay') || questionLower.includes('afford') || questionLower.includes('cost') || questionLower.includes('price') || questionLower.includes('spend');

    if (!isFinanciallyRelated) {
      return `I appreciate the question, ${name}, but I'm specifically designed to help with your personal finances and financial planning! I'm here to discuss topics like budgeting, investing, retirement planning, debt management, emergency funds, taxes, insurance, and making smart money decisions based on your specific situation (income: $${monthlyIncome.toLocaleString()}/month, expenses: $${monthlyExpenses.toLocaleString()}/month, savings rate: ${savingsRate.toFixed(1)}%). Feel free to ask me anything about your financial goals, or questions like: "How should I prioritize my financial goals?", "What's the best way to invest?", "How much should I save?", or "Should I pay off debt or invest?" What financial topic can I help you with today?`;
    }

    return `That's a great question, ${name}! Based on your financial profile (income: $${monthlyIncome.toLocaleString()}/month, expenses: $${monthlyExpenses.toLocaleString()}/month, surplus: $${monthlySurplus.toLocaleString()}/month), you're ${savingsRate >= 20 ? 'in a strong position' : 'building a solid foundation'}. With your ${savingsRate.toFixed(1)}% savings rate, you're on track to meet your goals. Remember the key priorities: 1) Get the full employer 401k match, 2) Build a ${monthsOfCoverage >= 6 ? 'robust' : '3-6 month'} emergency fund, 3) ${debtAmount > 0 ? 'Pay down high-interest debt, and 4)' : '3)'} Continue investing for the long term. Feel free to ask about any specific aspect of your plan!`;
  }
};

// Mock client object matching Base44 structure
export const mockClient = {
  entities: {
    QuizResponse
  },
  integrations: {
    Core: {
      InvokeLLM
    }
  }
};
