import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chart } from "@/components/ui/chart";
import { Budget, Expense } from "@shared/schema";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export function BudgetExpensesChart() {
  const [timeRange, setTimeRange] = useState("30");
  
  const { data: budgets = [] } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });
  
  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  // Get the date range based on selected time range
  const getDateRange = () => {
    const now = new Date();
    const days = parseInt(timeRange);
    
    if (days === 30) {
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
        rangeType: 'month'
      };
    } else if (days === 90) {
      return {
        start: startOfMonth(subMonths(now, 2)),
        end: endOfMonth(now),
        rangeType: 'quarter'
      };
    } else {
      // Year
      return {
        start: startOfMonth(subMonths(now, 11)),
        end: endOfMonth(now),
        rangeType: 'year'
      };
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    const { start, end, rangeType } = getDateRange();
    
    // Group budgets by category
    const budgetsByCategory = budgets.reduce((acc, budget) => {
      if (!acc[budget.category]) {
        acc[budget.category] = 0;
      }
      acc[budget.category] += budget.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Filter and group expenses by category within date range
    const expensesByCategory = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= start && expenseDate <= end;
      })
      .reduce((acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
      }, {} as Record<string, number>);
    
    // Combine into chart data
    const categories = [...new Set([...Object.keys(budgetsByCategory), ...Object.keys(expensesByCategory)])];
    
    return categories.map(category => ({
      name: category,
      Budget: budgetsByCategory[category] || 0,
      Expenses: expensesByCategory[category] || 0
    }));
  };

  const chartData = prepareChartData();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Budget vs Expenses</h2>
        <div className="relative">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="text-sm border-0 rounded-lg p-2 pr-8 bg-gray-100 w-40">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last Quarter</SelectItem>
              <SelectItem value="365">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="h-64 w-full">
        {chartData.length > 0 ? (
          <Chart
            data={chartData}
            type="bar"
            dataKeys={["Budget", "Expenses"]}
            xAxisKey="name"
            height={250}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div className="text-center p-4">
              <span className="material-icons text-3xl text-gray-400 mb-2">bar_chart</span>
              <p className="text-sm text-gray-500">No budget or expense data available</p>
              <p className="text-xs text-gray-400 mt-1">Create a budget and add expenses to see comparison</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-center mt-4 space-x-4">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-primary rounded-full mr-2"></span>
          <span className="text-sm text-gray-600">Budget</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-secondary-light rounded-full mr-2"></span>
          <span className="text-sm text-gray-600">Expenses</span>
        </div>
      </div>
    </div>
  );
}
