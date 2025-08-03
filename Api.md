# API Documentation

## Overview

The Cron Task Management System provides a comprehensive REST API for managing scheduled tasks, monitoring execution, and accessing system statistics. All endpoints require API key authentication for security.

## Authentication

### API Key Authentication
All API requests must include the API key in the request header:

```http
X-API-Key: your_api_key_here
```

### Error Responses
Authentication failures return:
```json
{
  "error": "Unauthorized",
  "message": "Valid API key required"
}
```

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### 1. Dashboard Statistics

#### GET `/api/stats`
Get real-time dashboard statistics and metrics.

**Response:**
```json
{
  "activeTasks": 5,
  "pausedTasks": 2,
  "totalExecutions": 156,
  "failedExecutions": 3,
  "systemHealth": "healthy",
  "uptime": "2d 14h 32m"
}
```

**Use Cases:**
- Dashboard overview display
- System monitoring
- Health checks

---

### 2. Task Management

#### GET `/api/tasks`
Retrieve all cron tasks with their current status and metadata.

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `paused`, `error`)
- `limit` (optional): Limit number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": "uuid-here",
    "name": "Daily Backup",
    "description": "Backs up database daily at 2 AM",
    "command": "/scripts/backup.sh",
    "cronExpression": "0 2 * * *",
    "status": "active",
    "timeout": 300,
    "enableWebhook": false,
    "enableEmailNotification": true,
    "emailOnSuccess": false,
    "emailOnFailure": true,
    "logOutput": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z",
    "lastRun": "2025-01-15T02:00:00Z",
    "nextRun": "2025-01-16T02:00:00Z",
    "runCount": 45,
    "errorCount": 1
  }
]
```

#### POST `/api/tasks`
Create a new cron task.

**Request Body:**
```json
{
  "name": "Weekly Report",
  "description": "Generate weekly reports",
  "command": "python /scripts/weekly_report.py",
  "cronExpression": "0 9 * * 1",
  "timeout": 600,
  "enableWebhook": true,
  "enableEmailNotification": true,
  "emailOnSuccess": true,
  "emailOnFailure": true,
  "logOutput": true
}
```

**Response:** Returns the created task object with generated ID and timestamps.

**Validation Rules:**
- `name`: Required, max 255 characters
- `command`: Required, max 1000 characters
- `cronExpression`: Required, valid cron format
- `timeout`: Optional, 1-3600 seconds (default: 300)

#### GET `/api/tasks/:id`
Get details of a specific task by ID.

**Response:** Single task object (same format as GET `/api/tasks`)

#### PUT `/api/tasks/:id`
Update an existing task. All fields are optional.

**Request Body:** Same as POST, but all fields optional
**Response:** Updated task object

#### DELETE `/api/tasks/:id`
Delete a task and all associated logs.

**Response:**
```json
{
  "message": "Task deleted successfully",
  "deletedTaskId": "uuid-here"
}
```

---

### 3. Task Control

#### POST `/api/tasks/:id/start`
Start/activate a paused task.

**Response:**
```json
{
  "message": "Task started successfully",
  "taskId": "uuid-here",
  "status": "active",
  "nextRun": "2025-01-16T02:00:00Z"
}
```

#### POST `/api/tasks/:id/stop`
Stop/pause an active task.

**Response:**
```json
{
  "message": "Task stopped successfully",
  "taskId": "uuid-here",
  "status": "paused"
}
```

#### POST `/api/tasks/:id/run`
Execute a task immediately (manual trigger).

**Response:**
```json
{
  "message": "Task execution initiated",
  "taskId": "uuid-here",
  "executionId": "uuid-here",
  "startedAt": "2025-01-15T14:30:00Z"
}
```

---

### 4. Activity Logs

#### GET `/api/logs`
Retrieve activity logs and execution history.

**Query Parameters:**
- `taskId` (optional): Filter logs for specific task
- `type` (optional): Filter by log type
- `limit` (optional): Limit results (default: 50, max: 200)
- `offset` (optional): Pagination offset
- `startDate` (optional): Filter logs after date (ISO 8601)
- `endDate` (optional): Filter logs before date (ISO 8601)

**Response:**
```json
[
  {
    "id": "uuid-here",
    "taskId": "task-uuid",
    "type": "task_executed",
    "message": "Task 'Daily Backup' executed successfully",
    "details": {
      "duration": 45000,
      "exitCode": 0,
      "output": "Backup completed successfully",
      "command": "/scripts/backup.sh"
    },
    "createdAt": "2025-01-15T02:00:45Z"
  }
]
```

**Log Types:**
- `task_created`: New task created
- `task_updated`: Task configuration modified
- `task_deleted`: Task removed
- `task_started`: Task activated
- `task_stopped`: Task paused
- `task_executed`: Task ran successfully
- `task_failed`: Task execution failed
- `system_startup`: System started
- `system_shutdown`: System stopped

#### GET `/api/logs/:id`
Get details of a specific log entry.

**Response:** Single log object with full details

---

### 5. WebSocket Real-time Updates

#### Connection
```javascript
const ws = new WebSocket('ws://localhost:5000');
```

#### Message Types
The WebSocket sends real-time updates for:

**Task Execution Started:**
```json
{
  "type": "task_started",
  "taskId": "uuid-here",
  "taskName": "Daily Backup",
  "timestamp": "2025-01-15T02:00:00Z"
}
```

**Task Execution Completed:**
```json
{
  "type": "task_completed",
  "taskId": "uuid-here",
  "taskName": "Daily Backup",
  "success": true,
  "duration": 45000,
  "timestamp": "2025-01-15T02:00:45Z"
}
```

**Task Execution Failed:**
```json
{
  "type": "task_failed",
  "taskId": "uuid-here",
  "taskName": "Daily Backup",
  "error": "Command failed with exit code 1",
  "timestamp": "2025-01-15T02:00:30Z"
}
```

**Stats Update:**
```json
{
  "type": "stats_update",
  "stats": {
    "activeTasks": 5,
    "pausedTasks": 2,
    "totalExecutions": 157,
    "failedExecutions": 3
  },
  "timestamp": "2025-01-15T02:00:45Z"
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Error Type",
  "message": "Detailed error description",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-15T14:30:00Z"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid API key)
- `404`: Not Found
- `409`: Conflict (duplicate name, etc.)
- `422`: Unprocessable Entity (invalid data)
- `500`: Internal Server Error

### Validation Errors
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "cronExpression",
      "message": "Invalid cron expression format"
    },
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

---

## Rate Limiting

### Default Limits
- **General API**: 100 requests per 15 minutes per IP
- **Task Execution**: 10 manual executions per minute per task
- **WebSocket**: 1000 messages per minute per connection

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642680000
```

---

## Code Examples

### JavaScript/Node.js
```javascript
// Create a new task
const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    name: 'Data Sync',
    command: 'node sync-data.js',
    cronExpression: '*/30 * * * *'
  })
});

const task = await response.json();
console.log('Created task:', task.id);
```

### Python
```python
import requests

headers = {
    'X-API-Key': 'your-api-key',
    'Content-Type': 'application/json'
}

# Get all tasks
response = requests.get('http://localhost:5000/api/tasks', headers=headers)
tasks = response.json()

# Execute task manually
task_id = tasks[0]['id']
response = requests.post(
    f'http://localhost:5000/api/tasks/{task_id}/run',
    headers=headers
)
```

### cURL
```bash
# Get dashboard stats
curl -H "X-API-Key: your-api-key" \
     http://localhost:5000/api/stats

# Create new task
curl -X POST \
     -H "X-API-Key: your-api-key" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Task","command":"echo hello","cronExpression":"0 * * * *"}' \
     http://localhost:5000/api/tasks
```

---

## Best Practices

### 1. Error Handling
Always check response status codes and handle errors appropriately:

```javascript
const response = await fetch('/api/tasks', { headers });
if (!response.ok) {
  const error = await response.json();
  throw new Error(`API Error: ${error.message}`);
}
```

### 2. Pagination
Use pagination for large result sets:

```javascript
const getAllTasks = async () => {
  let allTasks = [];
  let offset = 0;
  const limit = 50;
  
  while (true) {
    const response = await fetch(`/api/tasks?limit=${limit}&offset=${offset}`, { headers });
    const tasks = await response.json();
    
    if (tasks.length === 0) break;
    
    allTasks = allTasks.concat(tasks);
    offset += limit;
  }
  
  return allTasks;
};
```

### 3. Real-time Updates
Combine REST API with WebSocket for optimal user experience:

```javascript
// Initial data load
const tasks = await fetchTasks();
displayTasks(tasks);

// Real-time updates
const ws = new WebSocket('ws://localhost:5000');
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  if (update.type === 'task_completed') {
    updateTaskStatus(update.taskId, 'completed');
  }
};
```

This API provides comprehensive functionality for managing cron tasks with real-time monitoring, detailed logging, and robust error handling.