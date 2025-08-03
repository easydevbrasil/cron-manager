import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { StatsCards } from "@/components/stats-cards";
import { TaskList } from "@/components/task-list";
import { ActivityLogs } from "@/components/activity-logs";
import { CreateTaskModal } from "@/components/create-task-modal";
import { CronTask } from "@shared/schema";

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CronTask | null>(null);

  const handleEditTask = (task: CronTask) => {
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingTask(null);
  };

  const headerActions = (
    <Button 
      onClick={() => setIsCreateModalOpen(true)}
      className="bg-primary hover:bg-primary/90 text-primary-foreground"
      size="sm"
    >
      <i className="fas fa-plus mr-1 sm:mr-2"></i>
      <span className="hidden sm:inline">Nova Tarefa</span>
      <span className="sm:hidden">Nova</span>
    </Button>
  );

  return (
    <Layout 
      title="Dashboard de Tarefas"
      description="Gerencie suas tarefas cron e monitore execuções"
      actions={headerActions}
    >
      <div className="space-y-6">
          <StatsCards />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <TaskList onEditTask={handleEditTask} />
            </div>
            
            <div className="xl:col-span-1 space-y-6">
              <ActivityLogs />
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ações Rápidas</h3>
                </div>
                
                <div className="p-4 sm:p-6 space-y-3">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Criar Nova Tarefa
                  </Button>
                  
                  <Button variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    <i className="fas fa-pause mr-2"></i>
                    Pausar Todas
                  </Button>
                  
                  <Button variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    <i className="fas fa-download mr-2"></i>
                    Exportar Logs
                  </Button>
                </div>
              </div>
            </div>
        </div>
      </div>

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={handleCloseModal}
        editingTask={editingTask}
      />
    </Layout>
  );
}
