// Financial Analysis Engine - Core calculations for FinSight Growth Platform

export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  debtToIncomeRatio: number;
  netWorth: number;
  netWorthGrowth: number;
  budgetAdherence: number;
  expenseGrowthRate: number;
  discretionaryRatio: number;
  recurringExpenses: number;
  emergencyFundMonths: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  trend: number; // % change from previous period
  budget?: number;
  overBudget: boolean;
}

export interface FinancialDiagnosis {
  weaknesses: string[];
  strengths: string[];
  alerts: string[];
  recommendations: string[];
}

export interface FinSightScore {
  total: number;
  savingsRateScore: number;
  budgetScore: number;
  debtScore: number;
  expenseTrendScore: number;
  status: 'EXCELLENT' | 'STABLE' | 'RISKY' | 'CRITICAL';
  statusColor: string;
}

export interface ActionPlanItem {
  title: string;
  description: string;
  category: '30_DAY' | '60_DAY' | '90_DAY';
  priority: number;
  targetValue?: number;
}

export interface LifestyleLeak {
  type: string;
  description: string;
  amount: number;
  count: number;
  suggestion: string;
}

export interface FreedomProjection {
  targetAmount: number;
  yearsToReach: number;
  monthsToReach: number;
  requiredMonthlySavings: number;
  currentMonthlySavings: number;
  onTrack: boolean;
}

export interface SimulationResult {
  scenario: string;
  annualImpact: number;
  fiveYearImpact: number;
  netWorthChange: number;
  newSavingsRate: number;
}

// ============ SCORE CALCULATIONS ============

export function calculateSavingsRateScore(savingsRate: number): number {
  // Target: 20%+ savings rate = 100 points
  if (savingsRate >= 30) return 100;
  if (savingsRate >= 25) return 90;
  if (savingsRate >= 20) return 80;
  if (savingsRate >= 15) return 65;
  if (savingsRate >= 10) return 50;
  if (savingsRate >= 5) return 35;
  if (savingsRate >= 0) return 20;
  return 0; // Negative savings
}

export function calculateBudgetScore(budgetAdherence: number): number {
  // budgetAdherence: % of categories within budget
  if (budgetAdherence >= 95) return 100;
  if (budgetAdherence >= 85) return 85;
  if (budgetAdherence >= 75) return 70;
  if (budgetAdherence >= 60) return 55;
  if (budgetAdherence >= 50) return 40;
  return 25;
}

export function calculateDebtScore(debtToIncomeRatio: number): number {
  // Lower debt ratio = higher score
  if (debtToIncomeRatio <= 10) return 100;
  if (debtToIncomeRatio <= 20) return 85;
  if (debtToIncomeRatio <= 30) return 70;
  if (debtToIncomeRatio <= 40) return 55;
  if (debtToIncomeRatio <= 50) return 40;
  return 20;
}

export function calculateExpenseTrendScore(expenseGrowthRate: number): number {
  // Negative growth (expenses decreasing) = good
  if (expenseGrowthRate <= -10) return 100;
  if (expenseGrowthRate <= -5) return 90;
  if (expenseGrowthRate <= 0) return 80;
  if (expenseGrowthRate <= 5) return 65;
  if (expenseGrowthRate <= 10) return 50;
  if (expenseGrowthRate <= 20) return 35;
  return 20;
}

export function calculateFinSightScore(metrics: FinancialMetrics): FinSightScore {
  const savingsRateScore = calculateSavingsRateScore(metrics.savingsRate);
  const budgetScore = calculateBudgetScore(metrics.budgetAdherence);
  const debtScore = calculateDebtScore(metrics.debtToIncomeRatio);
  const expenseTrendScore = calculateExpenseTrendScore(metrics.expenseGrowthRate);

  // Weighted calculation
  const total = Math.round(
    savingsRateScore * 0.4 +
    budgetScore * 0.2 +
    debtScore * 0.2 +
    expenseTrendScore * 0.2
  );

  let status: FinSightScore['status'];
  let statusColor: string;

  if (total >= 80) {
    status = 'EXCELLENT';
    statusColor = '#10B981'; // emerald
  } else if (total >= 60) {
    status = 'STABLE';
    statusColor = '#3B82F6'; // blue
  } else if (total >= 40) {
    status = 'RISKY';
    statusColor = '#F59E0B'; // amber
  } else {
    status = 'CRITICAL';
    statusColor = '#EF4444'; // red
  }

  return {
    total,
    savingsRateScore,
    budgetScore,
    debtScore,
    expenseTrendScore,
    status,
    statusColor,
  };
}

// ============ FINANCIAL DIAGNOSIS ============

export function generateDiagnosis(metrics: FinancialMetrics, categorySpending: CategorySpending[]): FinancialDiagnosis {
  const weaknesses: string[] = [];
  const strengths: string[] = [];
  const alerts: string[] = [];
  const recommendations: string[] = [];

  // Savings Rate Analysis
  if (metrics.savingsRate < 10) {
    weaknesses.push(`Savings rate is critically low at ${metrics.savingsRate.toFixed(1)}%`);
    alerts.push('Your savings rate is below 10%. This puts your financial security at risk.');
    recommendations.push('Aim to save at least 20% of your income. Start by cutting discretionary spending.');
  } else if (metrics.savingsRate < 20) {
    weaknesses.push(`Savings rate is ${metrics.savingsRate.toFixed(1)}%, below recommended 20%`);
    recommendations.push('Increase savings rate to 20% by reducing non-essential expenses.');
  } else {
    strengths.push(`Strong savings rate of ${metrics.savingsRate.toFixed(1)}%`);
  }

  // Debt Analysis
  if (metrics.debtToIncomeRatio > 40) {
    weaknesses.push(`High debt-to-income ratio: ${metrics.debtToIncomeRatio.toFixed(1)}%`);
    alerts.push('Your debt burden is high. Focus on debt reduction before new expenses.');
    recommendations.push('Consider debt consolidation or the avalanche method to reduce high-interest debt first.');
  } else if (metrics.debtToIncomeRatio > 25) {
    weaknesses.push(`Debt-to-income ratio is elevated at ${metrics.debtToIncomeRatio.toFixed(1)}%`);
    recommendations.push('Work on reducing debt to below 25% of income.');
  } else if (metrics.debtToIncomeRatio < 15) {
    strengths.push('Low debt burden - good financial flexibility');
  }

  // Expense Growth Analysis
  if (metrics.expenseGrowthRate > 15) {
    weaknesses.push(`Expenses grew ${metrics.expenseGrowthRate.toFixed(1)}% - possible lifestyle inflation`);
    alerts.push('Rapid expense growth detected. Review recent spending patterns.');
    recommendations.push('Identify and cut back on categories with highest growth.');
  } else if (metrics.expenseGrowthRate < 0) {
    strengths.push(`Expenses decreased by ${Math.abs(metrics.expenseGrowthRate).toFixed(1)}%`);
  }

  // Emergency Fund Analysis
  if (metrics.emergencyFundMonths < 3) {
    weaknesses.push(`Emergency fund covers only ${metrics.emergencyFundMonths.toFixed(1)} months`);
    alerts.push('Emergency fund is insufficient. Aim for 6 months of expenses.');
    recommendations.push('Prioritize building emergency fund to 6 months of expenses.');
  } else if (metrics.emergencyFundMonths >= 6) {
    strengths.push(`Strong emergency fund: ${metrics.emergencyFundMonths.toFixed(1)} months coverage`);
  }

  // Net Worth Growth
  if (metrics.netWorthGrowth < 2) {
    weaknesses.push('Net worth growth is stagnant');
    recommendations.push('Focus on both increasing income and reducing expenses to accelerate wealth building.');
  } else if (metrics.netWorthGrowth > 5) {
    strengths.push(`Excellent net worth growth: ${metrics.netWorthGrowth.toFixed(1)}%`);
  }

  // Budget Adherence
  if (metrics.budgetAdherence < 60) {
    weaknesses.push(`Budget discipline is low: ${metrics.budgetAdherence.toFixed(0)}% adherence`);
    recommendations.push('Review and adjust budgets to be more realistic, then stick to them.');
  } else if (metrics.budgetAdherence > 85) {
    strengths.push('Excellent budget discipline');
  }

  // Category-specific analysis
  const overBudgetCategories = categorySpending.filter(c => c.overBudget);
  if (overBudgetCategories.length > 0) {
    overBudgetCategories.forEach(cat => {
      if (cat.budget) {
        const overBy = ((cat.amount - cat.budget) / cat.budget * 100).toFixed(0);
        weaknesses.push(`${cat.category} spending is ${overBy}% over budget`);
      }
    });
  }

  // High discretionary spending
  if (metrics.discretionaryRatio > 40) {
    weaknesses.push(`Discretionary spending is ${metrics.discretionaryRatio.toFixed(0)}% of total`);
    recommendations.push('Reduce discretionary spending to below 30% of total expenses.');
  }

  return { weaknesses, strengths, alerts, recommendations };
}

// ============ 30-60-90 DAY ACTION PLAN ============

export function generate30_60_90Plan(
  metrics: FinancialMetrics,
  diagnosis: FinancialDiagnosis,
  categorySpending: CategorySpending[]
): ActionPlanItem[] {
  const plans: ActionPlanItem[] = [];

  // 30-Day Actions (Immediate)
  if (metrics.savingsRate < 20) {
    const targetIncrease = Math.min(5, 20 - metrics.savingsRate);
    plans.push({
      title: 'Increase Savings Rate',
      description: `Boost savings rate by ${targetIncrease.toFixed(0)}% through expense cuts`,
      category: '30_DAY',
      priority: 1,
      targetValue: metrics.savingsRate + targetIncrease,
    });
  }

  const highestOverBudget = categorySpending
    .filter(c => c.overBudget && c.budget)
    .sort((a, b) => (b.amount - (b.budget || 0)) - (a.amount - (a.budget || 0)))[0];

  if (highestOverBudget) {
    plans.push({
      title: `Reduce ${highestOverBudget.category} Spending`,
      description: `Cut ${highestOverBudget.category} expenses by ₹${((highestOverBudget.amount - (highestOverBudget.budget || 0)) * 0.5).toFixed(0)}`,
      category: '30_DAY',
      priority: 2,
      targetValue: highestOverBudget.budget,
    });
  }

  if (metrics.emergencyFundMonths < 3) {
    plans.push({
      title: 'Build Emergency Fund',
      description: 'Add ₹10,000 to emergency savings this month',
      category: '30_DAY',
      priority: 3,
      targetValue: 10000,
    });
  }

  // 60-Day Actions (Short-term)
  if (metrics.debtToIncomeRatio > 30) {
    plans.push({
      title: 'Accelerate Debt Payoff',
      description: 'Pay extra ₹5,000 toward highest-interest debt',
      category: '60_DAY',
      priority: 1,
      targetValue: 5000,
    });
  }

  plans.push({
    title: 'Start/Increase SIP',
    description: 'Begin or increase systematic investment by ₹2,000/month',
    category: '60_DAY',
    priority: 2,
    targetValue: 2000,
  });

  if (metrics.discretionaryRatio > 35) {
    plans.push({
      title: 'Reduce Discretionary Spending',
      description: `Cut discretionary expenses to below 30% (currently ${metrics.discretionaryRatio.toFixed(0)}%)`,
      category: '60_DAY',
      priority: 3,
      targetValue: 30,
    });
  }

  // 90-Day Actions (Medium-term)
  plans.push({
    title: 'Achieve Target Savings Rate',
    description: 'Reach 25% savings rate through sustained discipline',
    category: '90_DAY',
    priority: 1,
    targetValue: 25,
  });

  if (metrics.emergencyFundMonths < 6) {
    plans.push({
      title: 'Complete Emergency Fund',
      description: 'Build emergency fund to cover 6 months of expenses',
      category: '90_DAY',
      priority: 2,
      targetValue: 6,
    });
  }

  plans.push({
    title: 'Diversify Investments',
    description: 'Allocate investments: 50% equity, 30% debt, 20% emergency',
    category: '90_DAY',
    priority: 3,
  });

  return plans;
}

// ============ LIFESTYLE LEAK DETECTION ============

export function detectLifestyleLeaks(
  transactions: Array<{ amount: number; category: string; date: Date; merchant?: string }>
): LifestyleLeak[] {
  const leaks: LifestyleLeak[] = [];

  // Small transactions (impulse spending)
  const smallTransactions = transactions.filter(t => t.amount > 0 && t.amount < 500);
  const smallTotal = smallTransactions.reduce((sum, t) => sum + t.amount, 0);
  if (smallTransactions.length > 10 && smallTotal > 5000) {
    leaks.push({
      type: 'IMPULSE_SPENDING',
      description: `${smallTransactions.length} small transactions under ₹500`,
      amount: smallTotal,
      count: smallTransactions.length,
      suggestion: 'Consider reviewing impulse purchases. Small spends add up quickly.',
    });
  }

  // Weekend overspending
  const weekendTransactions = transactions.filter(t => {
    const day = new Date(t.date).getDay();
    return day === 0 || day === 6;
  });
  const weekendTotal = weekendTransactions.reduce((sum, t) => sum + t.amount, 0);
  const weekdayTotal = transactions.reduce((sum, t) => sum + t.amount, 0) - weekendTotal;
  const avgWeekendDaily = weekendTotal / 8; // ~8 weekend days per month
  const avgWeekdayDaily = weekdayTotal / 22; // ~22 weekdays per month

  if (avgWeekendDaily > avgWeekdayDaily * 1.5) {
    leaks.push({
      type: 'WEEKEND_OVERSPENDING',
      description: 'Weekend spending is significantly higher than weekdays',
      amount: weekendTotal,
      count: weekendTransactions.length,
      suggestion: 'Plan weekend activities with a budget. Consider free alternatives.',
    });
  }

  // Subscription stacking
  const subscriptionCategories = ['Subscriptions', 'Entertainment', 'Streaming'];
  const subscriptions = transactions.filter(t => 
    subscriptionCategories.some(cat => t.category.toLowerCase().includes(cat.toLowerCase()))
  );
  const subscriptionTotal = subscriptions.reduce((sum, t) => sum + t.amount, 0);
  if (subscriptionTotal > 2000) {
    leaks.push({
      type: 'SUBSCRIPTION_STACKING',
      description: 'Multiple subscription services detected',
      amount: subscriptionTotal,
      count: subscriptions.length,
      suggestion: 'Audit subscriptions. Cancel unused services and consider sharing plans.',
    });
  }

  // Frequent food delivery
  const foodDelivery = transactions.filter(t => 
    t.category.toLowerCase().includes('food') || 
    t.merchant?.toLowerCase().includes('swiggy') ||
    t.merchant?.toLowerCase().includes('zomato')
  );
  const foodTotal = foodDelivery.reduce((sum, t) => sum + t.amount, 0);
  if (foodDelivery.length > 15 && foodTotal > 5000) {
    leaks.push({
      type: 'FOOD_DELIVERY',
      description: `${foodDelivery.length} food delivery orders this month`,
      amount: foodTotal,
      count: foodDelivery.length,
      suggestion: 'Meal prep can save 50-70% compared to delivery. Try cooking more at home.',
    });
  }

  return leaks;
}

// ============ FINANCIAL FREEDOM ESTIMATOR ============

export function calculateFreedomProjection(
  currentSavings: number,
  monthlySavings: number,
  targetAmount: number,
  annualReturnRate: number = 0.10 // 10% default
): FreedomProjection {
  const monthlyRate = annualReturnRate / 12;
  
  // Using future value formula with compound interest
  // FV = PV(1+r)^n + PMT * ((1+r)^n - 1) / r
  // Solving for n (months)
  
  let months = 0;
  let currentValue = currentSavings;
  const maxMonths = 600; // 50 years cap

  while (currentValue < targetAmount && months < maxMonths) {
    currentValue = currentValue * (1 + monthlyRate) + monthlySavings;
    months++;
  }

  const requiredMonthlySavings = months >= maxMonths ? 
    (targetAmount - currentSavings) / 120 : // Simplified if too long
    monthlySavings;

  return {
    targetAmount,
    yearsToReach: Math.floor(months / 12),
    monthsToReach: months,
    requiredMonthlySavings,
    currentMonthlySavings: monthlySavings,
    onTrack: months < maxMonths,
  };
}

export function calculateMultipleFreedomTargets(
  currentSavings: number,
  monthlySavings: number
): FreedomProjection[] {
  const targets = [1000000, 5000000, 10000000, 25000000]; // 10L, 50L, 1Cr, 2.5Cr
  return targets.map(target => calculateFreedomProjection(currentSavings, monthlySavings, target));
}

// ============ SCENARIO SIMULATION ============

export function simulateScenario(
  currentMetrics: FinancialMetrics,
  change: { type: 'INCREASE_SAVINGS' | 'REDUCE_EXPENSE' | 'INCREASE_INCOME'; amount: number; category?: string }
): SimulationResult {
  let annualImpact = 0;
  let newSavingsRate = currentMetrics.savingsRate;
  const monthlyIncome = currentMetrics.totalIncome;
  const monthlyExpenses = currentMetrics.totalExpenses;

  switch (change.type) {
    case 'INCREASE_SAVINGS':
      annualImpact = change.amount * 12;
      newSavingsRate = ((monthlyIncome - monthlyExpenses + change.amount) / monthlyIncome) * 100;
      break;
    case 'REDUCE_EXPENSE':
      annualImpact = change.amount * 12;
      newSavingsRate = ((monthlyIncome - monthlyExpenses + change.amount) / monthlyIncome) * 100;
      break;
    case 'INCREASE_INCOME':
      annualImpact = change.amount * 12;
      newSavingsRate = ((monthlyIncome + change.amount - monthlyExpenses) / (monthlyIncome + change.amount)) * 100;
      break;
  }

  // 5-year projection with 10% annual return
  const fiveYearImpact = annualImpact * 5 * 1.5; // Simplified compound effect

  return {
    scenario: `${change.type.replace('_', ' ')} by ₹${change.amount}/month`,
    annualImpact,
    fiveYearImpact,
    netWorthChange: fiveYearImpact,
    newSavingsRate,
  };
}

// ============ WEALTH BUILDING SUGGESTIONS ============

export function getWealthBuildingSuggestions(metrics: FinancialMetrics): string[] {
  const suggestions: string[] = [];

  // Emergency fund first
  if (metrics.emergencyFundMonths < 6) {
    suggestions.push(`Build emergency fund to 6 months (currently ${metrics.emergencyFundMonths.toFixed(1)} months). This is your financial foundation.`);
  }

  // Debt strategy
  if (metrics.debtToIncomeRatio > 20) {
    suggestions.push('Use the Avalanche method: Pay minimum on all debts, put extra toward highest-interest debt first.');
  }

  // Investment allocation
  suggestions.push('Consider a balanced allocation: 50% equity index funds, 30% debt funds, 20% liquid/emergency.');

  // Compounding mindset
  const monthlyInvestment = metrics.totalIncome * 0.2;
  const tenYearProjection = monthlyInvestment * 12 * 10 * 1.8; // Rough 10% CAGR
  suggestions.push(`Investing ₹${monthlyInvestment.toFixed(0)}/month (20% of income) could grow to ~₹${(tenYearProjection/100000).toFixed(1)}L in 10 years with compounding.`);

  // Income diversification
  suggestions.push('Consider building a secondary income source. Even ₹5,000/month extra accelerates wealth building significantly.');

  return suggestions;
}

// ============ RISK EXPOSURE ANALYSIS ============

export interface RiskExposure {
  singleIncomeRisk: number; // % income from single source
  cashHeavyRisk: number; // % assets in cash
  leverageRisk: number; // liabilities vs assets ratio
  alerts: string[];
}

export function analyzeRiskExposure(
  incomeSources: Array<{ amount: number }>,
  totalAssets: number,
  cashAssets: number,
  totalDebts: number
): RiskExposure {
  const alerts: string[] = [];
  const totalIncome = incomeSources.reduce((sum, s) => sum + s.amount, 0);
  const maxIncome = Math.max(...incomeSources.map(s => s.amount));

  const singleIncomeRisk = totalIncome > 0 ? (maxIncome / totalIncome) * 100 : 100;
  const cashHeavyRisk = totalAssets > 0 ? (cashAssets / totalAssets) * 100 : 0;
  const leverageRisk = totalAssets > 0 ? (totalDebts / totalAssets) * 100 : 0;

  if (singleIncomeRisk > 80) {
    alerts.push('High dependency on single income source. Consider diversifying income streams.');
  }

  if (cashHeavyRisk > 40) {
    alerts.push('Too much idle cash. Consider investing excess for better returns.');
  }

  if (leverageRisk > 50) {
    alerts.push('High leverage ratio. Focus on debt reduction to improve financial stability.');
  }

  return { singleIncomeRisk, cashHeavyRisk, leverageRisk, alerts };
}

// ============ FAMILY SETTLEMENT OPTIMIZATION ============

export interface FamilyBalance {
  person: string;
  netBalance: number; // positive = owed money, negative = owes money
}

export interface SettlementTransaction {
  from: string;
  to: string;
  amount: number;
}

export function calculateFamilyBalances(
  transactions: Array<{ fromPerson: string; toPerson: string; amount: number; isSettled: boolean }>
): FamilyBalance[] {
  const balances: Record<string, number> = {};

  transactions
    .filter(t => !t.isSettled)
    .forEach(t => {
      balances[t.fromPerson] = (balances[t.fromPerson] || 0) - t.amount;
      balances[t.toPerson] = (balances[t.toPerson] || 0) + t.amount;
    });

  return Object.entries(balances)
    .map(([person, netBalance]) => ({ person, netBalance }))
    .sort((a, b) => b.netBalance - a.netBalance);
}

export function optimizeSettlements(balances: FamilyBalance[]): SettlementTransaction[] {
  const settlements: SettlementTransaction[] = [];
  
  // Separate into creditors (positive balance) and debtors (negative balance)
  const creditors = balances.filter(b => b.netBalance > 0).map(b => ({ ...b }));
  const debtors = balances.filter(b => b.netBalance < 0).map(b => ({ ...b, netBalance: Math.abs(b.netBalance) }));

  // Greedy algorithm to minimize transactions
  while (creditors.length > 0 && debtors.length > 0) {
    creditors.sort((a, b) => b.netBalance - a.netBalance);
    debtors.sort((a, b) => b.netBalance - a.netBalance);

    const creditor = creditors[0];
    const debtor = debtors[0];

    const amount = Math.min(creditor.netBalance, debtor.netBalance);

    if (amount > 0) {
      settlements.push({
        from: debtor.person,
        to: creditor.person,
        amount: Math.round(amount * 100) / 100,
      });
    }

    creditor.netBalance -= amount;
    debtor.netBalance -= amount;

    if (creditor.netBalance <= 0.01) creditors.shift();
    if (debtor.netBalance <= 0.01) debtors.shift();
  }

  return settlements;
}
