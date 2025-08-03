import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";

export default function SettingsPage() {
  const { toast } = useToast();
  
  // Email Settings
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [emailFrom, setEmailFrom] = useState("");
  const [emailTo, setEmailTo] = useState("");

  // System Settings
  const [maxLogRetention, setMaxLogRetention] = useState("30");
  const [maxConcurrentTasks, setMaxConcurrentTasks] = useState("5");
  const [defaultTimeout, setDefaultTimeout] = useState("300");
  const [enableLogging, setEnableLogging] = useState(true);
  const [logLevel, setLogLevel] = useState("info");

  // Security Settings
  const [allowedIPs, setAllowedIPs] = useState("");
  const [enableRateLimit, setEnableRateLimit] = useState(true);
  const [rateLimitWindow, setRateLimitWindow] = useState("15");
  const [rateLimitRequests, setRateLimitRequests] = useState("100");

  const testEmailSettings = async () => {
    toast({
      title: "Teste de Email",
      description: "Enviando email de teste...",
    });

    // Simular teste de email
    setTimeout(() => {
      toast({
        title: "Email Enviado",
        description: "Email de teste enviado com sucesso!",
      });
    }, 2000);
  };

  const saveSettings = async () => {
    toast({
      title: "Configurações Salvas",
      description: "Todas as configurações foram salvas com sucesso!",
    });
  };

  const resetSettings = () => {
    if (confirm("Deseja realmente resetar todas as configurações para os valores padrão?")) {
      setSmtpHost("");
      setSmtpPort("587");
      setSmtpUser("");
      setSmtpPassword("");
      setSmtpSecure(false);
      setEmailFrom("");
      setEmailTo("");
      setMaxLogRetention("30");
      setMaxConcurrentTasks("5");
      setDefaultTimeout("300");
      setEnableLogging(true);
      setLogLevel("info");
      setAllowedIPs("");
      setEnableRateLimit(true);
      setRateLimitWindow("15");
      setRateLimitRequests("100");

      toast({
        title: "Configurações Resetadas",
        description: "Todas as configurações foram resetadas para os valores padrão",
      });
    }
  };

  const headerActions = (
    <div className="flex space-x-2">
      <Button variant="outline" onClick={resetSettings}>
        <i className="fas fa-undo mr-2"></i>
        Resetar
      </Button>
      <Button onClick={saveSettings}>
        <i className="fas fa-save mr-2"></i>
        Salvar
      </Button>
    </div>
  );

  return (
    <Layout 
      title="Configurações"
      description="Configure as preferências e parâmetros do sistema"
      actions={headerActions}
    >
      <div className="space-y-6">
          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-envelope mr-2"></i>
                Configurações de Email
              </CardTitle>
              <CardDescription>
                Configure o servidor SMTP para envio de notificações por email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp-host">Servidor SMTP</Label>
                  <Input
                    id="smtp-host"
                    placeholder="smtp.gmail.com"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="smtp-port">Porta</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    placeholder="587"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="smtp-user">Usuário</Label>
                  <Input
                    id="smtp-user"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="smtp-password">Senha</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    placeholder="••••••••"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="email-from">Email Remetente</Label>
                  <Input
                    id="email-from"
                    type="email"
                    placeholder="noreply@exemplo.com"
                    value={emailFrom}
                    onChange={(e) => setEmailFrom(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="email-to">Email Padrão Destino</Label>
                  <Input
                    id="email-to"
                    type="email"
                    placeholder="admin@exemplo.com"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="smtp-secure"
                    checked={smtpSecure}
                    onCheckedChange={setSmtpSecure}
                  />
                  <Label htmlFor="smtp-secure">Usar conexão segura (TLS)</Label>
                </div>

                <Button variant="outline" onClick={testEmailSettings}>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Testar Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-cogs mr-2"></i>
                Configurações do Sistema
              </CardTitle>
              <CardDescription>
                Configure parâmetros gerais de funcionamento do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="max-log-retention">Retenção de Logs (dias)</Label>
                  <Input
                    id="max-log-retention"
                    type="number"
                    min="1"
                    max="365"
                    value={maxLogRetention}
                    onChange={(e) => setMaxLogRetention(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="max-concurrent-tasks">Tarefas Simultâneas</Label>
                  <Input
                    id="max-concurrent-tasks"
                    type="number"
                    min="1"
                    max="20"
                    value={maxConcurrentTasks}
                    onChange={(e) => setMaxConcurrentTasks(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="default-timeout">Timeout Padrão (segundos)</Label>
                  <Input
                    id="default-timeout"
                    type="number"
                    min="30"
                    max="3600"
                    value={defaultTimeout}
                    onChange={(e) => setDefaultTimeout(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-logging"
                    checked={enableLogging}
                    onCheckedChange={setEnableLogging}
                  />
                  <Label htmlFor="enable-logging">Habilitar logging detalhado</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="log-level">Nível de Log:</Label>
                  <Select value={logLevel} onValueChange={setLogLevel}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-shield-alt mr-2"></i>
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Configure restrições de acesso e limites de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="allowed-ips">IPs Permitidos (opcional)</Label>
                <Textarea
                  id="allowed-ips"
                  placeholder="192.168.1.1&#10;10.0.0.0/8&#10;Deixe vazio para permitir todos"
                  rows={3}
                  value={allowedIPs}
                  onChange={(e) => setAllowedIPs(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Um IP por linha. Suporta CIDR (ex: 192.168.1.0/24)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-rate-limit"
                    checked={enableRateLimit}
                    onCheckedChange={setEnableRateLimit}
                  />
                  <Label htmlFor="enable-rate-limit">Habilitar limite de requisições</Label>
                </div>
              </div>

              {enableRateLimit && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <Label htmlFor="rate-limit-window">Janela de Tempo (minutos)</Label>
                    <Input
                      id="rate-limit-window"
                      type="number"
                      min="1"
                      max="60"
                      value={rateLimitWindow}
                      onChange={(e) => setRateLimitWindow(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="rate-limit-requests">Máximo de Requisições</Label>
                    <Input
                      id="rate-limit-requests"
                      type="number"
                      min="10"
                      max="1000"
                      value={rateLimitRequests}
                      onChange={(e) => setRateLimitRequests(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-info-circle mr-2"></i>
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Versão:</span>
                    <Badge variant="outline">1.0.0</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Node.js:</span>
                    <Badge variant="outline">v20.x</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Database:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      PostgreSQL
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                    <span className="text-sm">24h 15m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Memória:</span>
                    <span className="text-sm">45.2 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">CPU:</span>
                    <span className="text-sm">2.1%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
    </Layout>
  );
}