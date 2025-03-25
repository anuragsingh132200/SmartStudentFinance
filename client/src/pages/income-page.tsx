import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { AddIncomeForm } from "@/components/forms/AddIncomeForm";
import { Income } from "@shared/schema";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, Trash2, Edit, PlusCircle } from "lucide-react";
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

export default function IncomePage() {
  const [addIncomeOpen, setAddIncomeOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIncomeId, setSelectedIncomeId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: incomes = [], isLoading } = useQuery<Income[]>({
    queryKey: ["/api/incomes"],
  });

  const handleDeleteClick = (id: number) => {
    setSelectedIncomeId(id);
    setDeleteDialogOpen(true);
  };

  const deleteIncome = async () => {
    if (!selectedIncomeId) return;
    
    try {
      await apiRequest("DELETE", `/api/incomes/${selectedIncomeId}`, undefined);
      queryClient.invalidateQueries({ queryKey: ["/api/incomes"] });
      toast({
        title: "Income deleted",
        description: "The income entry has been removed successfully"
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete income",
        variant: "destructive"
      });
    }
  };

  // Prepare data for income source chart
  const prepareIncomeBySourceData = () => {
    const sourceMap: Record<string, number> = {};
    
    incomes.forEach(income => {
      if (!sourceMap[income.source]) {
        sourceMap[income.source] = 0;
      }
      sourceMap[income.source] += income.amount;
    });
    
    return Object.entries(sourceMap).map(([source, amount]) => ({
      name: source,
      value: amount
    }));
  };

  // Calculate total income
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

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
        <Header title="Income Management" subtitle="Track and manage all your income sources" />
        
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 w-full md:max-w-xs">
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <p className="mt-1 text-3xl font-semibold text-gray-800 font-mono">{formatCurrency(totalIncome)}</p>
            </div>
            
            <Button 
              className="mt-4 md:mt-0 flex items-center"
              onClick={() => setAddIncomeOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Income
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Income History</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : incomes.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Recurring</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomes.map((income) => (
                        <TableRow key={income.id}>
                          <TableCell className="font-medium">{income.source}</TableCell>
                          <TableCell>{format(new Date(income.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{formatCurrency(income.amount)}</TableCell>
                          <TableCell>
                            {income.isRecurring ? (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                {income.frequency}
                              </span>
                            ) : "No"}
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
                                onClick={() => handleDeleteClick(income.id)}
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
                  <span className="material-icons text-gray-400 text-3xl mb-2">account_balance</span>
                  <p className="text-gray-500">No income entries yet</p>
                  <p className="text-xs text-gray-400 mt-1">Click "Add New Income" to get started</p>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Income by Source</h2>
              
              {incomes.length > 0 ? (
                <div className="h-72">
                  <Chart 
                    type="pie" 
                    data={prepareIncomeBySourceData()} 
                    dataKeys={["value"]} 
                    height={290}
                  />
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="text-center p-4">
                    <span className="material-icons text-3xl text-gray-400 mb-2">pie_chart</span>
                    <p className="text-sm text-gray-500">No data to display</p>
                    <p className="text-xs text-gray-400 mt-1">Add income to see distribution by source</p>
                  </div>
                </div>
              )}
              
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">Income Insights</h3>
                <ul className="space-y-1">
                  {incomes.length > 0 ? (
                    <>
                      <li className="text-xs text-gray-600">
                        Main income source: {
                          Object.entries(
                            incomes.reduce((acc, income) => {
                              acc[income.source] = (acc[income.source] || 0) + income.amount;
                              return acc;
                            }, {} as Record<string, number>)
                          )
                          .sort((a, b) => b[1] - a[1])[0]?.[0] || "None"
                        }
                      </li>
                      <li className="text-xs text-gray-600">
                        Recurring income: {
                          formatCurrency(
                            incomes
                              .filter(income => income.isRecurring)
                              .reduce((sum, income) => sum + income.amount, 0)
                          )
                        }
                      </li>
                      <li className="text-xs text-gray-600">
                        Last income date: {
                          incomes.length > 0
                            ? format(
                                new Date(
                                  Math.max(...incomes.map(i => new Date(i.date).getTime()))
                                ), 
                                'MMM dd, yyyy'
                              )
                            : "None"
                        }
                      </li>
                    </>
                  ) : (
                    <li className="text-xs text-gray-600">No income data available</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <MobileNavigation />
      
      {/* Add Income Dialog */}
      <AddIncomeForm open={addIncomeOpen} onOpenChange={setAddIncomeOpen} />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this income entry? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteIncome}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
