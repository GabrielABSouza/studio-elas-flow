import { Appointment, ISODate } from './types';

export const TZ = 'America/Sao_Paulo';

export function formatLocalDate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(date: ISODate): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d); // local
}

export function shiftDays(date: ISODate, n: number): ISODate {
  const nd = parseISODate(date);
  nd.setDate(nd.getDate() + n);
  return formatLocalDate(nd);
}

export function hhmmRange(start = 8, end = 20, step = 30): string[] {
  const out: string[] = [];
  for (let h = start; h < end; h++) {
    for (let m = 0; m < 60; m += step) {
      out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return out;
}

export const moneyFmt = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatMoney(value: number): string {
  return moneyFmt.format(value);
}

// Performance: indexação O(1) para lookup de agendamentos por profissional e horário
export function indexAppointments(appointments: Appointment[], date: ISODate) {
  // Map<profId, Map<'HH:MM', Appointment[]>>
  const map = new Map<string, Map<string, Appointment[]>>();
  
  for (const a of appointments) {
    if (!a.startsAt.startsWith(date)) continue;
    const hhmm = a.startsAt.slice(11, 16);
    const byProf = map.get(a.professionalId) ?? new Map<string, Appointment[]>();
    const arr = byProf.get(hhmm) ?? [];
    arr.push(a);
    byProf.set(hhmm, arr);
    map.set(a.professionalId, byProf);
  }
  
  return map;
}

// Detecção de overlaps
export function detectOverlaps(appointments: Appointment[]): Set<string> {
  const overlaps = new Set<string>();
  
  for (let i = 0; i < appointments.length; i++) {
    const a1 = appointments[i];
    for (let j = i + 1; j < appointments.length; j++) {
      const a2 = appointments[j];
      
      // Mesmo profissional e horários que se sobrepõem
      if (a1.professionalId === a2.professionalId) {
        const start1 = new Date(a1.startsAt);
        const end1 = new Date(a1.endsAt);
        const start2 = new Date(a2.startsAt);
        const end2 = new Date(a2.endsAt);
        
        if (start1 < end2 && start2 < end1) {
          overlaps.add(a1.id);
          overlaps.add(a2.id);
        }
      }
    }
  }
  
  return overlaps;
}

// Formatação de data para exibição
export function formatDisplayDate(date: ISODate): string {
  const d = parseISODate(date);
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Formatação de horário
export function formatTime(dateTime: string): string {
  return dateTime.slice(11, 16);
}

// Cálculo de início de semana (segunda-feira)
export function getWeekStart(date: ISODate): ISODate {
  const d = parseISODate(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para segunda-feira
  const monday = new Date(d.setDate(diff));
  return formatLocalDate(monday);
}

// Cálculo de início de mês
export function getMonthStart(date: ISODate): ISODate {
  const d = parseISODate(date);
  return formatLocalDate(new Date(d.getFullYear(), d.getMonth(), 1));
}

// Validações
export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function isValidTime(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time);
}