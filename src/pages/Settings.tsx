import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Scissors, 
  Users, 
  Package, 
  Megaphone,
  Settings as SettingsIcon,
  Shield
} from "lucide-react";
import { PaymentMethodsList } from "@/features/settings/components/PaymentMethodsList";
import { ProceduresList } from "@/features/settings/components/ProceduresList";
import { ProfessionalMatrix } from "@/features/settings/components/ProfessionalMatrix";
import { CombosList } from "@/features/settings/components/CombosList";
import { ComingSoonTile } from "@/components/common/ComingSoonTile";

export default function Settings() {
  const [activeTab, setActiveTab] = React.useState("payment-methods");

  // Mock RBAC - In real app, this would come from auth context
  const userRole = "admin"; // admin, gestor, recepcao, profissional
  
  // RBAC Gates following specification
  const canManagePayments = ["admin", "gestor"].includes(userRole);
  const canManageProcedures = ["admin", "gestor"].includes(userRole);
  const canManageMatrix = ["admin", "gestor"].includes(userRole);
  const canManageCombos = ["admin", "gestor"].includes(userRole);
  const canManageRBAC = ["admin"].includes(userRole);

  // Permission gates for audit log
  const permissions = {
    'payments:update': canManagePayments,
    'procedures:update': canManageProcedures,
    'combos:update': canManageCombos,
    'matrix:update': canManageMatrix,
    'rbac:update': canManageRBAC,
  };

  const tabs = [
    {
      id: "payment-methods",
      label: "Pagamentos",
      icon: CreditCard,
      description: "Formas de pagamento e custos",
      enabled: canManagePayments,
      badge: null,
    },
    {
      id: "procedures",
      label: "Procedimentos",
      icon: Scissors,
      description: "Serviços e preços base",
      enabled: canManageProcedures,
      badge: null,
    },
    {
      id: "matrix",
      label: "Matriz",
      icon: Users,
      description: "Profissionais × Procedimentos",
      enabled: canManageMatrix,
      badge: null,
    },
    {
      id: "combos",
      label: "Combos",
      icon: Package,
      description: "Pacotes de serviços",
      enabled: canManageCombos,
      badge: null,
    },
    {
      id: "campaigns",
      label: "Campanhas",
      icon: Megaphone,
      description: "Promoções e descontos",
      enabled: canManageCombos,
      badge: "Em breve",
    },
    {
      id: "rbac",
      label: "Permissões",
      icon: Shield,
      description: "Papéis e acessos",
      enabled: canManageRBAC,
      badge: "Em breve",
    },
  ];

  const enabledTabs = tabs.filter(tab => tab.enabled);

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie procedimentos, pagamentos, equipe e promoções
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto p-1">
          {enabledTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-2 h-auto py-3 px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                disabled={!!tab.badge}
              >
                <div className="flex items-center gap-1">
                  <Icon className="h-4 w-4" />
                  {tab.badge && (
                    <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium">{tab.label}</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    {tab.description}
                  </div>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="payment-methods" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <PaymentMethodsList canManage={canManagePayments} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procedures" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <ProceduresList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <ProfessionalMatrix />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="combos" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <CombosList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <ComingSoonTile
            icon={Megaphone}
            title="Campanhas"
            subtitle="Campanhas promocionais e descontos especiais para fidelizar clientes e aumentar vendas"
            className="max-w-md mx-auto"
          />
        </TabsContent>

        <TabsContent value="rbac" className="space-y-6">
          <ComingSoonTile
            icon={Shield}
            title="Controle de Acesso"
            subtitle="Gestão de papéis e permissões de usuários para controle granular de funcionalidades"
            className="max-w-md mx-auto"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}