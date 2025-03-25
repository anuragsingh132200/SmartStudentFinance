import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertIncomeSchema, insertExpenseSchema, insertBudgetSchema, insertSavingsGoalSchema, insertCommunityTipSchema, insertDealSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Simple middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ message: "Not authenticated" });
  };

  // Admin check middleware
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
    return res.status(403).json({ message: "Not authorized" });
  };

  // Income routes
  app.post("/api/incomes", isAuthenticated, async (req, res) => {
    try {
      const income = insertIncomeSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const newIncome = await storage.createIncome(income);
      res.status(201).json(newIncome);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid income data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create income" });
    }
  });

  app.get("/api/incomes", isAuthenticated, async (req, res) => {
    const incomes = await storage.getIncomesByUser(req.user.id);
    res.json(incomes);
  });

  app.put("/api/incomes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const income = await storage.updateIncome(id, req.body);
      if (!income) {
        return res.status(404).json({ message: "Income not found" });
      }
      res.json(income);
    } catch (error) {
      res.status(500).json({ message: "Failed to update income" });
    }
  });

  app.delete("/api/incomes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteIncome(id);
      if (!deleted) {
        return res.status(404).json({ message: "Income not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete income" });
    }
  });

  // Expense routes
  app.post("/api/expenses", isAuthenticated, async (req, res) => {
    try {
      // Parse the date string to a Date object before validation
      const data = {
        ...req.body,
        userId: req.user.id,
        date: req.body.date ? new Date(req.body.date) : undefined
      };
      
      const expense = insertExpenseSchema.parse(data);
      const newExpense = await storage.createExpense(expense);
      res.status(201).json(newExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.get("/api/expenses", isAuthenticated, async (req, res) => {
    const expenses = await storage.getExpensesByUser(req.user.id);
    res.json(expenses);
  });

  app.put("/api/expenses/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.updateExpense(id, req.body);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Budget routes
  app.post("/api/budgets", isAuthenticated, async (req, res) => {
    try {
      const budget = insertBudgetSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const newBudget = await storage.createBudget(budget);
      res.status(201).json(newBudget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid budget data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  app.get("/api/budgets", isAuthenticated, async (req, res) => {
    const budgets = await storage.getBudgetsByUser(req.user.id);
    res.json(budgets);
  });

  app.put("/api/budgets/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const budget = await storage.updateBudget(id, req.body);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      res.json(budget);
    } catch (error) {
      res.status(500).json({ message: "Failed to update budget" });
    }
  });

  app.delete("/api/budgets/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBudget(id);
      if (!deleted) {
        return res.status(404).json({ message: "Budget not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });

  // Savings Goal routes
  app.post("/api/savings-goals", isAuthenticated, async (req, res) => {
    try {
      const goal = insertSavingsGoalSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const newGoal = await storage.createSavingsGoal(goal);
      res.status(201).json(newGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid savings goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create savings goal" });
    }
  });

  app.get("/api/savings-goals", isAuthenticated, async (req, res) => {
    const goals = await storage.getSavingsGoalsByUser(req.user.id);
    res.json(goals);
  });

  app.put("/api/savings-goals/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goal = await storage.updateSavingsGoal(id, req.body);
      if (!goal) {
        return res.status(404).json({ message: "Savings goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update savings goal" });
    }
  });

  app.delete("/api/savings-goals/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSavingsGoal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Savings goal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete savings goal" });
    }
  });

  // Community Tips routes
  app.post("/api/community-tips", isAuthenticated, async (req, res) => {
    try {
      const tip = insertCommunityTipSchema.parse({
        ...req.body,
        userId: req.user.id,
        datePosted: new Date(),
        approved: req.user.isAdmin ? true : false,
      });
      const newTip = await storage.createCommunityTip(tip);
      res.status(201).json(newTip);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid community tip data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create community tip" });
    }
  });

  app.get("/api/community-tips", async (req, res) => {
    const tips = await storage.getApprovedCommunityTips();
    res.json(tips);
  });

  app.get("/api/community-tips/all", isAdmin, async (req, res) => {
    const tips = await storage.getAllCommunityTips();
    res.json(tips);
  });

  app.get("/api/community-tips/user", isAuthenticated, async (req, res) => {
    const tips = await storage.getCommunityTipsByUser(req.user.id);
    res.json(tips);
  });

  app.post("/api/community-tips/:id/approve", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tip = await storage.approveCommunityTip(id);
      if (!tip) {
        return res.status(404).json({ message: "Community tip not found" });
      }
      res.json(tip);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve community tip" });
    }
  });

  app.delete("/api/community-tips/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.rejectCommunityTip(id);
      if (!deleted) {
        return res.status(404).json({ message: "Community tip not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete community tip" });
    }
  });

  app.post("/api/community-tips/:id/like", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tip = await storage.likeCommunityTip(id);
      if (!tip) {
        return res.status(404).json({ message: "Community tip not found" });
      }
      res.json(tip);
    } catch (error) {
      res.status(500).json({ message: "Failed to like community tip" });
    }
  });

  // Deal routes
  app.post("/api/deals", isAuthenticated, async (req, res) => {
    try {
      const deal = insertDealSchema.parse({
        ...req.body,
        userId: req.user.id,
        approved: req.user.isAdmin ? true : false,
      });
      const newDeal = await storage.createDeal(deal);
      res.status(201).json(newDeal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create deal" });
    }
  });

  app.get("/api/deals", async (req, res) => {
    const deals = await storage.getApprovedDeals();
    res.json(deals);
  });

  app.get("/api/deals/all", isAdmin, async (req, res) => {
    const deals = await storage.getAllDeals();
    res.json(deals);
  });

  app.get("/api/deals/user", isAuthenticated, async (req, res) => {
    const deals = await storage.getDealsByUser(req.user.id);
    res.json(deals);
  });

  app.post("/api/deals/:id/approve", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deal = await storage.approveDeal(id);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve deal" });
    }
  });

  app.delete("/api/deals/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.rejectDeal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete deal" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    // Don't send password hashes
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    res.json(safeUsers);
  });

  // Initialize the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
