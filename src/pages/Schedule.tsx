import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, CalendarDays, Users, MapPin } from "lucide-react";
import { Appointment, CalendarView } from "@/types/appointment";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, getDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockAppointments: Appointment[] = [
  {
    id: "1",
    clientId: "1",
    clientName: "Maria Silva Santos",
    staffId: "1",
    staffName: "Dr. Ana Paula Silva",
    serviceName: "Harmonização Facial",
    date: "2024-01-22",
    startTime: "09:00",
    endTime: "10:30",
    duration: 90,
    status: "confirmado",
    price: 450,
    notes: "Primeira sessão",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    clientId: "2",
    clientName: "Ana Carolina Lima",
    staffId: "3",
    staffName: "Juliana Santos",
    serviceName: "Limpeza de Pele",
    date: "2024-01-22",
    startTime: "14:00",
    endTime: "15:00",
    duration: 60,
    status: "agendado",
    price: 120,
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-20T14:30:00Z"
  },
  {
    id: "3",
    clientId: "3",
    clientName: "Juliana Oliveira",
    staffId: "1",
    staffName: "Dr. Ana Paula Silva",
    serviceName: "Preenchimento Labial",
    date: "2024-01-23",
    startTime: "10:00",
    endTime: "11:00",
    duration: 60,
    status: "confirmado",
    price: 350,
    createdAt: "2024-01-21T09:15:00Z",
    updatedAt: "2024-01-21T09:15:00Z"
  },
  {
    id: "4",
    clientId: "1",
    clientName: "Maria Silva Santos",
    staffId: "3",
    staffName: "Juliana Santos",
    serviceName: "Design de Sobrancelhas",
    date: "2024-01-24",
    startTime: "16:00",
    endTime: "16:45",
    duration: 45,
    status: "agendado",
    price: 80,
    createdAt: "2024-01-22T10:00:00Z",
    updatedAt: "2024-01-22T10:00:00Z"
  }
];

const statusColors = {
  agendado: "bg-blue-100 text-blue-800 border-blue-200",
  confirmado: "bg-green-100 text-green-800 border-green-200",
  em_andamento: "bg-yellow-100 text-yellow-800 border-yellow-200",
  concluido: "bg-purple-100 text-purple-800 border-purple-200",
  cancelado: "bg-red-100 text-red-800 border-red-200",
  nao_compareceu: "bg-gray-100 text-gray-800 border-gray-200"
};

const statusLabels = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
  nao_compareceu: "Não Compareceu"
};

export default function Schedule() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();

  const handleNewAppointment = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de novo agendamento em breve.",
    });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.date), date)
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Header */}
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
          <div key={day} className="p-3 text-center font-medium text-muted-foreground border-b">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {days.map(day => {
          const dayAppointments = getAppointmentsForDate(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          return (
            <div
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`
                min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all duration-200
                ${isCurrentMonth ? 'bg-background' : 'bg-muted/20'}
                ${isToday ? 'ring-2 ring-primary shadow-elegant' : ''}
                ${isSelected ? 'bg-primary/5 border-primary/20' : 'border-border hover:border-primary/20'}
                hover:shadow-soft
              `}
            >
              <div className={`
                text-sm font-medium mb-1
                ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                ${isToday ? 'text-primary font-bold' : ''}
              `}>
                {format(day, "d")}
              </div>
              
              <div className="space-y-1">
                {dayAppointments.slice(0, 2).map(appointment => (
                  <div
                    key={appointment.id}
                    className="text-xs p-1 rounded bg-gradient-primary text-white truncate shadow-sm"
                    title={`${appointment.startTime} - ${appointment.clientName} (${appointment.serviceName})`}
                  >
                    {appointment.startTime} {appointment.clientName}
                  </div>
                ))}
                {dayAppointments.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayAppointments.length - 2} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const selectedDay = selectedDate || new Date();
    const dayAppointments = getAppointmentsForDate(selectedDay).sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-semibold">
            {format(selectedDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h3>
          <p className="text-muted-foreground">
            {dayAppointments.length} agendamento{dayAppointments.length !== 1 ? 's' : ''} hoje
          </p>
        </div>

        {dayAppointments.length === 0 ? (
          <Card className="text-center py-12 border-dashed">
            <CardContent>
              <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum agendamento</h3>
              <p className="text-muted-foreground mb-6">
                Não há agendamentos para este dia.
              </p>
              <Button onClick={handleNewAppointment} className="shadow-elegant">
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {dayAppointments.map(appointment => (
              <Card key={appointment.id} className="shadow-soft hover:shadow-elegant transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex flex-col items-center gap-1">
                        <Clock className="h-5 w-5 text-primary" />
                        <div className="text-sm font-medium">{appointment.startTime}</div>
                        <div className="text-xs text-muted-foreground">{appointment.endTime}</div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{appointment.clientName}</h4>
                          <Badge className={statusColors[appointment.status]}>
                            {statusLabels[appointment.status]}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>🎨</span>
                            <span>{appointment.serviceName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{appointment.staffName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.duration} minutos</span>
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <div className="mt-2 text-sm text-muted-foreground italic">
                            "{appointment.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        R$ {appointment.price.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <PageHeader
        title="Agenda"
        description="Gerencie todos os agendamentos e horários do seu studio"
      >
        <Button onClick={handleNewAppointment} className="gap-2 shadow-elegant">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </PageHeader>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Calendar Controls */}
          <Card className="shadow-soft">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreviousMonth}
                    className="hover:bg-primary/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <CardTitle className="text-xl">
                    {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                  </CardTitle>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextMonth}
                    className="hover:bg-primary/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <Tabs value={view} onValueChange={(value) => setView(value as CalendarView)}>
                  <TabsList>
                    <TabsTrigger value="month">Mês</TabsTrigger>
                    <TabsTrigger value="day">Dia</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            
            <CardContent>
              {view === "month" && renderMonthView()}
              {view === "day" && renderDayView()}
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="text-center border-primary/20 shadow-soft">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  {getAppointmentsForDate(new Date()).length}
                </div>
                <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-primary/20 shadow-soft">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  R$ {getAppointmentsForDate(new Date()).reduce((sum, apt) => sum + apt.price, 0).toLocaleString('pt-BR')}
                </div>
                <p className="text-sm text-muted-foreground">Faturamento Hoje</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-primary/20 shadow-soft">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  {appointments.filter(apt => apt.status === 'confirmado').length}
                </div>
                <p className="text-sm text-muted-foreground">Confirmados</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}