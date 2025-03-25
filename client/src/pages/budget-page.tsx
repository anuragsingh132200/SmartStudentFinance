import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Budget, Expense, SavingsGoal } from "@shared/schema";
import { BudgetForm } from "@/components/forms/BudgetForm";
import { SavingsGoalForm } from "@/components/forms/SavingsGoalForm";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Edit, Trash2, PlusCircle, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function BudgetPage() {
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [savingsGoalFormOpen, setSavingsGoalFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<'budget' | 'savings'>('budget');
  const { toast } = useToast();

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: savingsGoals = [], isLoading: savingsLoading } = useQuery<SavingsGoal[]>({
    queryKey: ["/api/savings-goals"],
  });

  // Prepare budget vs. spending data
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= monthStart && expenseDate <= monthEnd;
  });
  
  const getBudgetSpending = (budgetCategory: string) => {
    return currentMonthExpenses
      .filter(expense => expense.category === budgetCategory)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleDeleteClick = (id: number, type: 'budget' | 'savings') => {
    setSelectedItemId(id);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItemId) return;
    
    try {
      if (deleteType === 'budget') {
        await apiRequest("DELETE", `/api/budgets/${selectedItemId}`, undefined);
        queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
        toast({
          title: "Budget deleted",
          description: "The budget has been removed successfully"
        });
      } else {
        await apiRequest("DELETE", `/api/savings-goals/${selectedItemId}`, undefined);
        queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
        toast({
          title: "Savings goal deleted",
          description: "The savings goal has been removed successfully"
        });
      }
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${deleteType}`,
        variant: "destructive"
      });
    }
  };

  const isLoading = budgetsLoading || expensesLoading || savingsLoading;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        <Header title="Budget Planning" subtitle="Set and monitor your spending limits and savings goals" />
        
        <div className="p-4 md:p-8">
          {/* Budget Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Monthly Budgets</h2>
              <Button onClick={() => setBudgetFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : budgets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.map(budget => {
                  const spent = getBudgetSpending(budget.category);
                  const percentSpent = Math.min(100, Math.round((spent / budget.amount) * 100));
                  const isOverBudget = spent > budget.amount;
                  const isNearLimit = percentSpent >= budget.alertThreshold && !isOverBudget;
                  
                  return (
                    <Card 
                      key={budget.id}
                      className={`${
                        isOverBudget 
                          ? 'border-red-300 bg-red-50' 
                          : isNearLimit 
                            ? 'border-amber-300 bg-amber-50' 
                            : ''
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{budget.category}</CardTitle>
                            <CardDescription>Monthly Budget</CardDescription>
                          </div>
                          <div className="flex space-x-1">
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
                              onClick={() => handleDeleteClick(budget.id, 'budget')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            {formatCurrency(spent)} of {formatCurrency(budget.amount)}
                          </span>
                          <span className={`text-sm font-medium ${
                            isOverBudget 
                              ? 'text-red-600' 
                              : isNearLimit 
                                ? 'text-amber-600' 
                                : 'text-green-600'
                          }`}>
                            {percentSpent}%
                          </span>
                        </div>
                        <Progress 
                          value={percentSpent} 
                          className={`h-2 ${
                            isOverBudget 
                              ? 'bg-red-200' 
                              : isNearLimit 
                                ? 'bg-amber-200' 
                                : 'bg-gray-200'
                          }`}
                          indicatorClassName={`${
                            isOverBudget 
                              ? 'bg-red-600' 
                              : isNearLimit 
                                ? 'bg-amber-500' 
                                : 'bg-green-600'
                          }`}
                        />
                        {isOverBudget && (
                          <p className="mt-2 text-xs font-medium text-red-600">
                            You've exceeded this budget by {formatCurrency(spent - budget.amount)}
                          </p>
                        )}
                        {isNearLimit && (
                          <p className="mt-2 text-xs font-medium text-amber-600">
                            You're approaching your budget limit
                          </p>
                        )}
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="text-xs text-gray-500">
                          Alert at {budget.alertThreshold}% of budget
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center bg-white rounded-xl shadow-sm">
                <span className="material-icons text-gray-400 text-3xl mb-2">account_balance</span>
                <p className="text-gray-500">No budgets set up yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Add Budget" to create your first budget</p>
              </div>
            )}
          </div>
          
          {/* Savings Goals Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Savings Goals</h2>
              <Button onClick={() => setSavingsGoalFormOpen(true)}>
                <Target className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : savingsGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savingsGoals.map(goal => {
                  const progressPercent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                  const remaining = goal.targetAmount - goal.currentAmount;
                  
                  return (
                    <Card key={goal.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{goal.name}</CardTitle>
                            <CardDescription>
                              {goal.deadline && `Target date: ${format(new Date(goal.deadline), 'MMM dd, yyyy')}`}
                            </CardDescription>
                          </div>
                          <div className="flex space-x-1">
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
                              onClick={() => handleDeleteClick(goal.id, 'savings')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                          </span>
                          <span className="text-sm font-medium text-blue-600">
                            {progressPercent}%
                          </span>
                        </div>
                        <Progress 
                          value={progressPercent} 
                          className="h-2 bg-gray-200"
                        />
                        <p className="mt-2 text-xs text-gray-600">
                          {remaining > 0 
                            ? `${formatCurrency(remaining)} more to reach your goal` 
                            : "Goal achieved! Congratulations!"}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="text-xs text-gray-500">
                          {goal.notes}
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center bg-white rounded-xl shadow-sm">
                <span className="material-icons text-gray-400 text-3xl mb-2">savings</span>
                <p className="text-gray-500">No savings goals set up yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Add Goal" to set your first savings target</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <MobileNavigation />
      
      {/* Budget Form Dialog */}
      <BudgetForm open={budgetFormOpen} onOpenChange={setBudgetFormOpen} />
      
      {/* Savings Goal Form Dialog */}
      <SavingsGoalForm open={savingsGoalFormOpen} onOpenChange={setSavingsGoalFormOpen} />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this {deleteType}? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
