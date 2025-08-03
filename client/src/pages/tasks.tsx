import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CreateTaskModal } from "@/components/create-task-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CronTask } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function TasksPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  const { data: tasks = [], isLoading } = useQuery<CronTask[]>({
    queryKey: ["/api/tasks"]
  });

  const toggleTask = async (task: CronTask) => {
    try {
      const endpoint = task.status === "active" ? "stop" : "start";
      await apiRequest("POST", `/api/tasks/${task.id}/${endpoint}`);
      
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Sucesso",
        description: `Tarefa ${task.status === "active" ? "pausada" : "ativada"} com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status da tarefa",
        variant: "destructive"
      });
    }
  };

  const runTask = async (task: CronTask) => {
    try {
      await apiRequest("POST", `/api/tasks/${task.id}/run`);
      
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      
      toast({
        title: "Sucesso",
        description: "Tarefa executada manualmente"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao executar tarefa",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (task: CronTask) => {
    if (!confirm(`Deseja realmente excluir a tarefa "${task.name}"?`)) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/tasks/${task.id}`);
      
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Sucesso",
        description: "Tarefa excluída com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir tarefa",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Tarefas Cron
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie suas tarefas automatizadas
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <i className="fas fa-plus mr-2"></i>
            Nova Tarefa
          </Button>
        </div>

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <i className="fas fa-tasks text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Nenhuma tarefa encontrada
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                Crie sua primeira tarefa cron para começar
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <i className="fas fa-plus mr-2"></i>
                Criar Primera Tarefa
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold mb-1">
                        {task.name}
                      </CardTitle>
                      {task.description && (
                        <CardDescription className="text-sm">
                          {task.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={task.status === "active"}
                        onCheckedChange={() => toggleTask(task)}
                      />
                      <Badge variant={task.status === "active" ? "default" : "secondary"}>
                        {task.status === "active" ? "Ativa" : "Pausada"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <i className="fas fa-terminal mr-2 w-4"></i>
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                        {task.command}
                      </code>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <i className="fas fa-clock mr-2 w-4"></i>
                      <code className="font-mono text-xs">
                        {task.cronExpression}
                      </code>
                    </div>

                    {task.lastRun && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <i className="fas fa-history mr-2 w-4"></i>
                        <span className="text-xs">
                          Última execução: {new Date(task.lastRun).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}

                    {task.nextRun && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <i className="fas fa-calendar mr-2 w-4"></i>
                        <span className="text-xs">
                          Próxima execução: {new Date(task.nextRun).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runTask(task)}
                      >
                        <i className="fas fa-play mr-1"></i>
                        Executar
                      </Button>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTask(task)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Task Modal */}
        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </div>
  );
}