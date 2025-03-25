import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIncomeSchema } from "@shared/schema";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

interface AddIncomeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extend the income schema with client validation
const incomeFormSchema = insertIncomeSchema.extend({
  amount: z.coerce.number().min(0.01, "Amount must be greater than zero"),
  date: z.string(),
  hourlyWage: z.coerce.number().min(0).optional(),
  weeklyHours: z.coerce.number().min(0).optional(),
  calculateFromHours: z.boolean().default(false),
});

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

export function AddIncomeForm({ open, onOpenChange }: AddIncomeFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const incomeSources = [
    "Job/Employment",
    "Scholarship",
    "Family Support",
    "Grants",
    "Freelance Work",
    "Other"
  ];

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      userId: user?.id,
      source: "Job/Employment",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
      frequency: "Monthly",
      notes: "",
      hourlyWage: 0,
      weeklyHours: 0,
      calculateFromHours: false,
    },
  });

  const calculateFromHours = form.watch("calculateFromHours");
  const hourlyWage = form.watch("hourlyWage") || 0;
  const weeklyHours = form.watch("weeklyHours") || 0;
  
  // Calculate monthly income from hourly wage and weekly hours
  const calculateMonthlyIncome = (hourlyWage: number, weeklyHours: number) => {
    return hourlyWage * weeklyHours * 4.33; // 4.33 weeks in a month on average
  };

  // Update amount when hours or wage changes if calculateFromHours is true
  if (calculateFromHours) {
    const calculatedMonthly = calculateMonthlyIncome(hourlyWage, weeklyHours);
    if (calculatedMonthly !== form.getValues("amount")) {
      form.setValue("amount", calculatedMonthly);
    }
  }

  const createIncomeMutation = useMutation({
    mutationFn: async (values: IncomeFormValues) => {
      // Omit the calculation fields before sending
      const { hourlyWage, weeklyHours, calculateFromHours, ...incomeData } = values;
      
      const res = await apiRequest("POST", "/api/incomes", {
        ...incomeData,
        userId: user?.id,
        date: new Date(incomeData.date).toISOString(),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incomes"] });
      toast({
        title: "Success",
        description: "Income added successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add income",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: IncomeFormValues) => {
    createIncomeMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Income</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Income Source</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select income source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {incomeSources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="calculateFromHours"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal cursor-pointer">
                    Calculate from hourly wage and weekly hours
                  </FormLabel>
                </FormItem>
              )}
            />

            {calculateFromHours ? (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hourlyWage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Wage ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weeklyHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weekly Hours</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Recurring Income?</FormLabel>
                    <div className="flex items-center h-10">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </FormControl>
                      <span className="ml-2 text-sm">Yes, this is recurring</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch("isRecurring") && (
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional notes about this income" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createIncomeMutation.isPending}>
                {createIncomeMutation.isPending ? "Adding..." : "Add Income"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
