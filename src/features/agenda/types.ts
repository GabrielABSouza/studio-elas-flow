export type ISODate = string; // '2025-09-02' (local)
export type ISODateTime = string; // '2025-09-02T14:30:00-03:00'

export type AppointmentStatus = 'scheduled' | 'in_service' | 'completed' | 'no_show' | 'canceled';
export type PaymentMethod = 'cash' | 'pix' | 'credit_card' | 'debit_card' | 'mixed';
export type PaymentStatus = 'pending' | 'paid' | 'partially_paid' | 'refunded';

export interface Professional {
  id: string;
  name: string;
  role?: string;
  color?: string;
}

export interface CustomerRef {
  id: string;
  name: string;
}

export interface Procedure {
  id: string;
  name: string;
  price: number;
}

export interface ProcedureCatalog {
  id: string;
  name: string;
  defaultPrice: number;
}

export interface PaymentInfo {
  method?: PaymentMethod;
  status?: PaymentStatus;
  amount?: number;
  paidAt?: ISODateTime;
}

export interface Appointment {
  id: string;
  customer: CustomerRef;
  professionalId: string;
  startsAt: ISODateTime; // sempre com offset -03:00
  endsAt: ISODateTime;
  status: AppointmentStatus;
  procedures: Procedure[];
  payment?: PaymentInfo;
  notes?: string;
}

export interface ProcedureItem {
  id: string;
  procedureId: string;
  professionalId: string;
  name: string;
  price: number;
  qty: number;
}

export interface POSInput {
  appointmentId: string;
  items: ProcedureItem[];
  discountValue?: number;
  discountPct?: number;
  finalTotal?: number;
  commissionPct: number;
  paymentMethod: PaymentMethod;
}

export interface POSResult {
  subtotal: number;
  discountValue: number;
  discountPct: number;
  total: number;
  finalTotal: number;
  commissionPct: number;
  commissionAmount: number;
  paymentMethod: PaymentMethod;
}