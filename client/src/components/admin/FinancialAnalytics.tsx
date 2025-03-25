import React from "react";
import { Expense, Budget, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { startOfMonth, endOfMonth, subMonths, addMonths, format } from "date-fns";

interface FinancialAnalyticsProps {
  expenses: Expense[];
  budgets: Budget[];
  users: User[];
}

export function FinancialAnalytics({ expenses, budgets, users }: FinancialAnalyticsProps) {
  // Get current month
  const currentDate = new Date();
  const currentMonthStart = startOfMonth(currentDate);
  const currentMonthEnd = endOfMonth(currentDate);

  // Helper to get expenses for a specific month range
  const getExpensesForMonthRange = (startDate: Date, endDate: Date) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  // Prepare data for monthly expense chart (last 6 months)
  const getMonthlyExpenseData = () => {
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthExpenses = getExpensesForMonthRange(monthStart, monthEnd);
      
      const totalAmount = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      data.push({
        name: format(monthDate, 'MMM yy'),
        expenses: totalAmount,
      });
    }
    
    return data;
  };

  // Prepare data for category distribution chart
  const getCategoryData = () => {
    const categoryMap: Record<string, number> = {};
    
    expenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = 0;
      }
      categoryMap[expense.category] += expense.amount;
    });
    
    return Object.entries(categoryMap).map(([category, amount]) => ({
      name: category,
      value: amount,
    }));
  };

  // Prepare data for budget compliance
  const getBudgetComplianceData = () => {
    const budgetCategories = [...new Set(budgets.map(budget => budget.category))];
    
    return budgetCategories.map(category => {
      const categoryBudgets = budgets.filter(budget => budget.category === category);
      const totalBudget = categoryBudgets.reduce((sum, budget) => sum + budget.amount, 0);
      
      const categoryExpenses = expenses.filter(expense => expense.category === category);
      const totalExpense = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      const compliancePercentage = totalBudget > 0 ? Math.min(100, Math.round((totalExpense / totalBudget) * 100)) : 0;
      
      return {
        name: category,
        budget: totalBudget,
        spent: totalExpense,
        compliance: 100 - compliancePercentage,
      };
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const monthlyExpenseData = getMonthlyExpenseData();
  const categoryData = getCategoryData();
  const budgetComplianceData = getBudgetComplianceData();

  // Calculate top-level statistics
  const currentMonthExpenses = getExpensesForMonthRange(currentMonthStart, currentMonthEnd);
  const totalCurrentMonthExpense = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const previousMonthStart = startOfMonth(subMonths(currentDate, 1));
  const previousMonthEnd = endOfMonth(subMonths(currentDate, 1));
  const previousMonthExpenses = getExpensesForMonthRange(previousMonthStart, previousMonthEnd);
  const totalPreviousMonthExpense = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const percentChange = totalPreviousMonthExpense > 0 
    ? ((totalCurrentMonthExpense - totalPreviousMonthExpense) / totalPreviousMonthExpense) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Top statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCurrentMonthExpense)}</div>
            <div className="flex items-center mt-1 text-xs">
              <span className={`font-medium ${percentChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {percentChange > 0 ? '↑' : '↓'} {Math.abs(Math.round(percentChange))}%
              </span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="flex items-center mt-1 text-xs">
              <span className="text-gray-500">Total registered users</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Budget Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgets.length > 0 
                ? `${Math.round((budgetComplianceData.filter(item => item.spent <= item.budget).length / budgetComplianceData.length) * 100)}%`
                : 'N/A'
              }
            </div>
            <div className="flex items-center mt-1 text-xs">
              <span className="text-gray-500">Categories within budget</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Chart
                type="bar"
                data={monthlyExpenseData}
                dataKeys={["expenses"]}
                xAxisKey="name"
                height={300}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Chart
                type="pie"
                data={categoryData}
                dataKeys={["value"]}
                height={300}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget compliance table */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Compliance by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {budgetComplianceData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Budget</th>
                    <th className="text-left py-3 px-4">Spent</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetComplianceData.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{formatCurrency(item.budget)}</td>
                      <td className="py-3 px-4">{formatCurrency(item.spent)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.spent > item.budget 
                            ? 'bg-red-100 text-red-800' 
                            : item.spent >= item.budget * 0.8 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {item.spent > item.budget 
                            ? 'Over Budget' 
                            : item.spent >= item.budget * 0.8 
                              ? 'Near Limit' 
                              : 'Within Budget'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">No budget data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
