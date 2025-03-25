import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CommunityTip } from "@shared/schema";
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
import { formatDistanceToNow } from "date-fns";

export function CommunityTips() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipTitle, setTipTitle] = useState("");
  const [tipContent, setTipContent] = useState("");

  const { data: tips = [] } = useQuery<CommunityTip[]>({
    queryKey: ["/api/community-tips"],
  });

  const likeTipMutation = useMutation({
    mutationFn: async (tipId: number) => {
      const res = await apiRequest("POST", `/api/community-tips/${tipId}/like`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-tips"] });
      toast({
        title: "Success",
        description: "You liked this tip",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to like tip",
        variant: "destructive",
      });
    },
  });

  const createTipMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const res = await apiRequest("POST", "/api/community-tips", {
        ...data,
        likes: 0,
        datePosted: new Date().toISOString(),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-tips"] });
      setDialogOpen(false);
      setTipTitle("");
      setTipContent("");
      toast({
        title: "Success",
        description: "Your tip has been submitted for approval",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tip",
        variant: "destructive",
      });
    },
  });

  const handleLikeTip = (tipId: number) => {
    if (!user) return;
    likeTipMutation.mutate(tipId);
  };

  const handleSubmitTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    createTipMutation.mutate({ title: tipTitle, content: tipContent });
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  // Show most recent 2 tips
  const recentTips = tips.sort((a, b) => 
    new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
  ).slice(0, 2);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Community Tips</h2>
        <Link href="/community">
          <a className="text-primary text-sm hover:underline">View All</a>
        </Link>
      </div>
      
      <div className="space-y-4">
        {recentTips.length > 0 ? (
          recentTips.map((tip) => (
            <div key={tip.id} className="p-4 rounded-lg bg-blue-50">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                  {tip.title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{tip.title}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Posted by {user?.id === tip.userId ? "You" : "Community Member"} • {formatTimeAgo(tip.datePosted)}
                  </p>
                  <p className="text-sm text-gray-700">{tip.content}</p>
                  <div className="mt-3 flex items-center space-x-4">
                    <button
                      className="flex items-center text-gray-500 text-xs hover:text-primary"
                      onClick={() => handleLikeTip(tip.id)}
                    >
                      <span className="material-icons mr-1" style={{ fontSize: "14px" }}>thumb_up</span>
                      <span>{tip.likes} Likes</span>
                    </button>
                    <button className="flex items-center text-gray-500 text-xs hover:text-primary">
                      <span className="material-icons mr-1" style={{ fontSize: "14px" }}>comment</span>
                      <span>Comments</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <span className="material-icons text-gray-400 text-3xl mb-2">forum</span>
            <p className="text-gray-500">No community tips yet</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to share a financial tip</p>
          </div>
        )}
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="mt-4 w-full py-2 bg-white border border-primary text-primary text-sm font-medium rounded-lg hover:bg-blue-50 flex items-center justify-center"
          >
            <span className="material-icons mr-1" style={{ fontSize: "18px" }}>add_circle</span>
            <span>Share a Tip</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share a Financial Tip</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitTip} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                type="text"
                value={tipTitle}
                onChange={(e) => setTipTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                placeholder="E.g., Money-saving hack for textbooks"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <textarea
                value={tipContent}
                onChange={(e) => setTipContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm min-h-[100px]"
                placeholder="Share your financial tip or advice here..."
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
              <Button type="submit" disabled={createTipMutation.isPending}>
                {createTipMutation.isPending ? "Submitting..." : "Submit Tip"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
