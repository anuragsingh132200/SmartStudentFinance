import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Deal } from "@shared/schema";
import { DealForm } from "@/components/forms/DealForm";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function DealsPage() {
  const { user } = useAuth();
  const [dealFormOpen, setDealFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const { data: userDeals = [], isLoading: userDealsLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals/user"],
    enabled: !!user,
  });

  const handleDeleteClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDeal) return;
    
    try {
      await apiRequest("DELETE", `/api/deals/${selectedDeal.id}`, undefined);
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/deals/user"] });
      toast({
        title: "Deal deleted",
        description: "The deal has been removed successfully"
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete deal",
        variant: "destructive"
      });
    }
  };

  // Filter deals based on search query
  const filteredDeals = deals.filter(deal => 
    deal.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.discount.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to get icon for the deal type
  const getDealIcon = (store: string): string => {
    const storeIcons: Record<string, string> = {
      'Campus Bookstore': 'store',
      'Student Pizza': 'local_pizza',
      'Grocery Outlet': 'shopping_cart',
      'Coffee Shop': 'coffee',
      'Tech Store': 'laptop',
      'Cinema': 'movie'
    };
    
    return storeIcons[store] || 'local_offer';
  };

  // Get background color based on store name
  const getDealBackground = (store: string): string => {
    const storeBackgrounds: Record<string, string> = {
      'Campus Bookstore': 'bg-indigo-100',
      'Student Pizza': 'bg-purple-100',
      'Grocery Outlet': 'bg-amber-100',
      'Coffee Shop': 'bg-teal-100',
      'Tech Store': 'bg-blue-100',
      'Cinema': 'bg-rose-100'
    };
    
    return storeBackgrounds[store] || 'bg-gray-100';
  };

  // Get icon color based on store name
  const getDealIconColor = (store: string): string => {
    const storeColors: Record<string, string> = {
      'Campus Bookstore': 'text-indigo-600',
      'Student Pizza': 'text-purple-600',
      'Grocery Outlet': 'text-amber-600',
      'Coffee Shop': 'text-teal-600',
      'Tech Store': 'text-blue-600',
      'Cinema': 'text-rose-600'
    };
    
    return storeColors[store] || 'text-gray-600';
  };

  // Format date
  const formatExpiryDate = (dateString: string | null) => {
    if (!dateString) return "No expiry date";
    try {
      return `Valid until ${format(new Date(dateString), 'MMM d, yyyy')}`;
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        <Header title="Student Deals" subtitle="Discover and share money-saving deals for students" />
        
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="relative w-full md:max-w-xs">
              <Input
                type="text"
                placeholder="Search deals..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="material-icons absolute right-3 top-2 text-gray-400">search</span>
            </div>
            
            <Button 
              className="mt-4 md:mt-0 flex items-center"
              onClick={() => setDealFormOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit a Deal
            </Button>
          </div>
          
          {/* Main Deals Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest Deals</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredDeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDeals.map(deal => (
                  <div key={deal.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start">
                        <div className={`${getDealBackground(deal.store)} p-3 rounded-lg mr-3`}>
                          <span className={`material-icons ${getDealIconColor(deal.store)}`}>
                            {getDealIcon(deal.store)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-base font-medium text-gray-800">{deal.store}</p>
                              <p className="text-xs text-gray-500 mb-1">
                                {formatExpiryDate(deal.expiryDate)}
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              {deal.discount}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-2">{deal.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-white rounded-xl shadow-sm">
                <span className="material-icons text-gray-400 text-3xl mb-2">local_offer</span>
                <p className="text-gray-500">No deals found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search or submit a new deal</p>
              </div>
            )}
          </div>
          
          {/* User's Submitted Deals Section */}
          {user && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Submitted Deals</h2>
              
              {userDealsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userDeals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userDeals.map(deal => (
                    <div key={deal.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                      <div className="p-5">
                        <div className="flex items-start">
                          <div className={`${getDealBackground(deal.store)} p-3 rounded-lg mr-3`}>
                            <span className={`material-icons ${getDealIconColor(deal.store)}`}>
                              {getDealIcon(deal.store)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-base font-medium text-gray-800">{deal.store}</p>
                                <p className="text-xs text-gray-500 mb-1">
                                  {formatExpiryDate(deal.expiryDate)}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full mr-2 ${
                                  deal.approved 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {deal.approved ? "Approved" : "Pending"}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  {deal.discount}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mt-2">{deal.description}</p>
                            
                            <div className="flex justify-end mt-3">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleDeleteClick(deal)}
                              >
                                <span className="material-icons mr-1" style={{ fontSize: "16px" }}>delete</span>
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-white rounded-xl shadow-sm">
                  <span className="material-icons text-gray-400 text-3xl mb-2">local_offer</span>
                  <p className="text-gray-500">You haven't submitted any deals yet</p>
                  <p className="text-xs text-gray-400 mt-1">Click "Submit a Deal" to share with the community</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <MobileNavigation />
      
      {/* Deal Form Dialog */}
      <DealForm open={dealFormOpen} onOpenChange={setDealFormOpen} />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this deal? This action cannot be undone.
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
