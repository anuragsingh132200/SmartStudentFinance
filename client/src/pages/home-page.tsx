import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Header } from "@/components/layout/Header";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { BudgetExpensesChart } from "@/components/dashboard/BudgetExpensesChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { CommunityTips } from "@/components/dashboard/CommunityTips";
import { Deals } from "@/components/dashboard/Deals";
import { BudgetAlert } from "@/components/dashboard/BudgetAlert";
import { FinancialResources } from "@/components/dashboard/FinancialResources";
import { AddExpenseForm } from "@/components/forms/AddExpenseForm";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user } = useAuth();
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" id="app-container">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        {/* Mobile Header */}
        <Header 
          title="Dashboard" 
          subtitle={`Welcome back, ${user?.fullName.split(' ')[0] || 'User'}! Here's your financial overview.`} 
        />
        
        {/* Dashboard Content */}
        <div className="p-4 md:p-8">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div>
              {/* Header is now handled by the Header component */}
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <Button
                className="flex items-center px-3 py-2 text-sm font-medium"
                onClick={() => setExpenseDialogOpen(true)}
              >
                <span className="material-icons text-sm mr-1">add</span>
                <span>Add Expense</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center px-3 py-2 text-sm font-medium"
              >
                <span className="material-icons text-sm mr-1">bar_chart</span>
                <span>Reports</span>
              </Button>
            </div>
          </div>
          
          {/* Financial Summary Cards */}
          <FinancialSummary />
          
          {/* Budget vs Expenses Chart & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <BudgetExpensesChart />
            <RecentTransactions />
          </div>
          
          {/* Community & Deals Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CommunityTips />
            <Deals />
          </div>
          
          {/* Budget Alert & Resources */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <BudgetAlert />
            <FinancialResources />
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation Bar */}
      <MobileNavigation />

      {/* Add Expense Dialog */}
      <AddExpenseForm open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen} />
    </div>
  );
}
