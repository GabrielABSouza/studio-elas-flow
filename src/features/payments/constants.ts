// Default payment methods for application features (read-only)
// Used by POS and Reports when payment management UI is not available

export interface PaymentMethod {
  id: string;
  name: string;
  type?: 'cash' | 'digital' | 'card';
}

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', name: 'Dinheiro', type: 'cash' },
  { id: 'pix', name: 'PIX', type: 'digital' },
  { id: 'debit', name: 'Débito', type: 'card' },
  { id: 'credit', name: 'Crédito', type: 'card' },
];

// Fallback hook for when payment methods are needed but management UI is disabled
export function useDefaultPaymentMethods() {
  return {
    data: DEFAULT_PAYMENT_METHODS,
    isLoading: false,
    error: null,
  };
}