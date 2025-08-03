import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ActivityLog } from "@shared/schema";

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const initialLogsSet = useRef(false);

  const { data: initialLogs = [] } = useQuery<ActivityLog[]>({
    queryKey: ["/api/logs"],
    queryFn: async () => {
      const response = await fetch("/api/logs", {
        headers: {
          "X-API-Key": localStorage.getItem("cron_api_key") || ""
        }
      });
      return response.json();
    }
  });

  useEffect(() => {
    if (initialLogs.length > 0 && !initialLogsSet.current) {
      setLogs(initialLogs);
      initialLogsSet.current = true;
    }
  }, [initialLogs]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "log") {
          setLogs((prevLogs) => [message.data, ...prevLogs.slice(0, 49)]);
        }
      } catch (error) {
        console.error("Erro ao processar mensagem WebSocket:", error);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("Erro WebSocket:", error);
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const getLogIcon = (type: string) => {
    switch (type) {
      case "task_executed":
        return { icon: "w-2 h-2 bg-success rounded-full", color: "text-success" };
      case "task_failed":
        return { icon: "w-2 h-2 bg-destructive rounded-full", color: "text-destructive" };
      case "task_started":
      case "task_stopped":
        return { icon: "w-2 h-2 bg-warning rounded-full", color: "text-warning" };
      case "task_created":
      case "task_updated":
      case "task_deleted":
        return { icon: "w-2 h-2 bg-primary rounded-full", color: "text-primary" };
      case "webhook_sent":
        return { icon: "w-2 h-2 bg-success rounded-full", color: "text-success" };
      case "webhook_failed":
        return { icon: "w-2 h-2 bg-destructive rounded-full", color: "text-destructive" };
      default:
        return { icon: "w-2 h-2 bg-gray-400 rounded-full", color: "text-gray-400" };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `Há ${diffMins} min${diffMins > 1 ? "s" : ""}`;
    if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Logs de Atividade</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-success' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-gray-500">
                {wsConnected ? 'Tempo real' : 'Desconectado'}
              </span>
            </div>
          </div>
          <Button variant="ghost" className="text-primary hover:text-primary/80 text-sm font-medium">
            Ver todos
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-history text-4xl mb-4"></i>
              <p className="text-lg font-medium">Nenhum log disponível</p>
              <p className="text-sm">Os logs de atividade aparecerão aqui</p>
            </div>
          ) : (
            logs.map((log) => {
              const logStyle = getLogIcon(log.type);
              return (
                <div key={log.id} className="flex items-start space-x-3">
                  <div className={`${logStyle.icon} mt-2 flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{log.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(log.createdAt ? log.createdAt.toString() : new Date().toISOString())}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
