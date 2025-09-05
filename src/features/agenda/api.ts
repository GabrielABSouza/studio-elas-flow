import { Appointment, Professional, ISODate } from './types';

// Tipos adicionais para os novos endpoints
export type Client = { 
  id: string; 
  name: string; 
  phone?: string; 
};

export type Procedure = { 
  id: string; 
  name: string; 
  defaultPrice?: number; 
};

// Mock data para desenvolvimento - será substituído por API real
const mockClients: Client[] = [
  { id: '1', name: 'Maria Silva Santos', phone: '(11) 99999-0001' },
  { id: '2', name: 'Ana Carolina Lima', phone: '(11) 99999-0002' },
  { id: '3', name: 'Juliana Oliveira', phone: '(11) 99999-0003' },
  { id: '4', name: 'Carla Mendes', phone: '(11) 99999-0004' },
  { id: '5', name: 'Fernanda Torres', phone: '(11) 99999-0005' },
];

const mockProcedures: Procedure[] = [
  { id: '1', name: 'Harmonização Facial', defaultPrice: 450 },
  { id: '2', name: 'Limpeza de Pele', defaultPrice: 120 },
  { id: '3', name: 'Preenchimento Labial', defaultPrice: 350 },
  { id: '4', name: 'Design de Sobrancelhas', defaultPrice: 80 },
  { id: '5', name: 'Massagem Relaxante', defaultPrice: 180 },
  { id: '6', name: 'Botox', defaultPrice: 600 },
];

const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Dr. Ana Paula Silva',
    role: 'Esteticista',
    color: '#8B5CF6',
  },
  {
    id: '2',
    name: 'Maria Fernanda Costa',
    role: 'Recepcionista',
    color: '#06B6D4',
  },
  {
    id: '3',
    name: 'Juliana Santos',
    role: 'Esteticista',
    color: '#10B981',
  },
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    customer: { id: '1', name: 'Maria Silva Santos' },
    professionalId: '1',
    startsAt: '2025-09-03T09:00:00-03:00',
    endsAt: '2025-09-03T10:30:00-03:00',
    status: 'to_confirm',
    procedures: [
      { id: '1', name: 'Harmonização Facial', price: 450 },
    ],
    notes: 'Primeira sessão',
    payment: {
      method: 'credit_card',
      status: 'pending'
    }
  },
  {
    id: '2',
    customer: { id: '2', name: 'Ana Carolina Lima' },
    professionalId: '3',
    startsAt: '2025-09-03T14:00:00-03:00',
    endsAt: '2025-09-03T15:00:00-03:00',
    status: 'confirmed',
    procedures: [
      { id: '2', name: 'Limpeza de Pele', price: 120 },
    ],
  },
  {
    id: '3',
    customer: { id: '3', name: 'Juliana Oliveira' },
    professionalId: '1',
    startsAt: '2025-09-03T10:00:00-03:00',
    endsAt: '2025-09-03T11:00:00-03:00',
    status: 'completed',
    procedures: [
      { id: '3', name: 'Preenchimento Labial', price: 350 },
    ],
    payment: {
      method: 'cash',
      status: 'paid',
      amount: 350,
      paidAt: '2025-09-03T11:00:00-03:00'
    }
  },
  {
    id: '4',
    customer: { id: '1', name: 'Maria Silva Santos' },
    professionalId: '3',
    startsAt: '2025-09-03T16:00:00-03:00',
    endsAt: '2025-09-03T16:45:00-03:00',
    status: 'confirmed',
    procedures: [
      { id: '4', name: 'Design de Sobrancelhas', price: 80 },
    ],
  },
  {
    id: '5',
    customer: { id: '4', name: 'Carla Mendes' },
    professionalId: '2',
    startsAt: '2025-09-03T11:30:00-03:00',
    endsAt: '2025-09-03T12:30:00-03:00',
    status: 'to_confirm',
    procedures: [
      { id: '5', name: 'Massagem Relaxante', price: 180 },
    ],
  },
  {
    id: '6',
    customer: { id: '5', name: 'Fernanda Torres' },
    professionalId: '1',
    startsAt: '2025-09-04T15:30:00-03:00',
    endsAt: '2025-09-04T16:30:00-03:00',
    status: 'to_confirm',
    procedures: [
      { id: '6', name: 'Botox', price: 600 },
    ],
  },
];

// Simula delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchProfessionals(): Promise<Professional[]> {
  await delay(300);
  return mockProfessionals;
}

export async function fetchProcedures(): Promise<Procedure[]> {
  await delay(200);
  return mockProcedures;
}

export async function searchClients(query: string): Promise<Client[]> {
  await delay(300);
  
  if (query.trim().length < 2) {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  return mockClients.filter(client => 
    client.name.toLowerCase().includes(normalizedQuery) ||
    client.phone?.includes(normalizedQuery)
  );
}

export async function fetchAppointments(params: {
  startDate: ISODate;
  endDate: ISODate;
}): Promise<Appointment[]> {
  await delay(500);
  
  // Filtra por range de datas
  return mockAppointments.filter(apt => {
    const aptDate = apt.startsAt.slice(0, 10);
    return aptDate >= params.startDate && aptDate <= params.endDate;
  });
}

export async function createAppointment(data: {
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
}): Promise<{ id: string }> {
  await delay(500);
  
  // Criar novo agendamento
  const newId = Math.random().toString(36).substring(2, 9);
  const newAppointment: Appointment = {
    id: newId,
    customer: { 
      id: data.clientId || Math.random().toString(36).substring(2, 9), 
      name: data.clientName 
    },
    professionalId: data.professionalId,
    startsAt: data.startISO,
    endsAt: data.endISO,
    status: 'scheduled',
    procedures: data.items.map(item => ({
      id: Math.random().toString(36).substring(2, 9),
      name: `Procedimento ${item.procedureId}`, // Na API real, buscar nome pelo ID
      price: Math.random() * 200 + 50, // Mock price
    })),
    notes: 'Criado via formulário',
  };
  
  // Adicionar aos dados mock
  mockAppointments.push(newAppointment);
  
  return { id: newId };
}

export async function completeAppointment(appointmentId: string, _data: {
  items: Array<{ id: string; procedureId: string; name: string; price: number; qty: number; professionalId: string }>;
  total: number;
  paymentMethod: string;
}): Promise<void> {
  await delay(300);
  
  // Simulação - na API real, atualizaria o status
  const apt = mockAppointments.find(a => a.id === appointmentId);
  if (apt) {
    apt.status = 'completed';
  }
}

export async function getAppointment(appointmentId: string): Promise<Appointment> {
  await delay(200);
  
  const appointment = mockAppointments.find(a => a.id === appointmentId);
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  return appointment;
}

export async function confirmAppointment(appointmentId: string): Promise<void> {
  await delay(300);
  
  const apt = mockAppointments.find(a => a.id === appointmentId);
  if (apt) {
    apt.status = 'confirmed';
  }
}

export async function cancelAppointment(appointmentId: string, data: {
  reason: string;
  notes?: string;
  notifyClient?: boolean;
  notifyProfessional?: boolean;
}): Promise<void> {
  await delay(300);
  
  const apt = mockAppointments.find(a => a.id === appointmentId);
  if (apt) {
    apt.status = 'canceled';
    // In real API, would also store reason and notes
  }
}

export async function updateAppointment(appointmentId: string, data: {
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
}): Promise<{ id: string }> {
  await delay(500);
  
  const apt = mockAppointments.find(a => a.id === appointmentId);
  if (apt) {
    apt.customer.name = data.clientName;
    apt.professionalId = data.professionalId;
    apt.startsAt = data.startISO;
    apt.endsAt = data.endISO;
    apt.procedures = data.items.map(item => ({
      id: Math.random().toString(36).substring(2, 9),
      name: `Procedimento ${item.procedureId}`, // Na API real, buscar nome pelo ID
      price: Math.random() * 200 + 50, // Mock price
    }));
  }
  
  return { id: appointmentId };
}