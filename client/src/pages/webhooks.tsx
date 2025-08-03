import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CronTask } from "@shared/schema";

export default function WebhooksPage() {
  const [testUrl, setTestUrl] = useState("");
  const [testPayload, setTestPayload] = useState('{\n  "message": "Test webhook",\n  "timestamp": "' + new Date().toISOString() + '"\n}');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<string>("");

  const { data: tasks = [] } = useQuery<CronTask[]>({
    queryKey: ["/api/tasks"]
  });

  const webhookTasks = tasks.filter(task => task.enableWebhook);

  const testWebhook = async () => {
    if (!testUrl.trim()) {
      setTestResult("Por favor, insira uma URL válida");
      return;
    }

    setIsTestingWebhook(true);
    setTestResult("");

    try {
      const response = await fetch(testUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: testPayload,
      });

      const responseText = await response.text();
      
      setTestResult(`Status: ${response.status} ${response.statusText}\n\nResposta:\n${responseText}`);
    } catch (error) {
      setTestResult(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Webhooks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure e monitore webhooks para suas tarefas cron
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Webhook Info */}
          <div className="xl:col-span-2 space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-link mr-2"></i>
                  Sobre Webhooks
                </CardTitle>
                <CardDescription>
                  Webhooks permitem que o sistema notifique aplicações externas quando tarefas são executadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <i className="fas fa-info-circle"></i>
                    <AlertDescription>
                      Quando uma tarefa com webhook habilitado é executada, o sistema enviará uma requisição POST 
                      para a URL configurada com informações sobre a execução.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Estrutura do Payload</h4>
                    <pre className="text-xs overflow-auto">
{`{
  "taskId": "123",
  "taskName": "Backup diário",
  "status": "success|error",
  "message": "Descrição do resultado",
  "timestamp": "2025-01-01T12:00:00Z",
  "duration": 1500,
  "output": "Saída da execução (se disponível)"
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Webhooks */}
            <Card>
              <CardHeader>
                <CardTitle>Tarefas com Webhook Ativo</CardTitle>
                <CardDescription>
                  {webhookTasks.length} tarefa{webhookTasks.length !== 1 ? 's' : ''} configurada{webhookTasks.length !== 1 ? 's' : ''} com webhook
                </CardDescription>
              </CardHeader>
              <CardContent>
                {webhookTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-unlink text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhuma tarefa com webhook configurado
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Edite uma tarefa para habilitar webhooks
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {webhookTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {task.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {task.description || "Sem descrição"}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <Badge variant={task.status === "active" ? "default" : "secondary"}>
                              {task.status === "active" ? "Ativa" : "Pausada"}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Cron: {task.cronExpression}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-link text-green-500"></i>
                          <span className="text-sm text-green-600 dark:text-green-400">
                            Webhook Ativo
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Webhook Tester */}
          <div className="xl:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-flask mr-2"></i>
                  Testar Webhook
                </CardTitle>
                <CardDescription>
                  Teste um endpoint webhook com payload personalizado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="webhook-url">URL do Webhook</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://exemplo.com/webhook"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="webhook-payload">Payload JSON</Label>
                  <Textarea
                    id="webhook-payload"
                    placeholder="Payload a ser enviado..."
                    rows={8}
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={testWebhook}
                  disabled={isTestingWebhook || !testUrl.trim()}
                  className="w-full"
                >
                  {isTestingWebhook ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Testando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>
                      Enviar Teste
                    </>
                  )}
                </Button>

                {testResult && (
                  <div>
                    <Label>Resultado do Teste</Label>
                    <Textarea
                      value={testResult}
                      readOnly
                      rows={6}
                      className="font-mono text-xs"
                    />
                  </div>
                )}

                <Alert>
                  <i className="fas fa-shield-alt"></i>
                  <AlertDescription className="text-xs">
                    <strong>Segurança:</strong> Use HTTPS sempre que possível. 
                    Considere implementar autenticação nos seus endpoints webhook.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}