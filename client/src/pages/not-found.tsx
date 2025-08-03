import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <Layout title="Página Não Encontrada" description="A página que você procura não existe">
      <div className="flex items-center justify-center min-h-64">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">404 - Página Não Encontrada</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              A página que você está procurando não existe ou foi movida.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              <i className="fas fa-home mr-2"></i>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
