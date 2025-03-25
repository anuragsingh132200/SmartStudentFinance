import { useQuery } from "@tanstack/react-query";
import { Income, Expense, Budget, SavingsGoal } from "@shared/schema";
import { format } from "date-fns";

interface FinancialCardProps {
  title: string;
  amount: string;
  icon: string;
  iconBackground: string;
  borderColor: string;
  changeText?: string;
  changeType?: "increase" | "decrease" | "neutral";
  progress?: number;
}

function FinancialCard({
  title,
  amount,
  icon,
  iconBackground,
  borderColor,
  changeText,
  changeType,
  progress,
}: FinancialCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${borderColor}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-800 font-mono">{amount}</p>
        </div>
        <div className={`p-2 ${iconBackground} rounded-lg`}>
          <span className="material-icons text-primary">{icon}</span>
        </div>
      </div>
      {changeText && (
        <div className="mt-3 flex items-center text-sm">
          {changeType && (
            <span
              className={`font-medium flex items-center ${
                changeType === "increase" ? "text-success" : changeType === "decrease" ? "text-danger" : ""
              }`}
            >
              <span className="material-icons text-sm mr-1">
                {changeType === "increase" ? "arrow_upward" : "arrow_downward"}
              </span>
              <span>{changeText}</span>
            </span>
          )}
          {!changeType && <span className="text-success font-medium">{changeText}</span>}
        </div>
      )}
      {progress !== undefined && (
        <div className="mt-3 flex items-center text-sm">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-warning h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="ml-2 text-gray-500">{progress}%</span>
        </div>
      )}
    </div>
  );
}

export function FinancialSummary() {
  const { data: incomes = [] } = useQuery<Income[]>({
    queryKey: ["/api/incomes"],
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: budgets = [] } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const { data: savingsGoals = [] } = useQuery<SavingsGoal[]>({
    queryKey: ["/api/savings-goals"],
  });

  // Calculate totals
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyIncome = incomes
    .filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
    })
    .reduce((sum, income) => sum + income.amount, 0);
  
  const monthlyExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const totalBudget = budgets
    .filter(budget => budget.period === 'monthly')
    .reduce((sum, budget) => sum + budget.amount, 0);
  
  const budgetRemaining = Math.max(0, totalBudget - monthlyExpenses);
  
  // Get primary savings goal if exists
  const primarySavingsGoal = savingsGoals.length > 0 ? savingsGoals[0] : null;
  const savingsProgress = primarySavingsGoal 
    ? Math.round((primarySavingsGoal.currentAmount / primarySavingsGoal.targetAmount) * 100) 
    : 0;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <FinancialCard
        title="Monthly Income"
        amount={formatCurrency(monthlyIncome)}
        icon="account_balance"
        iconBackground="bg-blue-50"
        borderColor="border-primary"
        changeText="8.2%"
        changeType="increase"
      />
      
      <FinancialCard
        title="Total Expenses"
        amount={formatCurrency(monthlyExpenses)}
        icon="payments"
        iconBackground="bg-blue-50"
        borderColor="border-secondary-light"
        changeText="4.1%"
        changeType="increase"
      />
      
      <FinancialCard
        title="Budget Remaining"
        amount={formatCurrency(budgetRemaining)}
        icon="savings"
        iconBackground="bg-green-50"
        borderColor="border-success"
        changeText={`${budgetRemaining > 0 ? Math.round((budgetRemaining / totalBudget) * 100) : 0}% of budget left`}
      />
      
      {primarySavingsGoal ? (
        <FinancialCard
          title="Savings Goal"
          amount={formatCurrency(primarySavingsGoal.currentAmount)}
          icon="emoji_events"
          iconBackground="bg-amber-50"
          borderColor="border-warning"
          progress={savingsProgress}
        />
      ) : (
        <FinancialCard
          title="Savings Goal"
          amount="$0.00"
          icon="emoji_events"
          iconBackground="bg-amber-50"
          borderColor="border-warning"
          progress={0}
        />
      )}
    </div>
  );
}
