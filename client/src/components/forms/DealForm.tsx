import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDealSchema } from "@shared/schema";
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

interface DealFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extend the deal schema with client validation
const dealFormSchema = insertDealSchema.extend({
  store: z.string().min(1, "Store name is required"),
  description: z.string().min(1, "Description is required"),
  discount: z.string().min(1, "Discount information is required"),
  expiryDate: z.string().optional(),
});

type DealFormValues = z.infer<typeof dealFormSchema>;

export function DealForm({ open, onOpenChange }: DealFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      userId: user?.id,
      store: "",
      description: "",
      discount: "",
      approved: false,
    },
  });

  const createDealMutation = useMutation({
    mutationFn: async (values: DealFormValues) => {
      const res = await apiRequest("POST", "/api/deals", {
        ...values,
        userId: user?.id,
        expiryDate: values.expiryDate ? new Date(values.expiryDate).toISOString() : null,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/deals/user"] });
      toast({
        title: "Success",
        description: "Deal submitted successfully and pending approval",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit deal",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: DealFormValues) => {
    createDealMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit a New Deal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="store"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store/Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Campus Bookstore" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Type</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., 20% OFF, BOGO, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the deal details..."
                      className="resize-none h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 text-sm text-gray-500">
              <p className="flex items-center">
                <span className="material-icons mr-1 text-amber-500" style={{ fontSize: "16px" }}>info</span>
                Your deal will be reviewed by moderators before being published
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
              <Button type="submit" disabled={createDealMutation.isPending}>
                {createDealMutation.isPending ? "Submitting..." : "Submit Deal"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
