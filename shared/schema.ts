import { pgTable, text, serial, integer, boolean, json, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  isAdmin: true,
});

// Income schema
export const incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  source: text("source").notNull(),
  amount: real("amount").notNull(),
  date: timestamp("date").notNull(),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  frequency: text("frequency"),
  notes: text("notes"),
});

export const insertIncomeSchema = createInsertSchema(incomes).pick({
  userId: true,
  source: true,
  amount: true,
  date: true,
  isRecurring: true,
  frequency: true,
  notes: true,
});

// Expense schema
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  amount: real("amount").notNull(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  isRecurring: boolean("is_recurring").default(false).notNull(),
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  userId: true,
  category: true,
  subcategory: true,
  amount: true,
  date: true,
  description: true,
  isRecurring: true,
});

// Budget schema
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  period: text("period").notNull(), // monthly, weekly, etc.
  startDate: timestamp("start_date").notNull(),
  alertThreshold: integer("alert_threshold").default(80).notNull(), // percentage at which to alert
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  userId: true,
  category: true,
  amount: true,
  period: true,
  startDate: true,
  alertThreshold: true,
});

// Savings Goal schema
export const savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  targetAmount: real("target_amount").notNull(),
  currentAmount: real("current_amount").default(0).notNull(),
  deadline: timestamp("deadline"),
  notes: text("notes"),
});

export const insertSavingsGoalSchema = createInsertSchema(savingsGoals).pick({
  userId: true,
  name: true,
  targetAmount: true,
  currentAmount: true,
  deadline: true,
  notes: true,
});

// Community Tips schema
export const communityTips = pgTable("community_tips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  datePosted: timestamp("date_posted").notNull(),
  likes: integer("likes").default(0).notNull(),
  approved: boolean("approved").default(false).notNull(),
});

export const insertCommunityTipSchema = createInsertSchema(communityTips).pick({
  userId: true,
  title: true,
  content: true,
  datePosted: true,
  likes: true,
  approved: true,
});

// Deals schema
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  store: text("store").notNull(),
  description: text("description").notNull(),
  discount: text("discount").notNull(),
  expiryDate: timestamp("expiry_date"),
  approved: boolean("approved").default(false).notNull(),
});

export const insertDealSchema = createInsertSchema(deals).pick({
  userId: true,
  store: true,
  description: true,
  discount: true,
  expiryDate: true,
  approved: true,
});

// Export all the types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Income = typeof incomes.$inferSelect;
export type InsertIncome = z.infer<typeof insertIncomeSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;

export type CommunityTip = typeof communityTips.$inferSelect;
export type InsertCommunityTip = z.infer<typeof insertCommunityTipSchema>;

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
