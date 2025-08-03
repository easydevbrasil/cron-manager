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
    },
    {
      path: "/api/tasks/:id",
      method: "PUT",
      description: "Atualiza uma tarefa existente",
      body: "Mesmo corpo do POST",
      response: "Objeto da tarefa atualizada"
    },
    {
      path: "/api/tasks/:id",
      method: "DELETE",
      description: "Remove uma tarefa",
      response: "Confirmação da remoção"
    },
    {
      path: "/api/tasks/:id/start",
      method: "POST",
      description: "Inicia/ativa uma tarefa",
      response: "Status da operação"
    },
    {
      path: "/api/tasks/:id/stop", 
      method: "POST",
      description: "Para/pausa uma tarefa",
      response: "Status da operação"
    },
    {
      path: "/api/tasks/:id/run",
      method: "POST", 
      description: "Executa uma tarefa manualmente",
      response: "Resultado da execução"
    },
    {
      path: "/api/logs",
      method: "GET",
      description: "Obtém logs de atividade",
      response: "Array com logs de execução das tarefas"
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
                          <Badge variant={endpoint.method === "GET" ? "secondary" : 
                                       endpoint.method === "POST" ? "default" : 
                                       endpoint.method === "PUT" ? "outline" : "destructive"}>
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
                        <p className="text-sm text-gray-600 dark:text-gray-400">
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

        {/* Exemplos de uso */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Exemplos de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>
              
              <TabsContent value="curl" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Listar tarefas</h4>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto">
{`curl -X GET "http://localhost:5000/api/tasks" \\
  -H "X-API-Key: sua_chave_api"`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Criar nova tarefa</h4>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto">
{`curl -X POST "http://localhost:5000/api/tasks" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: sua_chave_api" \\
  -d '{
    "name": "Backup diário",
    "description": "Executa backup dos dados",
    "command": "backup.sh",
    "cronExpression": "0 2 * * *"
  }'`}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="javascript" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Usando fetch API</h4>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto">
{`// Listar tarefas
const response = await fetch('http://localhost:5000/api/tasks', {
  headers: {
    'X-API-Key': 'sua_chave_api'
  }
});
const tasks = await response.json();

// Criar nova tarefa
const newTask = await fetch('http://localhost:5000/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'sua_chave_api'
  },
  body: JSON.stringify({
    name: 'Backup diário',
    description: 'Executa backup dos dados',
    command: 'backup.sh',
    cronExpression: '0 2 * * *'
  })
});`}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="python" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Usando requests</h4>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto">
{`import requests

# Configuração
api_key = "sua_chave_api"
base_url = "http://localhost:5000/api"
headers = {"X-API-Key": api_key}

# Listar tarefas
response = requests.get(f"{base_url}/tasks", headers=headers)
tasks = response.json()

# Criar nova tarefa
new_task = {
    "name": "Backup diário",
    "description": "Executa backup dos dados", 
    "command": "backup.sh",
    "cronExpression": "0 2 * * *"
}

response = requests.post(
    f"{base_url}/tasks", 
    json=new_task, 
    headers={**headers, "Content-Type": "application/json"}
)`}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </div>
      </div>
    </Layout>
  );
}