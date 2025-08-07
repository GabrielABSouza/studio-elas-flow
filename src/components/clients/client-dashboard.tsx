import { Users, UserPlus, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/types/client";

interface ClientDashboardProps {
  clients: Client[];
}

export function ClientDashboard({ clients }: ClientDashboardProps) {
  const totalClients = clients.length;
  const newClientsThisMonth = clients.filter(client => {
    const clientDate = new Date(client.createdAt);
    const now = new Date();
    return clientDate.getMonth() === now.getMonth() && clientDate.getFullYear() === now.getFullYear();
  }).length;

  const clientsWithBirthdayThisMonth = clients.filter(client => {
    if (!client.birthDate) return false;
    const birthMonth = new Date(client.birthDate).getMonth();
    const currentMonth = new Date().getMonth();
    return birthMonth === currentMonth;
  }).length;

  const recentClients = clients
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const topPreferences = clients
    .flatMap(client => client.preferences || [])
    .reduce((acc, preference) => {
      acc[preference] = (acc[preference] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const sortedPreferences = Object.entries(topPreferences)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Base completa de clientes
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novas este Mês</CardTitle>
            <UserPlus className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{newClientsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {newClientsThisMonth > 0 ? `+${((newClientsThisMonth / totalClients) * 100).toFixed(1)}%` : "Sem crescimento"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aniversários</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{clientsWithBirthdayThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Aniversariantes este mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalClients > 0 ? "+12%" : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              Comparado ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clients and Top Preferences */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Clientes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentClients.length > 0 ? (
              <div className="space-y-4">
                {recentClients.map((client) => (
                  <div key={client.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-soft/30">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-card-foreground truncate">
                        {client.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {client.preferences && client.preferences.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {client.preferences.length} pref.
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma cliente cadastrada ainda
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tratamentos Mais Procurados</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedPreferences.length > 0 ? (
              <div className="space-y-3">
                {sortedPreferences.map(([preference, count], index) => (
                  <div key={preference} className="flex items-center justify-between p-3 rounded-lg bg-gradient-soft/30">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-card-foreground">
                        {preference}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {count} {count === 1 ? 'cliente' : 'clientes'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma preferência registrada ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}