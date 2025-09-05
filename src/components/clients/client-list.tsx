import { useState } from "react";
import { Search, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerCard } from "@/features/customers/components/CustomerCard";
import { Client } from "@/types/client";

interface ClientListProps {
  clients: Client[];
  onClientSelect: (client: Client) => void;
  onNewClient: () => void;
  onEditClient: (client: Client) => void;
}

export function ClientList({ clients, onClientSelect, onNewClient, onEditClient }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="space-y-6">
      {/* Header with search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Clients grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <CustomerCard
            key={client.id}
            id={client.id}
            name={client.name}
            phone={client.phone}
            email={client.email}
            since={client.createdAt}
            preferencesCount={client.preferences?.length}
          />
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 rounded-full bg-gradient-soft flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? "Nenhuma cliente encontrada" : "Nenhuma cliente cadastrada"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? "Tente ajustar sua busca ou cadastre uma nova cliente."
              : "Comece cadastrando sua primeira cliente no sistema."
            }
          </p>
          <Button onClick={onNewClient} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Cliente
          </Button>
        </div>
      )}
    </div>
  );
}