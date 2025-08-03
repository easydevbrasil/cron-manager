#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database connection..."
until pg_isready -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
npm run db:push || echo "Migration failed or no changes needed"

# Generate API key if not provided
if [ -z "$API_KEY" ]; then
    export API_KEY=$(pwgen -s 32 1)
    echo "Generated API_KEY: $API_KEY"
fi

# Generate session secret if not provided
if [ -z "$SESSION_SECRET" ]; then
    export SESSION_SECRET=$(pwgen -s 64 1)
    echo "Generated SESSION_SECRET: $SESSION_SECRET"
fi

# Create logs directory
mkdir -p /app/logs

# Set proper permissions
chown -R cronuser:cronuser /app/logs

# Create crontab for system tasks (if needed)
echo "# Cron Task Manager System Tasks" > /tmp/crontab
echo "# Add your system-level cron jobs here" >> /tmp/crontab
crontab /tmp/crontab

# Start the application
echo "Starting Cron Task Manager..."
exec "$@"