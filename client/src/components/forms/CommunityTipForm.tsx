import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCommunityTipSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";

interface CommunityTipFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extend the community tip schema with client validation
const tipFormSchema = insertCommunityTipSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

type TipFormValues = z.infer<typeof tipFormSchema>;

export function CommunityTipForm({ open, onOpenChange }: CommunityTipFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<TipFormValues>({
    resolver: zodResolver(tipFormSchema),
    defaultValues: {
      userId: user?.id,
      title: "",
      content: "",
      datePosted: new Date().toISOString(),
      likes: 0,
      approved: false,
    },
  });

  const createTipMutation = useMutation({
    mutationFn: async (values: TipFormValues) => {
      const res = await apiRequest("POST", "/api/community-tips", {
        ...values,
        userId: user?.id,
        datePosted: new Date().toISOString(),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-tips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community-tips/user"] });
      toast({
        title: "Success",
        description: "Your tip has been submitted for approval",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit tip",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: TipFormValues) => {
    createTipMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share a Financial Tip</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g., Money-saving hack for textbooks"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your financial tip or advice here..."
                      className="resize-none h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 text-sm text-gray-500">
              <p className="flex items-center">
                <span className="material-icons mr-1 text-amber-500" style={{ fontSize: "16px" }}>info</span>
                Your tip will be reviewed by moderators before being published
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createTipMutation.isPending}>
                {createTipMutation.isPending ? "Submitting..." : "Submit Tip"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
