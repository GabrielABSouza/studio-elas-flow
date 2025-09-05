import { Outlet, useLocation } from "react-router-dom";
import { Settings as SettingsIcon } from "lucide-react";

const sectionTitles: Record<string, string> = {
  procedimentos: "Procedimentos",
  matriz: "Matriz Profissionais × Procedimentos", 
  pagamentos: "Pagamentos & Comissão",
  combos: "Combos e Campanhas",
  operacao: "Operação",
  permissoes: "Permissões"
};

export default function ConfigLayout() {
  const location = useLocation();
  const segment = location.pathname.split('/')[2]; // /config/procedimentos -> procedimentos
  const sectionTitle = sectionTitles[segment] || "Configurações";

  return (
    <div className="container mx-auto py-6">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">
              {segment ? `${sectionTitle}` : "Configurações do sistema"}
            </p>
          </div>
        </div>
      </div>

      {/* Page content */}
      <Outlet />
    </div>
  );
}