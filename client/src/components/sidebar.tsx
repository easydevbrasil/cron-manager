import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const menuItems = [
    {
      href: "/",
      icon: "fas fa-th-large",
      label: "Dashboard",
      isActive: location === "/"
    },
    {
      href: "/tasks",
      icon: "fas fa-tasks",
      label: "Tarefas Cron",
      isActive: location === "/tasks"
    },
    {
      href: "/logs",
      icon: "fas fa-history",
      label: "Logs de Atividade",
      isActive: location === "/logs"
    },
    {
      href: "/webhooks",
      icon: "fas fa-link",
      label: "Webhooks",
      isActive: location === "/webhooks"
    }
  ];

  const configItems = [
    {
      href: "/api-docs",
      icon: "fas fa-code",
      label: "API & Docs"
    },
    {
      href: "/settings",
      icon: "fas fa-cog",
      label: "Configurações"
    }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700 hidden lg:block">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-clock text-primary-foreground text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cron Manager</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sistema de Tarefas</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-6 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Menu Principal
          </p>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    item.isActive
                      ? "text-primary bg-primary/10"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <i className={cn(item.icon, "mr-3", item.isActive ? "text-primary" : "text-gray-400")}></i>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Configurações
          </p>
          <ul className="space-y-1">
            {configItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className={cn(item.icon, "mr-3 text-gray-400")}></i>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="px-6 mt-8">
          <button
            onClick={() => {
              localStorage.removeItem("cron_api_key");
              window.location.reload();
            }}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <i className="fas fa-sign-out-alt mr-3"></i>
            Sair do Sistema
          </button>
        </div>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <i className="fas fa-user text-primary-foreground text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Administrador</p>
            <p className="text-xs text-gray-500">Sistema Ativo</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
