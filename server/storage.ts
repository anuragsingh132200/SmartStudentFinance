import { 
  User, InsertUser, Income, InsertIncome, Expense, InsertExpense,
  Budget, InsertBudget, SavingsGoal, InsertSavingsGoal,
  CommunityTip, InsertCommunityTip, Deal, InsertDeal
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Income operations
  createIncome(income: InsertIncome): Promise<Income>;
  getIncomesByUser(userId: number): Promise<Income[]>;
  deleteIncome(id: number): Promise<boolean>;
  updateIncome(id: number, income: Partial<InsertIncome>): Promise<Income | undefined>;
  
  // Expense operations
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpensesByUser(userId: number): Promise<Expense[]>;
  deleteExpense(id: number): Promise<boolean>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  
  // Budget operations
  createBudget(budget: InsertBudget): Promise<Budget>;
  getBudgetsByUser(userId: number): Promise<Budget[]>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;
  
  // Savings Goal operations
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  getSavingsGoalsByUser(userId: number): Promise<SavingsGoal[]>;
  updateSavingsGoal(id: number, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined>;
  deleteSavingsGoal(id: number): Promise<boolean>;
  
  // Community Tip operations
  createCommunityTip(tip: InsertCommunityTip): Promise<CommunityTip>;
  getAllCommunityTips(): Promise<CommunityTip[]>;
  getApprovedCommunityTips(): Promise<CommunityTip[]>;
  getCommunityTipsByUser(userId: number): Promise<CommunityTip[]>;
  approveCommunityTip(id: number): Promise<CommunityTip | undefined>;
  rejectCommunityTip(id: number): Promise<boolean>;
  likeCommunityTip(id: number): Promise<CommunityTip | undefined>;
  
  // Deal operations
  createDeal(deal: InsertDeal): Promise<Deal>;
  getAllDeals(): Promise<Deal[]>;
  getApprovedDeals(): Promise<Deal[]>;
  getDealsByUser(userId: number): Promise<Deal[]>;
  approveDeal(id: number): Promise<Deal | undefined>;
  rejectDeal(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;
  
  private users: Map<number, User>;
  private incomes: Map<number, Income>;
  private expenses: Map<number, Expense>;
  private budgets: Map<number, Budget>;
  private savingsGoals: Map<number, SavingsGoal>;
  private communityTips: Map<number, CommunityTip>;
  private deals: Map<number, Deal>;
  
  private nextUserId: number;
  private nextIncomeId: number;
  private nextExpenseId: number;
  private nextBudgetId: number;
  private nextSavingsGoalId: number;
  private nextCommunityTipId: number;
  private nextDealId: number;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24 hours
    });
    
    this.users = new Map();
    this.incomes = new Map();
    this.expenses = new Map();
    this.budgets = new Map();
    this.savingsGoals = new Map();
    this.communityTips = new Map();
    this.deals = new Map();
    
    this.nextUserId = 1;
    this.nextIncomeId = 1;
    this.nextExpenseId = 1;
    this.nextBudgetId = 1;
    this.nextSavingsGoalId = 1;
    this.nextCommunityTipId = 1;
    this.nextDealId = 1;
    
    // Create admin user
    this.createUser({
      username: 'admin',
      password: 'admin_pass', // This will be hashed in auth.ts
      email: 'admin@gmail.com',
      fullName: 'Administrator',
      isAdmin: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Income operations
  async createIncome(income: InsertIncome): Promise<Income> {
    const id = this.nextIncomeId++;
    const newIncome: Income = { ...income, id };
    this.incomes.set(id, newIncome);
    return newIncome;
  }
  
  async getIncomesByUser(userId: number): Promise<Income[]> {
    return Array.from(this.incomes.values()).filter(
      (income) => income.userId === userId,
    );
  }
  
  async deleteIncome(id: number): Promise<boolean> {
    return this.incomes.delete(id);
  }
  
  async updateIncome(id: number, incomeUpdate: Partial<InsertIncome>): Promise<Income | undefined> {
    const income = this.incomes.get(id);
    if (!income) return undefined;
    
    const updatedIncome = { ...income, ...incomeUpdate };
    this.incomes.set(id, updatedIncome);
    return updatedIncome;
  }

  // Expense operations
  async createExpense(expense: InsertExpense): Promise<Expense> {
    const id = this.nextExpenseId++;
    const newExpense: Expense = { ...expense, id };
    this.expenses.set(id, newExpense);
    return newExpense;
  }
  
  async getExpensesByUser(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.userId === userId,
    );
  }
  
  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }
  
  async updateExpense(id: number, expenseUpdate: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    
    const updatedExpense = { ...expense, ...expenseUpdate };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  // Budget operations
  async createBudget(budget: InsertBudget): Promise<Budget> {
    const id = this.nextBudgetId++;
    const newBudget: Budget = { ...budget, id };
    this.budgets.set(id, newBudget);
    return newBudget;
  }
  
  async getBudgetsByUser(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(
      (budget) => budget.userId === userId,
    );
  }
  
  async updateBudget(id: number, budgetUpdate: Partial<InsertBudget>): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    if (!budget) return undefined;
    
    const updatedBudget = { ...budget, ...budgetUpdate };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }
  
  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }

  // Savings Goal operations
  async createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = this.nextSavingsGoalId++;
    const newGoal: SavingsGoal = { ...goal, id };
    this.savingsGoals.set(id, newGoal);
    return newGoal;
  }
  
  async getSavingsGoalsByUser(userId: number): Promise<SavingsGoal[]> {
    return Array.from(this.savingsGoals.values()).filter(
      (goal) => goal.userId === userId,
    );
  }
  
  async updateSavingsGoal(id: number, goalUpdate: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined> {
    const goal = this.savingsGoals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...goalUpdate };
    this.savingsGoals.set(id, updatedGoal);
    return updatedGoal;
  }
  
  async deleteSavingsGoal(id: number): Promise<boolean> {
    return this.savingsGoals.delete(id);
  }

  // Community Tip operations
  async createCommunityTip(tip: InsertCommunityTip): Promise<CommunityTip> {
    const id = this.nextCommunityTipId++;
    const newTip: CommunityTip = { ...tip, id };
    this.communityTips.set(id, newTip);
    return newTip;
  }
  
  async getAllCommunityTips(): Promise<CommunityTip[]> {
    return Array.from(this.communityTips.values());
  }
  
  async getApprovedCommunityTips(): Promise<CommunityTip[]> {
    return Array.from(this.communityTips.values()).filter(
      (tip) => tip.approved,
    );
  }
  
  async getCommunityTipsByUser(userId: number): Promise<CommunityTip[]> {
    return Array.from(this.communityTips.values()).filter(
      (tip) => tip.userId === userId,
    );
  }
  
  async approveCommunityTip(id: number): Promise<CommunityTip | undefined> {
    const tip = this.communityTips.get(id);
    if (!tip) return undefined;
    
    const updatedTip = { ...tip, approved: true };
    this.communityTips.set(id, updatedTip);
    return updatedTip;
  }
  
  async rejectCommunityTip(id: number): Promise<boolean> {
    return this.communityTips.delete(id);
  }
  
  async likeCommunityTip(id: number): Promise<CommunityTip | undefined> {
    const tip = this.communityTips.get(id);
    if (!tip) return undefined;
    
    const updatedTip = { ...tip, likes: tip.likes + 1 };
    this.communityTips.set(id, updatedTip);
    return updatedTip;
  }

  // Deal operations
  async createDeal(deal: InsertDeal): Promise<Deal> {
    const id = this.nextDealId++;
    const newDeal: Deal = { ...deal, id };
    this.deals.set(id, newDeal);
    return newDeal;
  }
  
  async getAllDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values());
  }
  
  async getApprovedDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(
      (deal) => deal.approved,
    );
  }
  
  async getDealsByUser(userId: number): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(
      (deal) => deal.userId === userId,
    );
  }
  
  async approveDeal(id: number): Promise<Deal | undefined> {
    const deal = this.deals.get(id);
    if (!deal) return undefined;
    
    const updatedDeal = { ...deal, approved: true };
    this.deals.set(id, updatedDeal);
    return updatedDeal;
  }
  
  async rejectDeal(id: number): Promise<boolean> {
    return this.deals.delete(id);
  }
}

export const storage = new MemStorage();
