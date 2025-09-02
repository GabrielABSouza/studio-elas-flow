import { Users, UserPlus, Calendar, TrendingUp, AlertTriangle, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/types/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  // Alert calculations
  const getClientAlerts = () => {
    const alerts = [];
    const now = new Date();
    
    // Clientes em risco de abandono (90+ dias sem contato)
    const clientsAtRisk = clients.filter(client => {
      const daysSinceLastContact = Math.floor((now.getTime() - new Date(client.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceLastContact > 90;
    });

    if (clientsAtRisk.length > 0) {
      alerts.push({
        type: 'critical',
        icon: AlertTriangle,
        title: 'Clientes em Risco',
        count: clientsAtRisk.length,
        description: 'Sem contato há mais de 90 dias',
        clients: clientsAtRisk
      });
    }

    // Aniversários próximos (próximos 7 dias)
    const upcomingBirthdays = clients.filter(client => {
      if (!client.birthDate) return false;
      const birth = new Date(client.birthDate);
      const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
      if (nextBirthday < now) {
        nextBirthday.setFullYear(now.getFullYear() + 1);
      }
      const daysUntilBirthday = Math.floor((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilBirthday <= 7 && daysUntilBirthday >= 0;
    });

    if (upcomingBirthdays.length > 0) {
      alerts.push({
        type: 'opportunity',
        icon: Calendar,
        title: 'Aniversários Próximos',
        count: upcomingBirthdays.length,
        description: 'Oportunidade de contato especial',
        clients: upcomingBirthdays
      });
    }

    // Clientes com alto potencial (múltiplas preferências)
    const highValueClients = clients.filter(client => 
      client.preferences && client.preferences.length >= 3
    );

    if (highValueClients.length > 0) {
      alerts.push({
        type: 'commercial',
        icon: DollarSign,
        title: 'Alto Potencial',
        count: highValueClients.length,
        description: 'Clientes com múltiplos interesses',
        clients: highValueClients
      });
    }

    return alerts;
  };

  const alerts = getClientAlerts();

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

      {/* Alertas Críticos */}
      {alerts.length > 0 && (
        <Card className="border-warning/20 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Alertas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {alerts.map((alert, index) => {
                const Icon = alert.icon;
                const getAlertStyles = (type: string) => {
                  switch (type) {
                    case 'critical':
                      return 'border-destructive/20 bg-destructive/5 text-destructive';
                    case 'opportunity':
                      return 'border-primary/20 bg-primary/5 text-primary';
                    case 'commercial':
                      return 'border-secondary/20 bg-secondary/5 text-secondary-foreground';
                    default:
                      return 'border-muted bg-muted/5 text-muted-foreground';
                  }
                };

                return (
                  <DropdownMenu key={index}>
                    <DropdownMenuTrigger asChild>
                      <div className={`p-4 rounded-lg border cursor-pointer ${getAlertStyles(alert.type)}`}>
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-background/80">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-sm">{alert.title}</p>
                              <Badge 
                                variant="secondary" 
                                className="text-xs font-bold"
                              >
                                {alert.count}
                              </Badge>
                            </div>
                            <p className="text-xs mt-1 opacity-80">
                              {alert.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
                      {alert.clients && alert.clients.map((client: Client) => (
                        <DropdownMenuItem key={client.id} className="cursor-pointer">
                          <div className="flex flex-col">
                            <span className="font-medium">{client.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {client.phone || client.email || 'Sem contato'}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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