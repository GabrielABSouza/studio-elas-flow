import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { useAgendaWeek } from '../hooks';
import { shiftDays, formatLocalDate, moneyFmt } from '../utils';

interface WeekGridProps {
  date: string;
}

export function WeekGrid({ date }: WeekGridProps) {
  const { professionals, appointments, weekStart, isLoading } = useAgendaWeek(date);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Gerar os 7 dias da semana
  const weekDays = Array.from({ length: 7 }, (_, i) => shiftDays(weekStart, i));
  
  // Agrupar agendamentos por dia
  const appointmentsByDay = appointments.reduce((acc, apt) => {
    const day = apt.startsAt.slice(0, 10);
    if (!acc[day]) acc[day] = [];
    acc[day].push(apt);
    return acc;
  }, {} as Record<string, typeof appointments>);

  const totalRevenue = appointments.reduce((sum, apt) => 
    sum + apt.procedures.reduce((procSum, proc) => procSum + proc.price, 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Métricas da Semana */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{appointments.length}</div>
                <div className="text-sm text-muted-foreground">Agendamentos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{moneyFmt.format(totalRevenue)}</div>
                <div className="text-sm text-muted-foreground">Receita Projetada</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round((appointments.length / (professionals.length * 7)) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Ocupação</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'scheduled').length}
                </div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid da Semana */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Visão Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-7">
            {weekDays.map((day) => {
              const dayAppointments = appointmentsByDay[day] || [];
              const dayRevenue = dayAppointments.reduce((sum, apt) => 
                sum + apt.procedures.reduce((procSum, proc) => procSum + proc.price, 0), 0
              );
              
              const dayOfWeek = new Date(day + 'T12:00:00').toLocaleDateString('pt-BR', { 
                weekday: 'short' 
              });
              const dayOfMonth = new Date(day + 'T12:00:00').getDate();
              
              return (
                <Card key={day} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-center">
                      <div className="font-bold">{dayOfWeek}</div>
                      <div className="text-lg">{dayOfMonth}</div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-center">
                      <Badge variant="secondary" className="w-full justify-center">
                        {dayAppointments.length} agendamentos
                      </Badge>
                      
                      {dayRevenue > 0 && (
                        <div className="text-sm font-medium text-green-600">
                          {moneyFmt.format(dayRevenue)}
                        </div>
                      )}
                      
                      {dayAppointments.length > 0 && (
                        <div className="space-y-1">
                          {dayAppointments.slice(0, 2).map((apt) => (
                            <div key={apt.id} className="text-xs text-muted-foreground truncate">
                              {apt.startsAt.slice(11, 16)} {apt.customer.name}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayAppointments.length - 2} mais
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}