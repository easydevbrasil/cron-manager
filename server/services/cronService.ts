import * as cron from "node-cron";
import { exec } from "child_process";
import { storage } from "../storage";
import { CronTask } from "@shared/schema";
import { broadcastLog } from "./websocketService";
import { emailService } from "./emailService";

class CronService {
  private tasks: Map<string, cron.ScheduledTask> = new Map();
  private webhookUrl: string | undefined;

  constructor() {
    this.webhookUrl = process.env.WEBHOOK_URL;
    this.initializeTasks();
  }

  async initializeTasks() {
    try {
      const tasks = await storage.getCronTasks();
      for (const task of tasks) {
        if (task.status === "active") {
          this.scheduleTask(task);
        }
      }
    } catch (error) {
      console.error("Erro ao inicializar tarefas:", error);
    }
  }

  scheduleTask(task: CronTask) {
    if (!cron.validate(task.cronExpression)) {
      console.error(`Expressão cron inválida para tarefa ${task.id}: ${task.cronExpression}`);
      return false;
    }

    // Remove tarefa existente se houver
    this.unscheduleTask(task.id);

    const scheduledTask = cron.schedule(task.cronExpression, async () => {
      await this.executeTask(task);
    }, {
      timezone: "America/Sao_Paulo"
    });

    scheduledTask.start();
    this.tasks.set(task.id, scheduledTask);

    // Calcular próxima execução
    const nextRun = this.getNextRun(task.cronExpression);
    if (nextRun) {
      storage.updateTaskRun(task.id, new Date(), nextRun);
    }

    return true;
  }

  async executeTask(task: CronTask) {
    const startTime = Date.now();
    
    try {
      await storage.createActivityLog({
        taskId: task.id,
        type: "task_executed",
        message: `Iniciando execução da tarefa: ${task.name}`,
        details: { command: task.command }
      });

      broadcastLog({
        id: Date.now().toString(),
        taskId: task.id,
        type: "task_executed",
        message: `Executando: ${task.name}`,
        details: { command: task.command },
        createdAt: new Date()
      });

      const output = await this.runCommand(task.command, task.timeout || 300);
      
      await storage.incrementRunCount(task.id);
      await storage.updateTaskRun(task.id, new Date());

      if (task.logOutput) {
        await storage.createActivityLog({
          taskId: task.id,
          type: "task_executed",
          message: `Tarefa ${task.name} executada com sucesso`,
          details: { 
            output: output.substring(0, 1000), // Limitar tamanho do log
            duration: Date.now() - startTime 
          }
        });
      }

      broadcastLog({
        id: Date.now().toString(),
        taskId: task.id,
        type: "task_executed",
        message: `${task.name} executada com sucesso`,
        details: { duration: Date.now() - startTime },
        createdAt: new Date()
      });

      if (task.enableWebhook && this.webhookUrl) {
        await this.sendWebhook(task, "success", { output, duration: Date.now() - startTime });
      }

      if (task.enableEmailNotification && task.emailOnSuccess) {
        await emailService.sendTaskNotification(task, "success", { 
          output: output.substring(0, 500), 
          duration: Date.now() - startTime 
        });
      }

    } catch (error) {
      await storage.incrementErrorCount(task.id);
      await storage.updateTaskStatus(task.id, "error");

      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      await storage.createActivityLog({
        taskId: task.id,
        type: "task_failed",
        message: `Falha na execução da tarefa: ${task.name}`,
        details: { 
          error: errorMessage,
          duration: Date.now() - startTime 
        }
      });

      broadcastLog({
        id: Date.now().toString(),
        taskId: task.id,
        type: "task_failed",
        message: `Falha na execução: ${task.name} - ${errorMessage}`,
        details: { error: errorMessage },
        createdAt: new Date()
      });

      if (task.enableWebhook && this.webhookUrl) {
        await this.sendWebhook(task, "error", { error: errorMessage, duration: Date.now() - startTime });
      }

      if (task.enableEmailNotification && task.emailOnFailure) {
        await emailService.sendTaskNotification(task, "error", { 
          error: errorMessage, 
          duration: Date.now() - startTime 
        });
      }
    }
  }

  private runCommand(command: string, timeout: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = exec(command, { timeout: timeout * 1000 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Comando falhou: ${error.message}\nStderr: ${stderr}`));
        } else {
          resolve(stdout || stderr || "Comando executado sem saída");
        }
      });

      process.on('timeout', () => {
        reject(new Error(`Comando excedeu o timeout de ${timeout} segundos`));
      });
    });
  }

  private async sendWebhook(task: CronTask, status: "success" | "error", details: any) {
    if (!this.webhookUrl) return;

    try {
      const payload = {
        taskId: task.id,
        taskName: task.name,
        status,
        timestamp: new Date().toISOString(),
        details
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CronManager/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook falhou: ${response.status} ${response.statusText}`);
      }

      await storage.createActivityLog({
        taskId: task.id,
        type: "webhook_sent",
        message: `Webhook enviado com sucesso para ${this.webhookUrl}`,
        details: { status: response.status }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      await storage.createActivityLog({
        taskId: task.id,
        type: "webhook_failed",
        message: `Falha ao enviar webhook: ${errorMessage}`,
        details: { url: this.webhookUrl, error: errorMessage }
      });
    }
  }

  unscheduleTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.stop();
      task.destroy();
      this.tasks.delete(taskId);
      return true;
    }
    return false;
  }

  async startTask(taskId: string): Promise<boolean> {
    const task = await storage.getCronTask(taskId);
    if (!task) return false;

    await storage.updateTaskStatus(taskId, "active");
    const success = this.scheduleTask(task);
    
    if (success) {
      await storage.createActivityLog({
        taskId,
        type: "task_started",
        message: `Tarefa ${task.name} foi iniciada`,
        details: null
      });

      broadcastLog({
        id: Date.now().toString(),
        taskId,
        type: "task_started",
        message: `Tarefa ${task.name} foi iniciada`,
        details: null,
        createdAt: new Date()
      });
    }

    return success;
  }

  async stopTask(taskId: string): Promise<boolean> {
    const task = await storage.getCronTask(taskId);
    if (!task) return false;

    await storage.updateTaskStatus(taskId, "paused");
    const success = this.unscheduleTask(taskId);
    
    if (success) {
      await storage.createActivityLog({
        taskId,
        type: "task_stopped",
        message: `Tarefa ${task.name} foi pausada`,
        details: null
      });

      broadcastLog({
        id: Date.now().toString(),
        taskId,
        type: "task_stopped",
        message: `Tarefa ${task.name} foi pausada`,
        details: null,
        createdAt: new Date()
      });
    }

    return success;
  }

  private getNextRun(cronExpression: string): Date | null {
    try {
      // Implementação simples para calcular próxima execução
      // Em produção, considere usar uma biblioteca como 'cron-parser'
      const now = new Date();
      now.setMinutes(now.getMinutes() + 1); // Próximo minuto como aproximação
      return now;
    } catch {
      return null;
    }
  }

  getTaskStatus(taskId: string): "active" | "paused" | "not_found" {
    if (this.tasks.has(taskId)) {
      return "active";
    }
    return "paused";
  }

  getAllTasksStatus(): Map<string, "active" | "paused"> {
    const status = new Map<string, "active" | "paused">();
    this.tasks.forEach((_, taskId) => {
      status.set(taskId, "active");
    });
    return status;
  }
}

export const cronService = new CronService();
