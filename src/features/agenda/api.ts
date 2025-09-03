import { Appointment, Professional, ISODate } from './types';

// Mock data para desenvolvimento - será substituído por API real
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
    status: 'scheduled',
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
    status: 'in_service',
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
    status: 'scheduled',
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
    status: 'scheduled',
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
    status: 'scheduled',
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

export async function completeAppointment(appointmentId: string, data: {
  items: Array<{ procedureId: string; name: string; price: number; quantity: number; professionalId: string }>;
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