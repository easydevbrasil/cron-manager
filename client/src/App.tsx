import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ApiKeyLogin } from "@/components/api-key-login";
import Dashboard from "@/pages/dashboard";
import TasksPage from "@/pages/tasks";
import LogsPage from "@/pages/logs";  
import WebhooksPage from "@/pages/webhooks";
import SettingsPage from "@/pages/settings";
import ApiDocs from "@/pages/api-docs";
import NotFound from "@/pages/not-found";

// Global API key store
let globalApiKey = "";

export function setGlobalApiKey(key: string) {
  globalApiKey = key;
  localStorage.setItem("cron_api_key", key);
}

export function getGlobalApiKey() {
  return globalApiKey || localStorage.getItem("cron_api_key") || "";
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/tasks" component={TasksPage} />
      <Route path="/logs" component={LogsPage} />
      <Route path="/webhooks" component={WebhooksPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/api-docs" component={ApiDocs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have a stored API key and validate it
    const storedKey = localStorage.getItem("cron_api_key");
    if (storedKey) {
      globalApiKey = storedKey;
      // Test the key
      fetch("/api/stats", {
        headers: { "X-API-Key": storedKey }
      })
      .then(response => {
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("cron_api_key");
          globalApiKey = "";
        }
      })
      .catch(() => {
        localStorage.removeItem("cron_api_key");
        globalApiKey = "";
      })
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (apiKey: string) => {
    setGlobalApiKey(apiKey);
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <ApiKeyLogin onLogin={handleLogin} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
