import { Users, UserPlus, TrendingUp, Award, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Staff } from "@/types/staff";

interface StaffDashboardProps {
  staff: Staff[];
}

export function StaffDashboard({ staff }: StaffDashboardProps) {
  const totalStaff = staff.length;
  const activeStaff = staff.filter(member => member.isActive).length;
  const averageCommissionRate = staff.reduce((acc, member) => acc + member.commissionRate, 0) / staff.length || 0;
  
  const topPerformers = staff
    .filter(member => member.isActive)
    .sort((a, b) => b.commissionRate - a.commissionRate)
    .slice(0, 5);

  const roleDistribution = staff.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrador',
      esteticista: 'Esteticista',
      recepcionista: 'Recepcionista',
      assistente: 'Assistente'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants = {
      admin: 'destructive',
      esteticista: 'default',
      recepcionista: 'secondary',
      assistente: 'outline'
    };
    return variants[role as keyof typeof variants] || 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total da Equipe</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              {activeStaff} ativo{activeStaff !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Média Comissão</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{averageCommissionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Média da equipe
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Especializações</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {staff.reduce((acc, member) => acc + member.specializations.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de competências
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibilidade</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {Math.round((activeStaff / totalStaff) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Equipe disponível
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Overview and Role Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformers.length > 0 ? (
              <div className="space-y-4">
                {topPerformers.map((member, index) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-soft/30">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-card-foreground truncate">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getRoleLabel(member.role)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs font-bold">
                        {member.commissionRate}%
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        comissão
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum funcionário cadastrado ainda
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Função</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(roleDistribution).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(roleDistribution).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between p-3 rounded-lg bg-gradient-soft/30">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-card-foreground">
                        {getRoleLabel(role)}
                      </span>
                    </div>
                    <Badge variant={getRoleBadgeVariant(role) as any}>
                      {count} {count === 1 ? 'pessoa' : 'pessoas'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma função registrada ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}