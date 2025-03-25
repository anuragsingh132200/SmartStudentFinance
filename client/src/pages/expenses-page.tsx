import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { AddExpenseForm } from "@/components/forms/AddExpenseForm";
import { Expense } from "@shared/schema";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, Trash2, Edit, Filter, PlusCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Chart } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ExpensesPage() {
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [timeFilter, setTimeFilter] = useState("current");
  const { toast } = useToast();

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const handleDeleteClick = (id: number) => {
    setSelectedExpenseId(id);
    setDeleteDialogOpen(true);
  };

  const deleteExpense = async () => {
    if (!selectedExpenseId) return;
    
    try {
      await apiRequest("DELETE", `/api/expenses/${selectedExpenseId}`, undefined);
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Expense deleted",
        description: "The expense entry has been removed successfully"
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive"
      });
    }
  };

  // Filter expenses based on selected time period
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeFilter) {
      case "current":
        startDate = startOfMonth(now);
        break;
      case "last":
        startDate = startOfMonth(subMonths(now, 1));
        now.setDate(0); // Last day of previous month
        break;
      case "quarter":
        startDate = startOfMonth(subMonths(now, 2));
        break;
      default:
        startDate = new Date(0); // Show all expenses
        break;
    }
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return timeFilter === "all" || (expenseDate >= startDate && expenseDate <= now);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, timeFilter]);

  // Prepare data for category chart
  const expensesByCategory = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    
    filteredExpenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = 0;
      }
      categoryMap[expense.category] += expense.amount;
    });
    
    return Object.entries(categoryMap).map(([category, amount]) => ({
      name: category,
      value: amount
    }));
  }, [filteredExpenses]);

  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        <Header title="Expense Tracking" subtitle="Monitor and categorize your spending" />
        
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 w-full md:max-w-xs">
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="mt-1 text-3xl font-semibold text-gray-800 font-mono">{formatCurrency(totalExpenses)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {timeFilter === "current" ? "Current month" : 
                 timeFilter === "last" ? "Last month" : 
                 timeFilter === "quarter" ? "Last 3 months" : "All time"}
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-4 md:mt-0">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="last">Last Month</SelectItem>
                  <SelectItem value="quarter">Last 3 Months</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                className="flex items-center"
                onClick={() => setAddExpenseOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Expenses</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredExpenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>
                            <span className="inline-flex items-center">
                              <span className="material-icons mr-1 text-sm">
                                {expense.category === "Food" ? "restaurant" :
                                 expense.category === "Groceries" ? "shopping_bag" :
                                 expense.category === "Rent" ? "home" :
                                 expense.category === "Transportation" ? "directions_bus" :
                                 expense.category === "Utilities" ? "power" :
                                 expense.category === "Entertainment" ? "movie" :
                                 expense.category === "Education" ? "school" :
                                 expense.category === "Health" ? "local_hospital" :
                                 expense.category === "Shopping" ? "shopping_cart" :
                                 expense.category === "Travel" ? "flight" : "more_horiz"}
                              </span>
                              {expense.category}
                            </span>
                          </TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell className="font-medium text-danger">
                            {formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => handleDeleteClick(expense.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <span className="material-icons text-gray-400 text-3xl mb-2">receipt_long</span>
                  <p className="text-gray-500">No expense entries for this period</p>
                  <p className="text-xs text-gray-400 mt-1">Click "Add Expense" to record your spending</p>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Category</h2>
              
              {filteredExpenses.length > 0 ? (
                <div className="h-72">
                  <Chart 
                    type="pie" 
                    data={expensesByCategory} 
                    dataKeys={["value"]} 
                    height={290}
                  />
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="text-center p-4">
                    <span className="material-icons text-3xl text-gray-400 mb-2">pie_chart</span>
                    <p className="text-sm text-gray-500">No data to display</p>
                    <p className="text-xs text-gray-400 mt-1">Add expenses to see distribution by category</p>
                  </div>
                </div>
              )}
              
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">Spending Insights</h3>
                <ul className="space-y-1">
                  {filteredExpenses.length > 0 ? (
                    <>
                      <li className="text-xs text-gray-600">
                        Top expense category: {
                          expensesByCategory.length > 0
                            ? expensesByCategory.sort((a, b) => b.value - a.value)[0].name
                            : "None"
                        }
                      </li>
                      <li className="text-xs text-gray-600">
                        Average expense: {
                          formatCurrency(totalExpenses / filteredExpenses.length)
                        }
                      </li>
                      <li className="text-xs text-gray-600">
                        Most recent expense: {
                          filteredExpenses.length > 0
                            ? format(new Date(filteredExpenses[0].date), 'MMM dd, yyyy')
                            : "None"
                        }
                      </li>
                    </>
                  ) : (
                    <li className="text-xs text-gray-600">No expense data available</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <MobileNavigation />
      
      {/* Add Expense Dialog */}
      <AddExpenseForm open={addExpenseOpen} onOpenChange={setAddExpenseOpen} />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this expense entry? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteExpense}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
