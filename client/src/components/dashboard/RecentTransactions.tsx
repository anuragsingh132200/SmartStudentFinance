import { useQuery } from "@tanstack/react-query";
import { Expense, Income } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";

type Transaction = {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  description: string;
  category: string;
  icon: string;
};

export function RecentTransactions() {
  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: incomes = [] } = useQuery<Income[]>({
    queryKey: ["/api/incomes"],
  });

  // Combine expenses and incomes into transactions
  const transactions: Transaction[] = [
    ...expenses.map(expense => ({
      id: expense.id,
      type: 'expense' as const,
      amount: expense.amount,
      date: expense.date,
      description: expense.description,
      category: expense.category,
      icon: getCategoryIcon(expense.category)
    })),
    ...incomes.map(income => ({
      id: income.id,
      type: 'income' as const,
      amount: income.amount,
      date: income.date,
      description: income.source,
      category: 'Income',
      icon: 'work'
    }))
  ]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 5); // Get the 5 most recent transactions

  // Get icon for expense category
  function getCategoryIcon(category: string): string {
    const categoryIcons: Record<string, string> = {
      'Food': 'restaurant',
      'Groceries': 'shopping_bag',
      'Rent': 'home',
      'Transportation': 'directions_bus',
      'Utilities': 'power',
      'Entertainment': 'movie',
      'Education': 'school',
      'Health': 'local_hospital',
      'Shopping': 'shopping_cart',
      'Travel': 'flight',
      'Other': 'more_horiz'
    };
    
    return categoryIcons[category] || 'payments';
  }

  // Format date
  const formatTransactionDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
        <Link href="/expenses">
          <a className="text-primary text-sm hover:underline">View All</a>
        </Link>
      </div>
      
      <div className="space-y-4">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div key={`${transaction.type}-${transaction.id}`} className="flex items-center py-2 border-b border-gray-100">
              <div className={`p-2 rounded-lg ${transaction.type === 'expense' ? 'bg-red-50' : 'bg-green-50'} mr-3`}>
                <span className={`material-icons ${transaction.type === 'expense' ? 'text-danger' : 'text-success'}`} style={{ fontSize: '20px' }}>
                  {transaction.icon}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{transaction.description}</p>
                <p className="text-xs text-gray-500">{formatTransactionDate(transaction.date)}</p>
              </div>
              <p className={`text-sm font-semibold ${transaction.type === 'expense' ? 'text-danger' : 'text-success'}`}>
                {transaction.type === 'expense' ? '- ' : '+ '}
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(transaction.amount)}
              </p>
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <span className="material-icons text-gray-400 text-3xl mb-2">account_balance_wallet</span>
            <p className="text-gray-500">No transaction history yet</p>
            <p className="text-xs text-gray-400 mt-1">Add your first income or expense</p>
          </div>
        )}
      </div>
    </div>
  );
}
