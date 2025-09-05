// Fixed app timezone
export const APP_TZ = 'America/Sao_Paulo';

// 15min steps for time selection
export type TimeHHMM = `${string}:${'00'|'15'|'30'|'45'}`;

export type DayKey = 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun';

export interface DayInterval {
  start: TimeHHMM;  // ex: "09:00"
  end:   TimeHHMM;  // ex: "18:00"
}

export interface BusinessHours {
  timezone: typeof APP_TZ;
  days: Record<DayKey, {
    enabled: boolean;               // day open/closed
    intervals: DayInterval[];       // multiple intervals per day
  }>;
  defaultSlotMinutes: 30;           // slot granularity (compatible with agenda)
}

export type ClosureScope = 'global'|'professional';

export interface Closure {
  id: string;
  scope: ClosureScope;
  title: string;                    // National Holiday, João's Vacation, etc.
  range: { from: string; to: string }; // ISO date strings (00:00 inclusive to 23:59 inclusive)
  professionalId?: string;          // required if scope='professional'
  note?: string;
}

export interface CreateClosureRequest {
  scope: ClosureScope;
  title: string;
  range: { from: string; to: string };
  professionalId?: string;
  note?: string;
}

export interface UpdateClosureRequest {
  id: string;
  title: string;
  range: { from: string; to: string };
  professionalId?: string;
  note?: string;
}

// Day labels for UI
export const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Segunda',
  tue: 'Terça',
  wed: 'Quarta',
  thu: 'Quinta',
  fri: 'Sexta',
  sat: 'Sábado',
  sun: 'Domingo',
};

// Default business hours (9-18, Mon-Fri)
export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  timezone: APP_TZ,
  defaultSlotMinutes: 30,
  days: {
    mon: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    tue: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    wed: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    thu: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    fri: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    sat: { enabled: false, intervals: [] },
    sun: { enabled: false, intervals: [] },
  },
};