import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { StatsCards } from "@/components/stats-cards";
import { TaskList } from "@/components/task-list";
import { ActivityLogs } from "@/components/activity-logs";
import { CreateTaskModal } from "@/components/create-task-modal";
import { CronTask } from "@shared/schema";

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CronTask | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleEditTask = (task: CronTask) => {
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl">
            <Sidebar />
          </div>
        </div>
      )}
      
      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <i className="fas fa-bars"></i>
              </Button>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard de Tarefas</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Gerencie suas tarefas cron e monitore execuções</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Sistema Online</span>
              </div>
              
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                size="sm"
              >
                <i className="fas fa-plus mr-1 sm:mr-2"></i>
                <span className="hidden sm:inline">Nova Tarefa</span>
                <span className="sm:hidden">Nova</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-6">
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
      </main>

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={handleCloseModal}
        editingTask={editingTask}
      />
    </div>
  );
}
