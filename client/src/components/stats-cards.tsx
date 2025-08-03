import { useQuery } from "@tanstack/react-query";

interface Stats {
  activeTasks: number;
  pausedTasks: number;
  todayExecutions: number;
  failures: number;
}

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Tarefas Ativas",
      value: stats?.activeTasks || 0,
      icon: "fas fa-play",
      bgColor: "bg-success/10",
      iconColor: "text-success",
      subtitle: "+2 hoje"
    },
    {
      title: "Tarefas Pausadas",
      value: stats?.pausedTasks || 0,
      icon: "fas fa-pause",
      bgColor: "bg-warning/10",
      iconColor: "text-warning",
      subtitle: "3 pendentes"
    },
    {
      title: "Execuções Hoje",
      value: stats?.todayExecutions || 0,
      icon: "fas fa-chart-line",
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      subtitle: "+18% vs ontem"
    },
    {
      title: "Falhas",
      value: stats?.failures || 0,
      icon: "fas fa-exclamation-triangle",
      bgColor: "bg-destructive/10",
      iconColor: "text-destructive",
      subtitle: stats?.failures ? "Requer atenção" : "Tudo funcionando"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
              <i className={`${card.icon} ${card.iconColor} text-lg sm:text-xl`}></i>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center">
            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{card.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
