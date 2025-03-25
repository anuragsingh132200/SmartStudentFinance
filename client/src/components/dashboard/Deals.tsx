import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Deal } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function Deals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dealStore, setDealStore] = useState("");
  const [dealDescription, setDealDescription] = useState("");
  const [dealDiscount, setDealDiscount] = useState("");
  const [dealExpiryDate, setDealExpiryDate] = useState("");

  const { data: deals = [] } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const createDealMutation = useMutation({
    mutationFn: async (data: { store: string; description: string; discount: string; expiryDate: string }) => {
      const res = await apiRequest("POST", "/api/deals", {
        ...data,
        expiryDate: new Date(data.expiryDate).toISOString(),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setDialogOpen(false);
      setDealStore("");
      setDealDescription("");
      setDealDiscount("");
      setDealExpiryDate("");
      toast({
        title: "Success",
        description: "Your deal has been submitted for approval",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create deal",
        variant: "destructive",
      });
    },
  });

  const handleSubmitDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    createDealMutation.mutate({
      store: dealStore,
      description: dealDescription,
      discount: dealDiscount,
      expiryDate: dealExpiryDate
    });
  };

  // Helper to get icon for the deal type
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

  // Show most recent 3 deals
  const recentDeals = deals.sort((a, b) => 
    a.expiryDate && b.expiryDate 
      ? new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime()
      : 0
  ).slice(0, 3);

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
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Latest Deals</h2>
        <Link href="/deals">
          <a className="text-primary text-sm hover:underline">View All</a>
        </Link>
      </div>
      
      <div className="space-y-4">
        {recentDeals.length > 0 ? (
          recentDeals.map((deal) => (
            <div key={deal.id} className="flex items-start p-4 rounded-lg border border-gray-200">
              <div className={`${getDealBackground(deal.store)} p-3 rounded-lg mr-3`}>
                <span className={`material-icons ${getDealIconColor(deal.store)}`}>
                  {getDealIcon(deal.store)}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{deal.store}</p>
                    <p className="text-xs text-gray-500 mb-1">
                      {formatExpiryDate(deal.expiryDate)}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {deal.discount}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{deal.description}</p>
                <button className="mt-2 text-primary text-xs font-medium hover:underline">
                  Get Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <span className="material-icons text-gray-400 text-3xl mb-2">local_offer</span>
            <p className="text-gray-500">No deals available</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to share a student deal</p>
          </div>
        )}
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="mt-4 w-full py-2 bg-white border border-primary text-primary text-sm font-medium rounded-lg hover:bg-blue-50 flex items-center justify-center"
          >
            <span className="material-icons mr-1" style={{ fontSize: "18px" }}>add_circle</span>
            <span>Submit a Deal</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit a New Deal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitDeal} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Store/Business Name</label>
              <input
                type="text"
                value={dealStore}
                onChange={(e) => setDealStore(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                placeholder="E.g., Campus Bookstore"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Discount Type</label>
              <input
                type="text"
                value={dealDiscount}
                onChange={(e) => setDealDiscount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                placeholder="E.g., 20% OFF, BOGO, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={dealDescription}
                onChange={(e) => setDealDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                placeholder="Describe the deal details..."
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry Date</label>
              <input
                type="date"
                value={dealExpiryDate}
                onChange={(e) => setDealExpiryDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createDealMutation.isPending}>
                {createDealMutation.isPending ? "Submitting..." : "Submit Deal"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
