import { useQuery } from "@tanstack/react-query";
import { Client } from "@/types/client";

export type Cohort =
  | 'all'
  | 'new_this_month'
  | 'birthdays_this_month'
  | 'risk'
  | 'high_potential'
  | 'growth_3months';

interface CustomerFilters {
  createdBetween?: { from: Date; to: Date };
  birthdayMonth?: number;
  risk?: boolean;
  highPotential?: boolean;
}

interface CustomersListParams {
  page?: number;
  q?: string;
  filters?: CustomerFilters;
  cohort?: Cohort;
}

// Mock data - In a real app, this would come from an API
const mockClients: Client[] = [
  {
    id: "1",
    name: "Maria Silva Santos",
    email: "maria.silva@email.com",
    phone: "(11) 99999-1234",
    birthDate: "1985-09-15",
    address: {
      street: "Rua das Flores, 123",
      city: "São Paulo",
      zipCode: "01234-567",
      state: "SP"
    },
    preferences: ["Limpeza de Pele", "Hidratação Facial", "Design de Sobrancelhas"],
    notes: "Pele sensível, alergia a ácido salicílico",
    createdAt: "2024-07-15T10:00:00Z",
    updatedAt: "2024-07-15T10:00:00Z"
  },
  {
    id: "2",
    name: "Ana Carolina Lima",
    email: "ana.lima@email.com",
    phone: "(11) 98888-5678",
    birthDate: "1992-09-22",
    address: {
      street: "Av. Paulista, 456",
      city: "São Paulo",
      zipCode: "01310-100",
      state: "SP"
    },
    preferences: ["Extensão de Cílios", "Microagulhamento"],
    notes: "Prefere horários pela manhã",
    createdAt: "2024-08-01T14:30:00Z",
    updatedAt: "2024-08-01T14:30:00Z"
  },
  {
    id: "3",
    name: "Juliana Oliveira",
    email: "ju.oliveira@email.com",
    phone: "(11) 97777-9012",
    birthDate: "1990-12-08",
    preferences: ["Drenagem Linfática", "Radiofrequência", "Peeling"],
    notes: "Cliente VIP, muito pontual",
    createdAt: "2024-05-28T09:15:00Z",
    updatedAt: "2024-05-28T09:15:00Z"
  },
  {
    id: "4",
    name: "Camila Santos",
    email: "camila@email.com",
    phone: "(11) 97777-1111",
    birthDate: "1988-09-10",
    preferences: ["Massagem Relaxante", "Limpeza de Pele"],
    notes: "Cliente nova, interesse em tratamentos faciais",
    createdAt: "2024-09-01T15:00:00Z",
    updatedAt: "2024-09-01T15:00:00Z"
  },
  {
    id: "5",
    name: "Fernanda Costa",
    email: "fernanda@email.com",
    phone: "(11) 97777-2222",
    birthDate: "1993-03-05",
    preferences: ["Botox", "Preenchimento"],
    notes: "Sem contato há mais de 90 dias",
    createdAt: "2024-06-01T10:00:00Z",
    updatedAt: "2024-06-01T10:00:00Z"
  },
  {
    id: "6",
    name: "Patricia Almeida",
    email: "patricia@email.com",
    phone: "(11) 97777-3333",
    birthDate: "1995-04-12",
    preferences: ["Depilação", "Limpeza de Pele", "Hidratação", "Massagem"],
    notes: "Cliente com múltiplos interesses",
    createdAt: "2024-08-15T11:00:00Z",
    updatedAt: "2024-08-15T11:00:00Z"
  }
];

// Mock appointments data for customer profile
const mockAppointments = [
  {
    id: "1",
    customerId: "1",
    date: "2024-03-15T10:00:00Z",
    status: "completed" as const,
    procedures: ["Limpeza de Pele"],
    professional: "Dra. Ana",
    total: 120.00
  },
  {
    id: "2", 
    customerId: "1",
    date: "2024-02-15T14:30:00Z",
    status: "completed" as const,
    procedures: ["Hidratação Facial"],
    professional: "Dra. Ana",
    total: 80.00
  },
  {
    id: "3",
    customerId: "2",
    date: "2024-03-10T09:00:00Z", 
    status: "confirmed" as const,
    procedures: ["Extensão de Cílios"],
    professional: "Dra. Carla",
    total: 150.00
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      await delay(800); // Simulate loading
      
      const customer = mockClients.find(client => client.id === id);
      if (!customer) {
        throw new Error('Cliente não encontrado');
      }
      
      return customer;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

export const useCustomerAppointments = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-appointments', customerId],
    queryFn: async () => {
      await delay(600);
      
      return mockAppointments
        .filter(apt => apt.customerId === customerId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!customerId,
  });
};

// Helper functions for filtering
const filterClientsByCohort = (clients: Client[], cohort: Cohort, filters?: CustomerFilters) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const currentMonth = now.getMonth();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

  let filtered = [...clients];

  // Apply cohort-based filtering
  switch (cohort) {
    case 'new_this_month':
      filtered = filtered.filter(client => {
        const createdDate = new Date(client.createdAt);
        return createdDate >= startOfMonth && createdDate <= endOfMonth;
      });
      break;
    
    case 'birthdays_this_month':
      filtered = filtered.filter(client => {
        if (!client.birthDate) return false;
        const birthMonth = new Date(client.birthDate).getMonth();
        return birthMonth === currentMonth;
      });
      break;
    
    case 'risk':
      filtered = filtered.filter(client => {
        const daysSinceCreated = Math.floor((now.getTime() - new Date(client.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceCreated > 90 || client.notes?.includes('Sem contato há mais de 90 dias');
      });
      break;
    
    case 'high_potential':
      filtered = filtered.filter(client => 
        client.preferences && client.preferences.length >= 3
      );
      break;
    
    case 'growth_3months':
      filtered = filtered.filter(client => {
        const createdDate = new Date(client.createdAt);
        return createdDate >= threeMonthsAgo;
      });
      break;
    
    case 'all':
    default:
      // No additional filtering needed
      break;
  }

  // Apply additional filters
  if (filters) {
    if (filters.createdBetween) {
      filtered = filtered.filter(client => {
        const createdDate = new Date(client.createdAt);
        return createdDate >= filters.createdBetween!.from && createdDate <= filters.createdBetween!.to;
      });
    }

    if (filters.birthdayMonth !== undefined) {
      filtered = filtered.filter(client => {
        if (!client.birthDate) return false;
        const birthMonth = new Date(client.birthDate).getMonth();
        return birthMonth === filters.birthdayMonth;
      });
    }

    if (filters.risk !== undefined) {
      filtered = filtered.filter(client => {
        const daysSinceCreated = Math.floor((now.getTime() - new Date(client.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const isAtRisk = daysSinceCreated > 90 || client.notes?.includes('Sem contato há mais de 90 dias');
        return filters.risk ? isAtRisk : !isAtRisk;
      });
    }

    if (filters.highPotential !== undefined) {
      filtered = filtered.filter(client => {
        const hasHighPotential = client.preferences && client.preferences.length >= 3;
        return filters.highPotential ? hasHighPotential : !hasHighPotential;
      });
    }
  }

  return filtered;
};

export const useCustomersList = (params: CustomersListParams = {}) => {
  const { page = 1, q = '', filters, cohort = 'all' } = params;
  
  return useQuery({
    queryKey: ['customers-list', { page, q, filters, cohort }],
    queryFn: async () => {
      await delay(400);
      
      let filtered = filterClientsByCohort(mockClients, cohort, filters);
      
      // Apply search filter
      if (q) {
        filtered = filtered.filter(client =>
          client.name.toLowerCase().includes(q.toLowerCase()) ||
          client.phone.includes(q) ||
          client.email?.toLowerCase().includes(q.toLowerCase())
        );
      }

      // Sort by creation date (newest first)
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // For this mock, return all results (in real app, implement pagination)
      return {
        data: filtered,
        totalCount: filtered.length,
        hasNextPage: false,
        currentPage: page
      };
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
};

interface GrowthDataPoint {
  x: string;
  value: number;
  date: Date;
}

interface GrowthTotals {
  thisMonth: number;
  prevMonth: number;
  last3Months: number;
}

interface GrowthData {
  series: GrowthDataPoint[];
  totals: GrowthTotals;
  momPct: number; // Month over Month percentage change
}

export const useCustomersGrowth = (params: { 
  from: Date; 
  to: Date; 
  groupBy?: 'week' | 'month' 
}) => {
  const { from, to, groupBy = 'week' } = params;
  
  // Debug logging in development
  if (import.meta.env.DEV) {
    console.debug('[growth]', { 
      from: from?.toISOString(), 
      to: to?.toISOString(), 
      groupBy, 
      enabled: !!(from && to && groupBy)
    });
  }
  
  return useQuery({
    queryKey: ['customers', 'growth', from?.toISOString(), to?.toISOString(), groupBy],
    queryFn: async (): Promise<GrowthData> => {
      await delay(300);
      
      if (!from || !to) {
        throw new Error('from and to dates are required');
      }
      
      const filtered = mockClients.filter(client => {
        const createdDate = new Date(client.createdAt);
        return createdDate >= from && createdDate <= to;
      });

      // Group by week or month
      const groups: Record<string, GrowthDataPoint> = {};
      
      filtered.forEach(client => {
        const createdDate = new Date(client.createdAt);
        let periodKey: string;
        let periodDate: Date;
        let displayLabel: string;
        
        if (groupBy === 'week') {
          // Get start of week (Sunday)
          const startOfWeek = new Date(createdDate);
          const day = startOfWeek.getDay();
          const diff = startOfWeek.getDate() - day;
          startOfWeek.setDate(diff);
          periodKey = startOfWeek.toISOString().split('T')[0];
          periodDate = startOfWeek;
          displayLabel = periodDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        } else {
          // Get start of month
          const startOfMonth = new Date(createdDate.getFullYear(), createdDate.getMonth(), 1);
          periodKey = startOfMonth.toISOString().split('T')[0];
          periodDate = startOfMonth;
          displayLabel = periodDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        }
        
        if (!groups[periodKey]) {
          groups[periodKey] = {
            x: displayLabel,
            value: 0,
            date: periodDate
          };
        }
        
        groups[periodKey].value++;
      });

      const series = Object.values(groups).sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calculate totals
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      
      const thisMonthClients = mockClients.filter(client => {
        const createdDate = new Date(client.createdAt);
        return createdDate >= thisMonth;
      });
      
      const prevMonthClients = mockClients.filter(client => {
        const createdDate = new Date(client.createdAt);
        return createdDate >= prevMonth && createdDate <= prevMonthEnd;
      });

      const totals: GrowthTotals = {
        thisMonth: thisMonthClients.length,
        prevMonth: prevMonthClients.length,
        last3Months: filtered.length
      };

      // Calculate MoM percentage
      const momPct = totals.prevMonth > 0 
        ? ((totals.thisMonth - totals.prevMonth) / totals.prevMonth) * 100 
        : totals.thisMonth > 0 ? 100 : 0;

      return {
        series,
        totals,
        momPct
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!(from && to && groupBy),
  });
};