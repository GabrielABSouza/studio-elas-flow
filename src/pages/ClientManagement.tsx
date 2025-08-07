import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ClientList } from "@/components/clients/client-list";
import { ClientForm } from "@/components/clients/client-form";
import { ClientDashboard } from "@/components/clients/client-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Client } from "@/types/client";
import { Plus, Users, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration
const mockClients: Client[] = [
  {
    id: "1",
    name: "Maria Silva Santos",
    email: "maria.silva@email.com",
    phone: "(11) 99999-1234",
    birthDate: "1985-03-15",
    address: {
      street: "Rua das Flores, 123",
      city: "São Paulo",
      zipCode: "01234-567",
      state: "SP"
    },
    preferences: ["Limpeza de Pele", "Hidratação Facial", "Design de Sobrancelhas"],
    notes: "Pele sensível, alergia a ácido salicílico",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    name: "Ana Carolina Lima",
    email: "ana.lima@email.com",
    phone: "(11) 98888-5678",
    birthDate: "1992-07-22",
    address: {
      street: "Av. Paulista, 456",
      city: "São Paulo",
      zipCode: "01310-100",
      state: "SP"
    },
    preferences: ["Extensão de Cílios", "Microagulhamento"],
    notes: "Prefere horários pela manhã",
    createdAt: "2024-02-01T14:30:00Z",
    updatedAt: "2024-02-01T14:30:00Z"
  },
  {
    id: "3",
    name: "Juliana Oliveira",
    email: "ju.oliveira@email.com",
    phone: "(11) 97777-9012",
    birthDate: "1990-12-08",
    preferences: ["Drenagem Linfática", "Radiofrequência", "Peeling"],
    notes: "Cliente VIP, muito pontual",
    createdAt: "2024-02-28T09:15:00Z",
    updatedAt: "2024-02-28T09:15:00Z"
  }
];

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  const handleNewClient = () => {
    setEditingClient(null);
    setIsFormOpen(true);
    setActiveTab("form");
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
    setActiveTab("form");
  };

  const handleSaveClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingClient) {
      // Update existing client
      const updatedClient: Client = {
        ...editingClient,
        ...clientData,
        updatedAt: new Date().toISOString()
      };
      setClients(prev => prev.map(c => c.id === editingClient.id ? updatedClient : c));
      toast({
        title: "Cliente atualizada!",
        description: "Os dados da cliente foram atualizados com sucesso.",
      });
    } else {
      // Create new client
      const newClient: Client = {
        ...clientData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setClients(prev => [newClient, ...prev]);
      toast({
        title: "Cliente cadastrada!",
        description: "Nova cliente foi adicionada ao sistema.",
      });
    }
    
    setIsFormOpen(false);
    setEditingClient(null);
    setActiveTab("clients");
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingClient(null);
    setActiveTab("clients");
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <PageHeader
        title="Gerenciamento de Clientes"
        description="Gerencie todas as informações das suas clientes em um só lugar"
      >
        <Button onClick={handleNewClient} className="gap-2 shadow-elegant">
          <Plus className="h-4 w-4" />
          Nova Cliente
        </Button>
      </PageHeader>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4" />
              Clientes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ClientDashboard clients={clients} />
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <ClientList
              clients={clients}
              onClientSelect={setSelectedClient}
              onNewClient={handleNewClient}
              onEditClient={handleEditClient}
            />
          </TabsContent>

          {isFormOpen && (
            <TabsContent value="form" className="space-y-6">
              <ClientForm
                client={editingClient}
                onSave={handleSaveClient}
                onCancel={handleCancelForm}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}