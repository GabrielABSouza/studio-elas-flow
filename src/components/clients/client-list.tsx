import { useState } from "react";
import { Search, Plus, Phone, Mail, Calendar, MoreVertical, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      {/* Header with search and add button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onNewClient} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Cliente
        </Button>
      </div>

      {/* Clients grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card
            key={client.id}
            className="cursor-pointer transition-all hover:shadow-elegant hover:scale-[1.02] group"
            onClick={() => onClientSelect(client)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-soft text-primary font-semibold">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                      {client.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </div>
                    {client.email && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </div>
                    )}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onClientSelect(client);
                    }}>
                      Ver Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onEditClient(client);
                    }}>
                      Editar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Cliente desde {formatDate(client.createdAt)}
                </div>
                
                {client.preferences && client.preferences.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {client.preferences.length} preferências
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
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