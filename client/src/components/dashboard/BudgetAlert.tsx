import { useQuery } from "@tanstack/react-query";
import { Budget, Expense } from "@shared/schema";
import { Link } from "wouter";
import { startOfMonth, endOfMonth } from "date-fns";

export function BudgetAlert() {
  const { data: budgets = [] } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });
  
  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  // Find budgets that are close to or exceeding their limits
  const getCurrentMonthBudgetAlerts = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    // Group expenses by category for the current month
    const expensesByCategory = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      })
      .reduce((acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
      }, {} as Record<string, number>);
    
    // Check each budget against expenses
    return budgets
      .filter(budget => budget.period === 'monthly')
      .map(budget => {
        const spent = expensesByCategory[budget.category] || 0;
        const percentSpent = Math.min(100, Math.round((spent / budget.amount) * 100));
        
        return {
          ...budget,
          spent,
          percentSpent,
          isAlert: percentSpent >= budget.alertThreshold
        };
      })
      .filter(budget => budget.isAlert)
      .sort((a, b) => b.percentSpent - a.percentSpent);
  };

  const alerts = getCurrentMonthBudgetAlerts();
  const topAlert = alerts.length > 0 ? alerts[0] : null;
  
  if (!topAlert) {
    return null; // No alerts to show
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl shadow-sm p-6">
      <div className="flex items-start">
        <div className="p-2 bg-amber-100 rounded-lg mr-3">
          <span className="material-icons text-amber-600">warning</span>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-800">Budget Alert</h3>
          <p className="mt-1 text-sm text-gray-700">
            You've reached {topAlert.percentSpent}% of your {topAlert.category} budget for this month.
          </p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-gray-600">{topAlert.category} Budget</span>
              <span className="font-medium text-amber-700">
                {formatCurrency(topAlert.spent)} / {formatCurrency(topAlert.amount)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{ width: `${topAlert.percentSpent}%` }}
              ></div>
            </div>
          </div>
          <Link href="/budget">
            <a className="mt-3 inline-block text-sm text-primary font-medium hover:underline">
              Review Budget
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
