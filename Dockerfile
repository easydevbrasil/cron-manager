# Use Node.js 20 LTS as base image
FROM node:20-bullseye

# Install system dependencies including requested packages
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    ffmpeg \
    pwgen \
    dovecot-core \
    python3 \
    python3-pip \
    postgresql-client \
    cron \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Create necessary directories
RUN mkdir -p /app/logs \
    && mkdir -p /var/log/supervisor \
    && mkdir -p /etc/supervisor/conf.d

# Create supervisor configuration for running multiple services
RUN echo '[supervisord]' > /etc/supervisor/conf.d/supervisord.conf && \
    echo 'nodaemon=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'user=root' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'logfile=/var/log/supervisor/supervisord.log' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'pidfile=/var/run/supervisord.pid' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '[program:cron-app]' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'command=npm run dev' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'directory=/app' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile=/var/log/supervisor/cron-app.err.log' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile=/var/log/supervisor/cron-app.out.log' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '[program:cron]' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'command=/usr/sbin/cron -f' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisor/conf.d/supervisord.conf

# Create a non-root user for security
RUN groupadd -r cronuser && useradd -r -g cronuser cronuser

# Set proper permissions
RUN chown -R cronuser:cronuser /app && \
    chmod +x /app

# Build the application
RUN npm run build 2>/dev/null || echo "Build command not found, skipping..."

# Expose the application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/stats || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0
ENV SESSION_SECRET="AqR0qvJ7iJBf3ups3LsIuqCJj6VgGQzo"
ENV APP_NAME="Cron Task Management System"
ENV APP_URL=${APP_URL:-http://localhost:8080}

# Start supervisor to manage multiple processes
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]