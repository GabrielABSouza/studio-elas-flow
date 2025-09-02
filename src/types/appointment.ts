export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  staffId: string;
  staffName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'nao_compareceu';
  price: number;
  notes?: string;
  isRecurring?: boolean;
  recurringPattern?: 'semanal' | 'quinzenal' | 'mensal';
  reminderSent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: 'facial' | 'corporal' | 'sobrancelha' | 'cilios' | 'harmonizacao';
  duration: number; // in minutes
  price: number;
  description?: string;
  isActive: boolean;
  color: string; // for calendar display
}

export interface TimeSlot {
  time: string;
  available: boolean;
  staffId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  appointment: Appointment;
}

export type CalendarView = 'month' | 'week' | 'day';