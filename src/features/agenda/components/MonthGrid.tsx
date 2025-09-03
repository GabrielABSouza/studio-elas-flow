import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Grid3x3, Calendar } from 'lucide-react';
import { useAgendaMonth } from '../hooks';
import { parseISODate, formatLocalDate, moneyFmt } from '../utils';

interface MonthGridProps {
  date: string;
}

export function MonthGrid({ date }: MonthGridProps) {
  const { appointments, monthStart, isLoading } = useAgendaMonth(date);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded" />
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-2 mb-2">
                {[...Array(7)].map((_, j) => (
                  <div key={j} className="h-24 bg-muted rounded" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular o calendário do mês
  const startDate = parseISODate(monthStart);
  const year = startDate.getFullYear();
  const month = startDate.getMonth();
  
  // Primeiro dia do mês
  const firstDayOfMonth = new Date(year, month, 1);
  // Último dia do mês
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Primeira segunda-feira a mostrar (pode ser do mês anterior)
  const firstMonday = new Date(firstDayOfMonth);
  const dayOfWeek = firstDayOfMonth.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  firstMonday.setDate(firstDayOfMonth.getDate() - daysToSubtract);
  
  // Gerar todas as datas do calendário (6 semanas = 42 dias)
  const calendarDays: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const day = new Date(firstMonday);
    day.setDate(firstMonday.getDate() + i);
    calendarDays.push(day);
  }

  // Agrupar agendamentos por dia
  const appointmentsByDay = appointments.reduce((acc, apt) => {
    const day = apt.startsAt.slice(0, 10);
    if (!acc[day]) acc[day] = [];
    acc[day].push(apt);
    return acc;
  }, {} as Record<string, typeof appointments>);

  const monthName = firstDayOfMonth.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 capitalize">
          <Grid3x3 className="h-5 w-5" />
          {monthName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Header dos dias da semana */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center font-semibold text-sm py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Grid do calendário - 6 semanas */}
          {Array.from({ length: 6 }, (_, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day) => {
                const dayString = formatLocalDate(day);
                const dayAppointments = appointmentsByDay[dayString] || [];
                const isCurrentMonth = day.getMonth() === month;
                const isToday = dayString === formatLocalDate(new Date());
                
                const dayRevenue = dayAppointments.reduce((sum, apt) => 
                  sum + apt.procedures.reduce((procSum, proc) => procSum + proc.price, 0), 0
                );

                return (
                  <div
                    key={dayString}
                    className={`
                      min-h-[100px] p-2 border rounded-lg transition-all duration-200
                      ${isCurrentMonth ? 'bg-background hover:bg-muted/50' : 'bg-muted/20 text-muted-foreground'}
                      ${isToday ? 'ring-2 ring-primary shadow-sm' : 'hover:shadow-sm'}
                    `}
                  >
                    <div className={`
                      text-sm font-medium mb-1
                      ${isToday ? 'text-primary font-bold' : ''}
                    `}>
                      {day.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayAppointments.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {dayAppointments.length}
                        </Badge>
                      )}
                      
                      {dayRevenue > 0 && (
                        <div className="text-xs text-green-600 font-medium">
                          {moneyFmt.format(dayRevenue)}
                        </div>
                      )}
                      
                      {dayAppointments.slice(0, 1).map((apt) => (
                        <div key={apt.id} className="text-xs truncate" title={apt.customer.name}>
                          {apt.startsAt.slice(11, 16)} {apt.customer.name}
                        </div>
                      ))}
                      
                      {dayAppointments.length > 1 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayAppointments.length - 1}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Resumo do mês */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{appointments.length}</div>
                <div className="text-sm text-muted-foreground">Total de Agendamentos</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {moneyFmt.format(appointments.reduce((sum, apt) => 
                    sum + apt.procedures.reduce((procSum, proc) => procSum + proc.price, 0), 0
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">Receita Projetada</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {appointments.length > 0 
                    ? Math.round((appointments.reduce((sum, apt) => 
                        sum + apt.procedures.reduce((procSum, proc) => procSum + proc.price, 0), 0
                      ) / appointments.length))
                    : 0
                  }
                </div>
                <div className="text-sm text-muted-foreground">Ticket Médio (R$)</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}