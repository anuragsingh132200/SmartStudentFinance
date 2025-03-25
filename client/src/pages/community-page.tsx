import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { CommunityTip } from "@shared/schema";
import { CommunityTipForm } from "@/components/forms/CommunityTipForm";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, MessageSquare, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CommunityPage() {
  const { user } = useAuth();
  const [tipFormOpen, setTipFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTipId, setSelectedTipId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: tips = [], isLoading } = useQuery<CommunityTip[]>({
    queryKey: ["/api/community-tips"],
  });

  const { data: userTips = [], isLoading: userTipsLoading } = useQuery<CommunityTip[]>({
    queryKey: ["/api/community-tips/user"],
    enabled: !!user,
  });

  const likeTip = async (tipId: number) => {
    try {
      await apiRequest("POST", `/api/community-tips/${tipId}/like`, {});
      queryClient.invalidateQueries({ queryKey: ["/api/community-tips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community-tips/user"] });
      toast({
        title: "Success",
        description: "You liked this tip"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like tip",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (tipId: number) => {
    setSelectedTipId(tipId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTipId) return;
    
    try {
      await apiRequest("DELETE", `/api/community-tips/${selectedTipId}`, undefined);
      queryClient.invalidateQueries({ queryKey: ["/api/community-tips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community-tips/user"] });
      toast({
        title: "Tip deleted",
        description: "The tip has been removed successfully"
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tip",
        variant: "destructive"
      });
    }
  };

  // Filter tips based on search query
  const filteredTips = tips.filter(tip => 
    tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tip.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort tips by date (newest first)
  const sortedTips = [...filteredTips].sort((a, b) => 
    new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
  );

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
        <Header title="Community Tips" subtitle="Share and discover financial tips from fellow students" />
        
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="relative w-full md:max-w-xs">
              <Input
                type="text"
                placeholder="Search tips..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="material-icons absolute right-3 top-2 text-gray-400">search</span>
            </div>
            
            <Button 
              className="mt-4 md:mt-0 flex items-center"
              onClick={() => setTipFormOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Share a Tip
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Tips</TabsTrigger>
              <TabsTrigger value="my-tips">My Tips</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sortedTips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedTips.map(tip => (
                    <Card key={tip.id} className="overflow-hidden">
                      <CardHeader className="pb-3 pt-5 px-5">
                        <div className="flex items-start space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                            {tip.title.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-base">{tip.title}</h3>
                            <p className="text-xs text-gray-500">
                              {user?.id === tip.userId ? "You" : "Community Member"} • {formatTimeAgo(tip.datePosted)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-5 py-3">
                        <p className="text-sm text-gray-700">{tip.content}</p>
                      </CardContent>
                      <CardFooter className="px-5 py-3 flex justify-between border-t border-gray-100">
                        <button 
                          className="flex items-center text-gray-500 text-xs hover:text-primary"
                          onClick={() => likeTip(tip.id)}
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          <span>{tip.likes} Likes</span>
                        </button>
                        <button className="flex items-center text-gray-500 text-xs hover:text-primary">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>Comments</span>
                        </button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-white rounded-xl shadow-sm">
                  <span className="material-icons text-gray-400 text-3xl mb-2">forum</span>
                  <p className="text-gray-500">No community tips found</p>
                  <p className="text-xs text-gray-400 mt-1">Be the first to share a financial tip!</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="my-tips">
              {userTipsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userTips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userTips
                    .sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime())
                    .map(tip => (
                      <Card key={tip.id} className={`overflow-hidden ${!tip.approved ? 'border-amber-300' : ''}`}>
                        <CardHeader className="pb-3 pt-5 px-5">
                          <div className="flex items-start space-x-3">
                            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                              {tip.title.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold text-base">{tip.title}</h3>
                                <div className="ml-2">
                                  {!tip.approved && (
                                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                                      Pending
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">
                                Posted {formatTimeAgo(tip.datePosted)}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="px-5 py-3">
                          <p className="text-sm text-gray-700">{tip.content}</p>
                        </CardContent>
                        <CardFooter className="px-5 py-3 flex justify-between border-t border-gray-100">
                          <div className="flex items-center text-gray-500 text-xs">
                            <Heart className="h-4 w-4 mr-1" />
                            <span>{tip.likes} Likes</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(tip.id)}
                          >
                            <span className="material-icons mr-1" style={{ fontSize: "14px" }}>delete</span>
                            Delete
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-white rounded-xl shadow-sm">
                  <span className="material-icons text-gray-400 text-3xl mb-2">forum</span>
                  <p className="text-gray-500">You haven't shared any tips yet</p>
                  <p className="text-xs text-gray-400 mt-1">Click "Share a Tip" to contribute to the community</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <span className="material-icons text-primary mr-2">tips_and_updates</span>
              Guidelines for Sharing Tips
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li className="text-sm text-gray-700">Share practical financial advice relevant to students</li>
              <li className="text-sm text-gray-700">Be specific and provide context where possible</li>
              <li className="text-sm text-gray-700">Respect others' privacy and don't share personal information</li>
              <li className="text-sm text-gray-700">Tips will be reviewed before appearing to all users</li>
              <li className="text-sm text-gray-700">Be supportive and constructive in your comments</li>
            </ul>
          </div>
        </div>
      </main>
      
      <MobileNavigation />
      
      {/* Tip Form Dialog */}
      <CommunityTipForm open={tipFormOpen} onOpenChange={setTipFormOpen} />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this tip? This action cannot be undone.
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
