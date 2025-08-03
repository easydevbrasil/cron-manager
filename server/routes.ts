import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateApiKey, AuthenticatedRequest } from "./middleware/auth";
import { insertCronTaskSchema, updateCronTaskSchema } from "@shared/schema";
import { cronService } from "./services/cronService";
import { initializeWebSocket, broadcastStats } from "./services/websocketService";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Inicializar WebSocket
  initializeWebSocket(httpServer);

  // Middleware de autenticação para todas as rotas da API
  app.use("/api", authenticateApiKey as any);

  // Estatísticas do dashboard
  app.get("/api/stats", async (req: AuthenticatedRequest, res) => {
    try {
      const stats = await storage.getTaskStats();
      res.json(stats);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      res.status(500).json({ 
        error: "Erro interno do servidor",
        message: "Não foi possível carregar as estatísticas" 
      });
    }
  });

  // Listar todas as tarefas cron
  app.get("/api/tasks", async (req: AuthenticatedRequest, res) => {
    try {
      const tasks = await storage.getCronTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      res.status(500).json({ 
        error: "Erro interno do servidor",
        message: "Não foi possível carregar as tarefas" 
      });
    }
  });

  // Buscar tarefa específica
  app.get("/api/tasks/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const task = await storage.getCronTask(req.params.id);
      if (!task) {
        return res.status(404).json({ 
          error: "Tarefa não encontrada",
          message: `Não foi possível encontrar a tarefa com ID ${req.params.id}` 
        });
      }
      res.json(task);
    } catch (error) {
      console.error("Erro ao buscar tarefa:", error);
      res.status(500).json({ 
        error: "Erro interno do servidor",
        message: "Não foi possível carregar a tarefa" 
      });
    }
  });

  // Criar nova tarefa
  app.post("/api/tasks", async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertCronTaskSchema.parse(req.body);
      
      const task = await storage.createCronTask(validatedData);
      
      await storage.createActivityLog({
        taskId: task.id,
        type: "task_created",
        message: `Nova tarefa criada: ${task.name}`,
        details: { status: task.status }
      });

      if (task.status === "active") {
        cronService.scheduleTask(task);
      }

      // Atualizar estatísticas
      const stats = await storage.getTaskStats();
      broadcastStats(stats);

      res.status(201).json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos",
          message: "Os dados fornecidos não são válidos",
          details: error.errors 
        });
      }
      console.error("Erro ao criar tarefa:", error);
      res.status(500).json({ 
        error: "Erro interno do servidor",
        message: "Não foi possível criar a tarefa" 
      });
    }
  });

  // Atualizar tarefa
  app.put("/api/tasks/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = updateCronTaskSchema.parse(req.body);
      
      const task = await storage.updateCronTask(req.params.id, validatedData);
      if (!task) {
        return res.status(404).json({ 
          error: "Tarefa não encontrada",
          message: `Não foi possível encontrar a tarefa com ID ${req.params.id}` 
        });
      }

      await storage.createActivityLog({
        taskId: task.id,
        type: "task_updated",
        message: `Tarefa atualizada: ${task.name}`,
        details: validatedData
      });

      // Reagendar se necessário
      if (task.status === "active") {
        cronService.scheduleTask(task);
      } else {
        cronService.unscheduleTask(task.id);
      }

      res.json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos",
          message: "Os dados fornecidos não são válidos",
          details: error.errors 
        });
      }
      console.error("Erro ao atualizar tarefa:", error);
      res.status(500).json({ 
        error: "Erro interno do servidor",
        message: "Não foi possível atualizar a tarefa" 
      });
    }
  });

  // Deletar tarefa
  app.delete("/api/tasks/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const task = await storage.getCronTask(req.params.id);
      if (!task) {
        return res.status(404).json({ 
          error: "Tarefa não encontrada",
          message: `Não foi possível encontrar a tarefa com ID ${req.params.id}` 
        });
      }

      cronService.unscheduleTask(req.params.id);
      const deleted = await storage.deleteCronTask(req.params.id);
      
      if (deleted) {
        await storage.createActivityLog({
          taskId: req.params.id,
          type: "task_deleted",
          message: `Tarefa deletada: ${task.name}`,
          details: null
        });

        // Atualizar estatísticas
        const stats = await storage.getTaskStats();
        broadcastStats(stats);

        res.json({ message: "Tarefa deletada com sucesso" });
      } else {
        res.status(500).json({ 
          error: "Erro interno do servidor",
          message: "Não foi possível deletar a tarefa" 
        });
      }
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      res.status(500).json({ 
        error: "Erro interno do servidor",
        message: "Não foi possível deletar a tarefa" 
      });
    }
  });

  // Iniciar tarefa
  app.post("/api/tasks/:id/start", async (req: AuthenticatedRequest, res) => {
    try {
      const success = await cronService.startTask(req.params.id);
      if (success) {
        const stats = await storage.getTaskStats();
        broadcastStats(stats);
        res.json({ message: "Tarefa iniciada com sucesso" });
      } else {
        res.status(404).json({ 
          error: "Tarefa não encontrada",
          message: `Não foi possível encontrar a tarefa com ID ${req.params.id}` 
        });
      }
    } catch (error) {
      console.error("Erro ao iniciar tarefa:", error);
      res.status(500).json({ 
        error: "Erro interno do servidor",
        message: "Não foi possível iniciar a tarefa" 
      });
    }
  });

  // Parar tarefa
  app.post("/api/tasks/:id/stop", async (req: AuthenticatedRequest, res) => {
    try {
      const success = await cronService.stopTask(req.params.id);
      if (success) {
        const stats = await storage.getTaskStats();
        broadcastStats(stats);
        res.json({ message: "Tarefa pausada com sucesso" });
      } else {
        res.status(404).json({ 
          error: "Tarefa não encontrada",
          message: `Não foi possível encontrar a tarefa com ID ${req.params.id}` 
        });
      }
    } catch (error) {
      console.error("Erro ao pausar tarefa:", error);
      res.status(500).json({ 
        error: "Erro interno do servidor",
        message: "Não foi possível pausar a tarefa" 
      });
    }
  });

  // Buscar logs de atividade
  app.get("/api/logs", async (req: AuthenticatedRequest, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      res.status(500).json({ 
        error: "Erro interno do servidor",
        message: "Não foi possível carregar os logs" 
      });
    }
  });

  // Webhook para receber informações de tarefas
  app.post("/api/webhook", async (req: AuthenticatedRequest, res) => {
    try {
      const { taskId, status, details } = req.body;
      
      if (!taskId || !status) {
        return res.status(400).json({ 
          error: "Dados obrigatórios ausentes",
          message: "taskId e status são obrigatórios" 
        });
      }

      const task = await storage.getCronTask(taskId);
      if (!task) {
        return res.status(404).json({ 
          error: "Tarefa não encontrada",
          message: `Não foi possível encontrar a tarefa com ID ${taskId}` 
        });
      }

      await storage.createActivityLog({
        taskId,
        type: "webhook_received",
        message: `Webhook recebido para tarefa ${task.name}`,
        details: { status, ...details }
      });

      res.json({ message: "Webhook processado com sucesso" });
    } catch (error) {
      console.error("Erro ao processar webhook:", error);
      res.status(500).json({ 
        error: "Erro interno do servidor",
        message: "Não foi possível processar o webhook" 
      });
    }
  });

  return httpServer;
}
