import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiKeyLoginProps {
  onLogin: (apiKey: string) => void;
}

export function ApiKeyLogin({ onLogin }: ApiKeyLoginProps) {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!apiKey.trim()) {
      setError("Por favor, insira uma chave API");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Test API key by making a simple request
      const response = await fetch("/api/stats", {
        headers: {
          "X-API-Key": apiKey.trim()
        }
      });

      if (response.ok) {
        onLogin(apiKey.trim());
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Chave API inválida");
      }
    } catch (error) {
      setError("Erro de conexão. Verifique se o servidor está rodando.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-clock text-primary-foreground text-2xl"></i>
          </div>
          <CardTitle className="text-2xl">Cron Manager</CardTitle>
          <CardDescription>
            Insira sua chave API para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Chave API</label>
            <Input
              type="password"
              placeholder="Sua chave API..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleLogin} 
            disabled={isLoading || !apiKey.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Verificando...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i>
                Acessar Sistema
              </>
            )}
          </Button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Precisa de uma chave API?</p>
            <p className="mt-1">Contate o administrador do sistema</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}