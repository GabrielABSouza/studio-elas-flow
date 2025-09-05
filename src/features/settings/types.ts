export type PaymentFeeType = 'percent' | 'fixed';

export interface PaymentMethod {
  id: string;
  name: string;
  feeType: PaymentFeeType;
  feeValue: number; // percent: 1.39 → 1,39% | fixed: 1.50 → R$1,50
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Procedure {
  id: string;
  name: string;
  category?: string;
  duration: number; // minutes
  basePrice: number;
  baseCommissionPct: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProcedureOverride {
  id: string;
  procedureId: string;
  professionalId: string;
  price?: number;
  commissionPct?: number;
  duration?: number;
  bufferBefore?: number;
  bufferAfter?: number;
}

export interface Professional {
  id: string;
  name: string;
  role?: string;
  active: boolean;
}

export interface Combo {
  id: string;
  name: string;
  description?: string;
  items: ComboItem[];
  discountType: 'percent' | 'fixed';
  discountValue: number;
  validFrom?: string;
  validTo?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComboItem {
  procedureId: string;
  quantity: number;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  scope: 'category' | 'procedure' | 'payment' | 'day';
  scopeValues: string[];
  discountType: 'percent' | 'fixed';
  discountValue: number;
  validFrom?: string;
  validTo?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}