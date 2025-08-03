import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActivityLog } from "@shared/schema";
import { Sidebar } from "@/components/sidebar";

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: logs = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/logs"],
  });

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchTerm ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all"; // ActivityLog doesn't have status field
    const matchesType = typeFilter === "all" || log.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (type: string) => {
    switch (type) {
      case "task_executed":
        return (
          <Badge variant="default" className="bg-green-600">
            Executado
          </Badge>
        );
      case "task_failed":
        return <Badge variant="destructive">Falhou</Badge>;
      case "task_started":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            Iniciado
          </Badge>
        );
      case "task_stopped":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            Parado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {type.replace("task_", "").replace("_", " ")}
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "execution":
        return "fas fa-play";
      case "system":
        return "fas fa-cog";
      case "webhook":
        return "fas fa-link";
      case "email":
        return "fas fa-envelope";
      default:
        return "fas fa-info-circle";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400">Carregando logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Logs de Atividade
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Histórico completo de execuções e eventos do sistema
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
            <CardDescription>
              Filtre os logs por texto, status ou tipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <Input
                  placeholder="Buscar por mensagem ou tarefa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="success">Sucesso</SelectItem>
                    <SelectItem value="error">Erro</SelectItem>
                    <SelectItem value="warning">Aviso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="execution">Execução</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {filteredLogs.length} de {logs.length} logs
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logs List */}
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <i className="fas fa-history text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Nenhum log encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                {logs.length === 0
                  ? "Não há logs para exibir ainda"
                  : "Tente ajustar os filtros para encontrar logs específicos"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <i
                          className={`${getTypeIcon(log.type)} text-gray-500`}
                        ></i>
                        <span className="font-medium text-gray-900 dark:text-white">
                          Sistema
                        </span>
                        {getStatusBadge(log.type)}
                        <span className="text-sm text-gray-500">
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleString("pt-BR")
                            : "Data não disponível"}
                        </span>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {log.message}
                      </p>

                      {log.details && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                            Ver detalhes
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                            {typeof log.details === "string"
                              ? log.details
                              : JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}

                      {log.details &&
                        typeof log.details === "object" &&
                        "duration" in log.details && (
                          <div className="mt-2 text-xs text-gray-500">
                            Duração: {(log.details as any).duration}ms
                          </div>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
