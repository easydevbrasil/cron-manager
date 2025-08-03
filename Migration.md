# Database Migration Guide

## Overview

This cron task management system uses **Drizzle ORM** with PostgreSQL for database operations. The migration system is designed to be simple, safe, and consistent across environments.

## Database Schema

The application uses three main tables:

### 1. Users Table (`users`)
- **Purpose**: Store user authentication information
- **Fields**:
  - `id`: UUID primary key (auto-generated)
  - `username`: Unique username for login
  - `password`: Hashed password for authentication

### 2. Cron Tasks Table (`cron_tasks`)
- **Purpose**: Store cron job definitions and metadata
- **Fields**:
  - `id`: UUID primary key (auto-generated)
  - `name`: Human-readable task name
  - `description`: Optional task description
  - `command`: Shell command to execute
  - `cron_expression`: Cron schedule expression (e.g., "0 2 * * *")
  - `status`: Current status (active, paused, error)
  - `timeout`: Execution timeout in seconds (default: 300)
  - `enable_webhook`: Enable webhook notifications
  - `enable_email_notification`: Enable email notifications
  - `email_on_success`: Send email on successful execution
  - `email_on_failure`: Send email on failed execution (default: true)
  - `log_output`: Store command output in logs (default: true)
  - `created_at`: Task creation timestamp
  - `updated_at`: Last modification timestamp
  - `last_run`: Last execution timestamp
  - `next_run`: Next scheduled execution
  - `run_count`: Total number of executions
  - `error_count`: Total number of failed executions

### 3. Activity Logs Table (`activity_logs`)
- **Purpose**: Store execution history and system events
- **Fields**:
  - `id`: UUID primary key (auto-generated)
  - `task_id`: Foreign key to cron_tasks (nullable for system events)
  - `type`: Event type (task_created, task_executed, task_failed, etc.)
  - `message`: Human-readable event description
  - `details`: JSON object with additional event data
  - `created_at`: Event timestamp

## Migration Commands

### Push Schema Changes
```bash
npm run db:push
```
This command:
- Compares your schema with the database
- Applies changes directly to the database
- **Warning**: Can cause data loss if columns are removed

### Generate Migration Files (Alternative)
```bash
npx drizzle-kit generate
```
- Creates migration SQL files in the `drizzle` folder
- Safer for production environments
- Allows review before applying changes

### Apply Generated Migrations
```bash
npx drizzle-kit migrate
```
- Applies generated migration files to the database
- Keeps track of applied migrations

## Environment Setup

### Required Environment Variables
```bash
DATABASE_URL=postgresql://user:password@host:port/database
PGDATABASE=your_database_name
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
```

### Drizzle Configuration
The `drizzle.config.ts` file configures:
- Database connection
- Schema location (`shared/schema.ts`)
- Migration output directory
- Database dialect (PostgreSQL)

## Migration Best Practices

### 1. Development Workflow
1. Modify schema in `shared/schema.ts`
2. Run `npm run db:push` to apply changes immediately
3. Test your changes thoroughly

### 2. Production Workflow
1. Modify schema in `shared/schema.ts`
2. Run `npx drizzle-kit generate` to create migration files
3. Review generated SQL for safety
4. Run `npx drizzle-kit migrate` to apply changes
5. Always backup production data first

### 3. Schema Modification Guidelines

#### Safe Changes (No Data Loss)
- Adding new columns with default values
- Adding new indexes
- Creating new tables
- Making columns nullable

#### Potentially Dangerous Changes
- Dropping columns or tables
- Changing column types
- Adding NOT NULL constraints to existing columns
- Renaming columns or tables

### 4. Rollback Strategy
- **Development**: Use `npm run db:push` to revert schema changes
- **Production**: Maintain backup before migrations and prepare rollback scripts

## Common Migration Scenarios

### Adding a New Column
```typescript
// In shared/schema.ts
export const cronTasks = pgTable("cron_tasks", {
  // ... existing columns
  newField: text("new_field").default("default_value"),
});
```

### Creating Indexes
```typescript
import { index } from "drizzle-orm/pg-core";

export const statusIndex = index("status_idx").on(cronTasks.status);
export const createdAtIndex = index("created_at_idx").on(cronTasks.createdAt);
```

### Adding Relations
```typescript
export const newRelation = relations(cronTasks, ({ many, one }) => ({
  // Define relationships here
}));
```

## Troubleshooting

### Connection Issues
- Verify DATABASE_URL is correctly formatted
- Check PostgreSQL server is running
- Confirm user has necessary permissions

### Migration Conflicts
- Use `npx drizzle-kit drop` to reset development database
- Check for naming conflicts in schema
- Ensure proper foreign key relationships

### Performance Considerations
- Add indexes for frequently queried columns
- Use JSONB for complex data structures
- Consider partitioning for large activity_logs table

## Monitoring and Maintenance

### Regular Tasks
- Monitor database size and performance
- Archive old activity logs periodically
- Update statistics and optimize queries
- Backup critical data regularly

### Health Checks
```sql
-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables WHERE schemaname = 'public';

-- Check recent activity
SELECT COUNT(*) as recent_logs FROM activity_logs WHERE created_at > NOW() - INTERVAL '24 hours';

-- Check active tasks
SELECT COUNT(*) as active_tasks FROM cron_tasks WHERE status = 'active';
```

This migration system ensures your cron task management database remains consistent, performant, and maintainable across all environments.