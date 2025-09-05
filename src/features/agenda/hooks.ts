import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchProfessionals, 
  fetchAppointments, 
  completeAppointment,
  fetchProcedures,
  searchClients,
  createAppointment,
  getAppointment,
  confirmAppointment,
  cancelAppointment,
  updateAppointment,
  type Client,
  type Procedure
} from './api';
import { ISODate, Professional, Appointment } from './types';
import { shiftDays, getWeekStart, getMonthStart } from './utils';

// Query keys estáveis
export const agendaKeys = {
  all: ['agenda'] as const,
  professionals: () => [...agendaKeys.all, 'professionals'] as const,
  procedures: () => [...agendaKeys.all, 'procedures'] as const,
  clients: (query: string) => [...agendaKeys.all, 'clients', query] as const,
  appointments: (id: string) => [...agendaKeys.all, 'appointments', id] as const,
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

// Hooks para catálogos e busca de clientes
export function useProceduresCatalog() {
  return useQuery({
    queryKey: agendaKeys.procedures(),
    queryFn: fetchProcedures,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useProfessionalsCatalog() {
  const { data: professionals = [], ...rest } = useProfessionals();
  
  return {
    data: professionals.map(p => ({ id: p.id, name: p.name })),
    ...rest,
  };
}

export function useClientsSearch(query: string) {
  return useQuery({
    queryKey: agendaKeys.clients(query),
    queryFn: () => searchClients(query),
    enabled: query.trim().length > 1,
    staleTime: 30 * 1000, // 30 segundos
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      // Invalidar todos os caches de agendamentos
      queryClient.invalidateQueries({ queryKey: agendaKeys.all });
    },
  });
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

export function useAppointment(appointmentId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: agendaKeys.appointments(appointmentId || ''),
    queryFn: () => getAppointment(appointmentId!),
    enabled: !!appointmentId && (options?.enabled !== false),
    staleTime: 30 * 1000, // 30 segundos
  });
}

export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agendaKeys.all });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, ...data }: {
      appointmentId: string;
      reason: string;
      notes?: string;
      notifyClient?: boolean;
      notifyProfessional?: boolean;
    }) => cancelAppointment(appointmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agendaKeys.all });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, ...data }: {
      appointmentId: string;
      clientId?: string;
      clientName: string;
      clientPhone?: string;
      professionalId: string;
      startISO: string;
      endISO: string;
      items: Array<{
        procedureId: string;
        professionalId: string;
        qty: number;
      }>;
    }) => updateAppointment(appointmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agendaKeys.all });
    },
  });
}