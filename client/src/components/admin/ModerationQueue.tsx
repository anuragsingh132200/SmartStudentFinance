import React from "react";
import { CommunityTip, Deal } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Check, X, MessageSquare, TagIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ModerationQueueProps {
  tips: CommunityTip[];
  deals: Deal[];
  onApproveTip?: (id: number) => void;
  onRejectTip?: (id: number) => void;
  onApproveDeal?: (id: number) => void;
  onRejectDeal?: (id: number) => void;
}

export function ModerationQueue({
  tips,
  deals,
  onApproveTip,
  onRejectTip,
  onApproveDeal,
  onRejectDeal,
}: ModerationQueueProps) {
  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  const hasPendingContent = tips.length > 0 || deals.length > 0;

  if (!hasPendingContent) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200 text-center">
        <div className="flex flex-col items-center justify-center">
          <Check className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
          <p className="text-gray-500 mt-1">
            There are no pending items in the moderation queue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="tips" className="space-y-4">
      <TabsList>
        <TabsTrigger value="tips" className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          Tips ({tips.length})
        </TabsTrigger>
        <TabsTrigger value="deals" className="flex items-center">
          <TagIcon className="h-4 w-4 mr-2" />
          Deals ({deals.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tips" className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {tips.map((tip) => (
            <Card key={tip.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{tip.title}</CardTitle>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                    Pending
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Submitted {formatTimeAgo(tip.datePosted)}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{tip.content}</p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 pt-2">
                {onRejectTip && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => onRejectTip(tip.id)}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                )}
                {onApproveTip && (
                  <Button size="sm" onClick={() => onApproveTip(tip.id)}>
                    <Check className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="deals" className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {deals.map((deal) => (
            <Card key={deal.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{deal.store}</CardTitle>
                    <p className="text-xs text-gray-500">
                      {deal.expiryDate
                        ? `Valid until ${new Date(deal.expiryDate).toLocaleDateString()}`
                        : "No expiry date"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                      Pending
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {deal.discount}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{deal.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 pt-2">
                {onRejectDeal && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => onRejectDeal(deal.id)}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                )}
                {onApproveDeal && (
                  <Button size="sm" onClick={() => onApproveDeal(deal.id)}>
                    <Check className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
