import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useQuery } from "@tanstack/react-query";
import { CommunityTip, Deal } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { ModerationQueue } from "@/components/admin/ModerationQueue";

export default function AdminModeration() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  const { data: tips = [], isLoading: tipsLoading } = useQuery<CommunityTip[]>({
    queryKey: ["/api/community-tips/all"],
  });

  const { data: deals = [], isLoading: dealsLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals/all"],
  });

  const isLoading = tipsLoading || dealsLoading;

  // Get pending moderation items
  const pendingTips = tips.filter(tip => !tip.approved);
  const pendingDeals = deals.filter(deal => !deal.approved);
  const approvedTips = tips.filter(tip => tip.approved);
  const approvedDeals = deals.filter(deal => deal.approved);

  const approveTip = async (tipId: number) => {
    try {
      await apiRequest("POST", `/api/community-tips/${tipId}/approve`, {});
      queryClient.invalidateQueries({ queryKey: ["/api/community-tips/all"] });
      toast({
        title: "Success",
        description: "Tip has been approved and published"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve tip",
        variant: "destructive"
      });
    }
  };

  const rejectTip = async (tipId: number) => {
    try {
      await apiRequest("DELETE", `/api/community-tips/${tipId}`, undefined);
      queryClient.invalidateQueries({ queryKey: ["/api/community-tips/all"] });
      toast({
        title: "Success",
        description: "Tip has been rejected and removed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject tip",
        variant: "destructive"
      });
    }
  };

  const approveDeal = async (dealId: number) => {
    try {
      await apiRequest("POST", `/api/deals/${dealId}/approve`, {});
      queryClient.invalidateQueries({ queryKey: ["/api/deals/all"] });
      toast({
        title: "Success",
        description: "Deal has been approved and published"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve deal",
        variant: "destructive"
      });
    }
  };

  const rejectDeal = async (dealId: number) => {
    try {
      await apiRequest("DELETE", `/api/deals/${dealId}`, undefined);
      queryClient.invalidateQueries({ queryKey: ["/api/deals/all"] });
      toast({
        title: "Success",
        description: "Deal has been rejected and removed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject deal",
        variant: "destructive"
      });
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        <Header title="Content Moderation" subtitle="Review and approve community content" />

        <div className="p-4 md:p-8">
          <div className="flex items-center mb-6">
            <Link href="/admin/dashboard">
              <a className="flex items-center text-sm text-gray-500 hover:text-primary">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Dashboard
              </a>
            </Link>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Pending ({pendingTips.length + pendingDeals.length})</TabsTrigger>
              <TabsTrigger value="tips">Tips ({pendingTips.length})</TabsTrigger>
              <TabsTrigger value="deals">Deals ({pendingDeals.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pendingTips.length > 0 || pendingDeals.length > 0 ? (
                <ModerationQueue 
                  tips={pendingTips} 
                  deals={pendingDeals}
                  onApproveTip={approveTip}
                  onRejectTip={rejectTip}
                  onApproveDeal={approveDeal}
                  onRejectDeal={rejectDeal}
                />
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <Check className="h-10 w-10 text-green-500 mb-4" />
                      <p className="text-gray-600 mb-2">No pending content to moderate</p>
                      <p className="text-sm text-gray-500">All community content has been reviewed</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tips">
              {tipsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pendingTips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingTips.map(tip => (
                    <Card key={tip.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <CardTitle className="text-base">{tip.title}</CardTitle>
                            <CardDescription>
                              Posted {formatTimeAgo(tip.datePosted)}
                            </CardDescription>
                          </div>
                          <span className="px-2 py-1 h-fit bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                            Pending
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">{tip.content}</p>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => rejectTip(tip.id)}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => approveTip(tip.id)}>
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <Check className="h-10 w-10 text-green-500 mb-4" />
                      <p className="text-gray-600 mb-2">No pending tips to review</p>
                      <p className="text-sm text-gray-500">All community tips have been moderated</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="deals">
              {dealsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pendingDeals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingDeals.map(deal => (
                    <Card key={deal.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <CardTitle className="text-base">{deal.store}</CardTitle>
                            <CardDescription>
                              {deal.expiryDate ? `Valid until ${new Date(deal.expiryDate).toLocaleDateString()}` : 'No expiry date'}
                            </CardDescription>
                          </div>
                          <span className="px-2 py-1 h-fit bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                            Pending
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-sm text-gray-600">{deal.description}</p>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full ml-2">
                            {deal.discount}
                          </span>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => rejectDeal(deal.id)}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => approveDeal(deal.id)}>
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <Check className="h-10 w-10 text-green-500 mb-4" />
                      <p className="text-gray-600 mb-2">No pending deals to review</p>
                      <p className="text-sm text-gray-500">All community deals have been moderated</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="approved">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Approved Tips ({approvedTips.length})</CardTitle>
                    <CardDescription>
                      Community tips that have been approved and published
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {approvedTips.length > 0 ? (
                      <div className="space-y-2">
                        {approvedTips.map(tip => (
                          <div key={tip.id} className="border rounded-md p-3 flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-sm">{tip.title}</h4>
                              <p className="text-xs text-gray-500">
                                Approved • {tip.likes} likes
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No approved tips yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Approved Deals ({approvedDeals.length})</CardTitle>
                    <CardDescription>
                      Community deals that have been approved and published
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {approvedDeals.length > 0 ? (
                      <div className="space-y-2">
                        {approvedDeals.map(deal => (
                          <div key={deal.id} className="border rounded-md p-3 flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-sm">{deal.store} - {deal.discount}</h4>
                              <p className="text-xs text-gray-500">
                                Approved • {deal.expiryDate ? `Expires: ${new Date(deal.expiryDate).toLocaleDateString()}` : 'No expiration'}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No approved deals yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
