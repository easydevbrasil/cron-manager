import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const cronTasks = pgTable("cron_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  command: text("command").notNull(),
  cronExpression: text("cron_expression").notNull(),
  status: text("status").notNull().default("paused"), // active, paused, error
  timeout: integer("timeout").default(300),
  enableWebhook: boolean("enable_webhook").default(false),
  enableEmailNotification: boolean("enable_email_notification").default(false),
  emailOnSuccess: boolean("email_on_success").default(false),
  emailOnFailure: boolean("email_on_failure").default(true),
  logOutput: boolean("log_output").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  runCount: integer("run_count").default(0),
  errorCount: integer("error_count").default(0),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => cronTasks.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // task_created, task_updated, task_deleted, task_started, task_stopped, task_executed, task_failed
  message: text("message").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const cronTasksRelations = relations(cronTasks, ({ many }) => ({
  logs: many(activityLogs),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  task: one(cronTasks, {
    fields: [activityLogs.taskId],
    references: [cronTasks.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCronTaskSchema = createInsertSchema(cronTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastRun: true,
  nextRun: true,
  runCount: true,
  errorCount: true,
});

export const updateCronTaskSchema = insertCronTaskSchema.partial();

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CronTask = typeof cronTasks.$inferSelect;
export type InsertCronTask = z.infer<typeof insertCronTaskSchema>;
export type UpdateCronTask = z.infer<typeof updateCronTaskSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
