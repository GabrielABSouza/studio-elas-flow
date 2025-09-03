import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProfessionals, fetchAppointments, completeAppointment } from './api';
import { ISODate, Professional, Appointment, ProcedureCatalog } from './types';
import { shiftDays, getWeekStart, getMonthStart } from './utils';

// Query keys estáveis
export const agendaKeys = {
  all: ['agenda'] as const,
  professionals: () => [...agendaKeys.all, 'professionals'] as const,
  procedures: () => [...agendaKeys.all, 'procedures'] as const,
  day: (date: ISODate) => [...agendaKeys.all, 'day', date] as const,
  week: (weekStart: ISODate) => [...agendaKeys.all, 'week', weekStart] as const,
  month: (monthStart: ISODate) => [...agendaKeys.all, 'month', monthStart] as const,
};

export function useProfessionals() {
  return useQuery({
    queryKey: agendaKeys.professionals(),
    queryFn: fetchProfessionals,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useAgendaDay(date: ISODate) {
  const professionalsQuery = useProfessionals();
  
  const appointmentsQuery = useQuery({
    queryKey: agendaKeys.day(date),
    queryFn: () =>
      fetchAppointments({
        startDate: date,
        endDate: date,
      }),
    staleTime: 60 * 1000, // 1 minuto
  });

  return {
    professionals: professionalsQuery.data ?? [],
    appointments: appointmentsQuery.data ?? [],
    isLoading: professionalsQuery.isLoading || appointmentsQuery.isLoading,
    isError: professionalsQuery.isError || appointmentsQuery.isError,
    error: professionalsQuery.error || appointmentsQuery.error,
  };
}

export function useAgendaWeek(date: ISODate) {
  const weekStart = getWeekStart(date);
  const weekEnd = shiftDays(weekStart, 6);
  
  const professionalsQuery = useProfessionals();
  
  const appointmentsQuery = useQuery({
    queryKey: agendaKeys.week(weekStart),
    queryFn: () =>
      fetchAppointments({
        startDate: weekStart,
        endDate: weekEnd,
      }),
    staleTime: 60 * 1000,
  });

  return {
    professionals: professionalsQuery.data ?? [],
    appointments: appointmentsQuery.data ?? [],
    weekStart,
    weekEnd,
    isLoading: professionalsQuery.isLoading || appointmentsQuery.isLoading,
    isError: professionalsQuery.isError || appointmentsQuery.isError,
    error: professionalsQuery.error || appointmentsQuery.error,
  };
}

export function useAgendaMonth(date: ISODate) {
  const monthStart = getMonthStart(date);
  const year = parseInt(monthStart.slice(0, 4));
  const month = parseInt(monthStart.slice(5, 7));
  const monthEnd = new Date(year, month, 0).toISOString().slice(0, 10);
  
  const professionalsQuery = useProfessionals();
  
  const appointmentsQuery = useQuery({
    queryKey: agendaKeys.month(monthStart),
    queryFn: () =>
      fetchAppointments({
        startDate: monthStart,
        endDate: monthEnd,
      }),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  return {
    professionals: professionalsQuery.data ?? [],
    appointments: appointmentsQuery.data ?? [],
    monthStart,
    monthEnd,
    isLoading: professionalsQuery.isLoading || appointmentsQuery.isLoading,
    isError: professionalsQuery.isError || appointmentsQuery.isError,
    error: professionalsQuery.error || appointmentsQuery.error,
  };
}

// Hooks para catálogos
export function useProceduresCatalog() {
  return useQuery({
    queryKey: agendaKeys.procedures(),
    queryFn: async (): Promise<ProcedureCatalog[]> => {
      // Mock data - adapte para sua API
      return [
        { id: '1', name: 'Limpeza de Pele', defaultPrice: 80.00 },
        { id: '2', name: 'Hidratação Facial', defaultPrice: 60.00 },
        { id: '3', name: 'Design de Sobrancelhas', defaultPrice: 35.00 },
        { id: '4', name: 'Extensão de Cílios', defaultPrice: 120.00 },
        { id: '5', name: 'Microagulhamento', defaultPrice: 150.00 },
        { id: '6', name: 'Peeling Químico', defaultPrice: 100.00 },
        { id: '7', name: 'Drenagem Linfática', defaultPrice: 90.00 },
        { id: '8', name: 'Radiofrequência', defaultPrice: 110.00 },
      ];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useProfessionalsCatalog() {
  // Reutiliza o hook existente, mas retorna apenas id e name
  const { data: professionals = [], ...rest } = useProfessionals();
  
  return {
    data: professionals.map(p => ({ id: p.id, name: p.name })),
    ...rest,
  };
}

export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, data }: {
      appointmentId: string;
      data: { 
        items: Array<{ id: string; procedureId: string; name: string; price: number; qty: number; professionalId: string }>; 
        total: number; 
        paymentMethod: string 
      };
    }) => completeAppointment(appointmentId, data),
    onSuccess: () => {
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: agendaKeys.all });
    },
  });
}