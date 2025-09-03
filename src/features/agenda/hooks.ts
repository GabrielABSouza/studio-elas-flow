import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProfessionals, fetchAppointments, completeAppointment } from './api';
import { ISODate, Professional, Appointment } from './types';
import { shiftDays, getWeekStart, getMonthStart } from './utils';

// Query keys estáveis
export const agendaKeys = {
  all: ['agenda'] as const,
  professionals: () => [...agendaKeys.all, 'professionals'] as const,
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

export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, data }: {
      appointmentId: string;
      data: { 
        items: Array<{ procedureId: string; name: string; price: number; quantity: number; professionalId: string }>; 
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