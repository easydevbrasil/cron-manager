import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout";

export default function ApiDocs() {
  const [apiKey, setApiKey] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testEndpoint = async (endpoint: string, method: string = "GET", body?: any) => {
    if (!apiKey) {
      alert("Por favor, insira sua chave API primeiro");
      return;
    }

    setIsLoading(true);
    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey
        }
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint, options);
      const data = await response.json();
      
      setTestResponse(JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        data: data
      }, null, 2));
    } catch (error) {
      setTestResponse(`Erro: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const endpoints = [
    {
      path: "/api/stats",
      method: "GET",
      description: "Obtém estatísticas do dashboard",
      response: "Retorna contadores de tarefas ativas, pausadas, execuções e falhas"
    },
    {
      path: "/api/tasks",
      method: "GET", 
      description: "Lista todas as tarefas cron",
      response: "Array com todas as tarefas cadastradas"
    },
    {
      path: "/api/tasks",
      method: "POST",
      description: "Cria uma nova tarefa cron",
      body: {
        name: "string",
        description: "string (opcional)",
        command: "string",
        cronExpression: "string",
        timeout: "number (opcional)",
        enableWebhook: "boolean (opcional)",
        enableEmailNotification: "boolean (opcional)",
        emailOnSuccess: "boolean (opcional)",
        emailOnFailure: "boolean (opcional)",
        logOutput: "boolean (opcional)"
      },
      response: "Objeto da tarefa criada"
    }
  ];

  return (
    <Layout 
      title="Documentação da API"
      description="Gerencie suas tarefas cron programaticamente usando nossa API REST"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuração da API */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Configuração</CardTitle>
              <CardDescription>
                Configure sua chave API para testar os endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Chave API</label>
                <Input
                  type="password"
                  placeholder="Sua chave API"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Autenticação
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Todas as requisições devem incluir o header:
                </p>
                <code className="block mt-2 p-2 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                  X-API-Key: sua_chave_aqui
                </code>
              </div>

              {testResponse && (
                <div>
                  <label className="text-sm font-medium">Resposta do Teste</label>
                  <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-40">
                    {testResponse}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Endpoints */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Endpoints Disponíveis</CardTitle>
              <CardDescription>
                Lista completa de endpoints da API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant={endpoint.method === "GET" ? "secondary" : "default"}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono">{endpoint.path}</code>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testEndpoint(endpoint.path.replace(':id', '1'), endpoint.method, endpoint.body)}
                        disabled={isLoading || !apiKey}
                      >
                        {isLoading ? "Testando..." : "Testar"}
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {endpoint.description}
                    </p>

                    {endpoint.body && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium mb-2">Corpo da Requisição:</h5>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
                          {JSON.stringify(endpoint.body, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div>
                      <h5 className="text-sm font-medium mb-2">Resposta:</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {endpoint.response}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}