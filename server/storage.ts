import { users, cronTasks, activityLogs, type User, type InsertUser, type CronTask, type InsertCronTask, type UpdateCronTask, type ActivityLog, type InsertActivityLog } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Cron Tasks
  getCronTasks(): Promise<CronTask[]>;
  getCronTask(id: string): Promise<CronTask | undefined>;
  createCronTask(task: InsertCronTask): Promise<CronTask>;
  updateCronTask(id: string, task: UpdateCronTask): Promise<CronTask | undefined>;
  deleteCronTask(id: string): Promise<boolean>;
  updateTaskStatus(id: string, status: string): Promise<boolean>;
  updateTaskRun(id: string, lastRun: Date, nextRun?: Date): Promise<boolean>;
  incrementRunCount(id: string): Promise<boolean>;
  incrementErrorCount(id: string): Promise<boolean>;
  
  // Activity Logs
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Statistics
  getTaskStats(): Promise<{
    activeTasks: number;
    pausedTasks: number;
    todayExecutions: number;
    failures: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCronTasks(): Promise<CronTask[]> {
    return await db.select().from(cronTasks).orderBy(desc(cronTasks.createdAt));
  }

  async getCronTask(id: string): Promise<CronTask | undefined> {
    const [task] = await db.select().from(cronTasks).where(eq(cronTasks.id, id));
    return task || undefined;
  }

  async createCronTask(task: InsertCronTask): Promise<CronTask> {
    const [newTask] = await db
      .insert(cronTasks)
      .values({
        ...task,
        updatedAt: new Date(),
      })
      .returning();
    return newTask;
  }

  async updateCronTask(id: string, task: UpdateCronTask): Promise<CronTask | undefined> {
    const [updatedTask] = await db
      .update(cronTasks)
      .set({
        ...task,
        updatedAt: new Date(),
      })
      .where(eq(cronTasks.id, id))
      .returning();
    return updatedTask || undefined;
  }

  async deleteCronTask(id: string): Promise<boolean> {
    const result = await db.delete(cronTasks).where(eq(cronTasks.id, id));
    return (result.rowCount || 0) > 0;
  }

  async updateTaskStatus(id: string, status: string): Promise<boolean> {
    const result = await db
      .update(cronTasks)
      .set({ status, updatedAt: new Date() })
      .where(eq(cronTasks.id, id));
    return (result.rowCount || 0) > 0;
  }

  async updateTaskRun(id: string, lastRun: Date, nextRun?: Date): Promise<boolean> {
    const result = await db
      .update(cronTasks)
      .set({ 
        lastRun, 
        nextRun,
        updatedAt: new Date()
      })
      .where(eq(cronTasks.id, id));
    return (result.rowCount || 0) > 0;
  }

  async incrementRunCount(id: string): Promise<boolean> {
    const result = await db
      .update(cronTasks)
      .set({ 
        runCount: sql`${cronTasks.runCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(cronTasks.id, id));
    return (result.rowCount || 0) > 0;
  }

  async incrementErrorCount(id: string): Promise<boolean> {
    const result = await db
      .update(cronTasks)
      .set({ 
        errorCount: sql`${cronTasks.errorCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(cronTasks.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db
      .insert(activityLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getTaskStats(): Promise<{
    activeTasks: number;
    pausedTasks: number;
    todayExecutions: number;
    failures: number;
  }> {
    const [activeCount] = await db
      .select({ count: count() })
      .from(cronTasks)
      .where(eq(cronTasks.status, "active"));

    const [pausedCount] = await db
      .select({ count: count() })
      .from(cronTasks)
      .where(eq(cronTasks.status, "paused"));

    const [errorCount] = await db
      .select({ count: count() })
      .from(cronTasks)
      .where(eq(cronTasks.status, "error"));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [todayExecutions] = await db
      .select({ count: count() })
      .from(activityLogs)
      .where(
        and(
          eq(activityLogs.type, "task_executed"),
          sql`${activityLogs.createdAt} >= ${today}`
        )
      );

    return {
      activeTasks: activeCount.count,
      pausedTasks: pausedCount.count,
      todayExecutions: todayExecutions.count,
      failures: errorCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
