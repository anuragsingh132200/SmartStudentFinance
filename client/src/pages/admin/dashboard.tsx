import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { User, CommunityTip, Deal, Expense, Budget } from "@shared/schema";
import { Chart } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, Users, MessageSquare, TagIcon, AlertTriangle } from "lucide-react";
import { UsersList } from "@/components/admin/UsersList";
import { ModerationQueue } from "@/components/admin/ModerationQueue";
import { FinancialAnalytics } from "@/components/admin/FinancialAnalytics";

export default function AdminDashboard() {
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: tips = [], isLoading: tipsLoading } = useQuery<CommunityTip[]>({
    queryKey: ["/api/community-tips/all"],
  });

  const { data: deals = [], isLoading: dealsLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals/all"],
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const isLoading = usersLoading || tipsLoading || dealsLoading || expensesLoading || budgetsLoading;

  // Get pending moderation items
  const pendingTips = tips.filter(tip => !tip.approved);
  const pendingDeals = deals.filter(deal => !deal.approved);
  const totalPending = pendingTips.length + pendingDeals.length;

  // Find budget alerts
  const findBudgetAlerts = () => {
    const alertUsers: { userId: number; category: string; percentSpent: number }[] = [];
    
    budgets.forEach(budget => {
      const userExpenses = expenses.filter(expense => 
        expense.userId === budget.userId && expense.category === budget.category
      );
      
      const totalSpent = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const percentSpent = Math.round((totalSpent / budget.amount) * 100);
      
      if (percentSpent >= budget.alertThreshold) {
        alertUsers.push({
          userId: budget.userId,
          category: budget.category,
          percentSpent: percentSpent,
        });
      }
    });
    
    return alertUsers;
  };
  
  const budgetAlerts = findBudgetAlerts();

  // Get user by ID helper
  const getUserById = (userId: number) => {
    return users.find(user => user.id === userId);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        <Header title="Admin Dashboard" subtitle="System monitoring and management" />
        
        <div className="p-4 md:p-8">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-primary mr-2" />
                      <span className="text-2xl font-bold">{users.length}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {users.filter(user => user.isAdmin).length} administrators
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Pending Moderation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-amber-500 mr-2" />
                      <span className="text-2xl font-bold">{totalPending}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {pendingTips.length} tips, {pendingDeals.length} deals
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Community Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <TagIcon className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-2xl font-bold">{tips.length + deals.length}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {tips.length} tips, {deals.length} deals
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Budget Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-2xl font-bold">{budgetAlerts.length}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Users exceeding budget thresholds
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Admin Tabs */}
              <Tabs defaultValue="users" className="mb-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="moderation">Moderation Queue</TabsTrigger>
                  <TabsTrigger value="analytics">Financial Analytics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="users">
                  <UsersList users={users} />
                </TabsContent>
                
                <TabsContent value="moderation">
                  <ModerationQueue tips={pendingTips} deals={pendingDeals} />
                </TabsContent>
                
                <TabsContent value="analytics">
                  <FinancialAnalytics 
                    expenses={expenses} 
                    budgets={budgets}
                    users={users}
                  />
                </TabsContent>
              </Tabs>
              
              {/* Budget Alerts Section */}
              {budgetAlerts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    Budget Alert Notifications
                  </h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Category</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {budgetAlerts.map((alert, index) => {
                          const user = getUserById(alert.userId);
                          return user ? (
                            <tr key={index}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                                {user.fullName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {user.email}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {alert.category}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  alert.percentSpent >= 100 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {alert.percentSpent >= 100 ? 'Over Budget' : 'Near Limit'} ({alert.percentSpent}%)
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <Button variant="outline" size="sm">
                                  Notify
                                </Button>
                              </td>
                            </tr>
                          ) : null;
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Quick Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/users">
                  <a className="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-sm transition-all flex items-center">
                    <Users className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm font-medium">Manage Users</span>
                  </a>
                </Link>
                
                <Link href="/admin/moderation">
                  <a className="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-sm transition-all flex items-center">
                    <MessageSquare className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm font-medium">Content Moderation</span>
                  </a>
                </Link>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-sm transition-all flex items-center">
                  <span className="material-icons text-primary mr-2">backup</span>
                  <span className="text-sm font-medium">System Backup</span>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
