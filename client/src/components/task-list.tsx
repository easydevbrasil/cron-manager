import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CronTask } from "@shared/schema";

interface TaskListProps {
  onEditTask: (task: CronTask) => void;
}

export function TaskList({ onEditTask }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: tasks = [], isLoading, refetch } = useQuery<CronTask[]>({
    queryKey: ["/api/tasks"],
    refetchInterval: 10000, // Atualizar a cada 10 segundos
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => 
      apiRequest("DELETE", `/api/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Tarefa deletada",
        description: "A tarefa foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar a tarefa.",
        variant: "destructive",
      });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, action }: { taskId: string; action: "start" | "stop" }) =>
      apiRequest("POST", `/api/tasks/${taskId}/${action}`, {}),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: action === "start" ? "Tarefa iniciada" : "Tarefa pausada",
        description: `A tarefa foi ${action === "start" ? "iniciada" : "pausada"} com sucesso.`,
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da tarefa.",
        variant: "destructive",
      });
    },
  });

  const filteredTasks = tasks.filter(task =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success border-success/20">Ativo</Badge>;
      case "paused":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pausado</Badge>;
      case "error":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Erro</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTaskIcon = (taskName: string) => {
    if (taskName.toLowerCase().includes("backup")) return "fas fa-database";
    if (taskName.toLowerCase().includes("email") || taskName.toLowerCase().includes("relatório")) return "fas fa-envelope";
    if (taskName.toLowerCase().includes("limpeza") || taskName.toLowerCase().includes("log")) return "fas fa-broom";
    return "fas fa-cog";
  };

  const formatNextRun = (nextRun: string | null) => {
    if (!nextRun) return "--";
    const date = new Date(nextRun);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (taskDate.getTime() === today.getTime()) {
      return `Hoje, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    }
    
    return date.toLocaleDateString("pt-BR", { 
      weekday: "long", 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Tarefas Recentes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tarefas Recentes</h3>
          <div className="flex items-center space-x-2">
            <Input
              type="search"
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              className="flex-shrink-0 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <i className="fas fa-sync-alt"></i>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tarefa
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                Status
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                Próxima Execução
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <div className="text-gray-500">
                    <i className="fas fa-inbox text-4xl mb-4"></i>
                    <p className="text-lg font-medium">Nenhuma tarefa encontrada</p>
                    <p className="text-sm">
                      {searchTerm ? "Tente ajustar sua busca" : "Crie sua primeira tarefa cron"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <i className={`${getTaskIcon(task.name)} text-primary`}></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.name}</div>
                        <div className="text-sm text-gray-500">{task.description || task.cronExpression}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(task.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNextRun(task.nextRun ? task.nextRun.toString() : null)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditTask(task)}
                        className="text-primary hover:text-primary/80"
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      {task.status === "active" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleTaskMutation.mutate({ taskId: task.id, action: "stop" })}
                          disabled={toggleTaskMutation.isPending}
                          className="text-warning hover:text-warning/80"
                        >
                          <i className="fas fa-pause"></i>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleTaskMutation.mutate({ taskId: task.id, action: "start" })}
                          disabled={toggleTaskMutation.isPending}
                          className="text-success hover:text-success/80"
                        >
                          <i className="fas fa-play"></i>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (window.confirm("Tem certeza que deseja deletar esta tarefa?")) {
                            deleteTaskMutation.mutate(task.id);
                          }
                        }}
                        disabled={deleteTaskMutation.isPending}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {filteredTasks.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">1</span> a{" "}
              <span className="font-medium">{filteredTasks.length}</span> de{" "}
              <span className="font-medium">{tasks.length}</span> tarefas
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
