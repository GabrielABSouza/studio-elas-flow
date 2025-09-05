import type { PaymentMethod, PaymentMethodFormData, Procedure, ProcedureFormData, ProcedureOverride, ProcedureOverrideFormData, Professional, Combo, ComboFormData, Campaign, CampaignFormData } from './types';

// Mock data for development
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    name: 'Dinheiro',
    feeType: 'fixed',
    feeValue: 0,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2', 
    name: 'PIX',
    feeType: 'percent',
    feeValue: 0,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Cartão Débito',
    feeType: 'percent',
    feeValue: 1.39,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Cartão Crédito 1x',
    feeType: 'percent',
    feeValue: 2.49,
    active: true,
    createdAt: new Date().toISOString(),
  },
];

let mockProcedures: Procedure[] = [
  {
    id: '1',
    name: 'Corte Feminino',
    category: 'Cabelo',
    duration: 60,
    basePrice: 80,
    baseCommissionPct: 40,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Manicure',
    category: 'Unhas',
    duration: 45,
    basePrice: 35,
    baseCommissionPct: 50,
    active: true,
    createdAt: new Date().toISOString(),
  },
];

let mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Ana Silva',
    role: 'Cabeleireira',
    active: true,
  },
  {
    id: '2',
    name: 'Bruno Costa',
    role: 'Barbeiro',
    active: true,
  },
];

let mockProcedureOverrides: ProcedureOverride[] = [
  // Mock some enabled procedures for demonstration
  {
    id: '1',
    professionalId: '1',
    procedureId: '1',
    price: 90,
    commissionPct: 45,
    duration: 60,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    professionalId: '2',
    procedureId: '2',
    price: null,
    commissionPct: null,
    duration: null,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
];
let mockCombos: Combo[] = [];
let mockCampaigns: Campaign[] = [];

// Payment Methods API
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  await delay(300);
  return mockPaymentMethods.filter(pm => pm.active || true); // Show all for settings
}

export async function createPaymentMethod(data: PaymentMethodFormData): Promise<PaymentMethod> {
  await delay(500);
  const newMethod: PaymentMethod = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockPaymentMethods.push(newMethod);
  return newMethod;
}

export async function updatePaymentMethod(id: string, data: PaymentMethodFormData): Promise<PaymentMethod> {
  await delay(500);
  const index = mockPaymentMethods.findIndex(pm => pm.id === id);
  if (index === -1) throw new Error('Payment method not found');
  
  const updated: PaymentMethod = {
    ...mockPaymentMethods[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  mockPaymentMethods[index] = updated;
  return updated;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await delay(300);
  const index = mockPaymentMethods.findIndex(pm => pm.id === id);
  if (index === -1) throw new Error('Payment method not found');
  mockPaymentMethods.splice(index, 1);
}

// Procedures API
export async function getProcedures(): Promise<Procedure[]> {
  await delay(300);
  return mockProcedures;
}

export async function createProcedure(data: ProcedureFormData): Promise<Procedure> {
  await delay(500);
  const newProcedure: Procedure = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockProcedures.push(newProcedure);
  return newProcedure;
}

export async function updateProcedure(id: string, data: ProcedureFormData): Promise<Procedure> {
  await delay(500);
  const index = mockProcedures.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Procedure not found');
  
  const updated: Procedure = {
    ...mockProcedures[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  mockProcedures[index] = updated;
  return updated;
}

export async function deleteProcedure(id: string): Promise<void> {
  await delay(300);
  const index = mockProcedures.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Procedure not found');
  mockProcedures.splice(index, 1);
}

// Professionals API
export async function getProfessionals(): Promise<Professional[]> {
  await delay(300);
  return mockProfessionals;
}

// Procedure Overrides API
export async function getProcedureOverrides(): Promise<ProcedureOverride[]> {
  await delay(300);
  return mockProcedureOverrides;
}

export async function createProcedureOverride(data: ProcedureOverrideFormData): Promise<ProcedureOverride> {
  await delay(500);
  const newOverride: ProcedureOverride = {
    id: crypto.randomUUID(),
    ...data,
  };
  mockProcedureOverrides.push(newOverride);
  return newOverride;
}

export async function updateProcedureOverride(id: string, data: ProcedureOverrideFormData): Promise<ProcedureOverride> {
  await delay(500);
  const index = mockProcedureOverrides.findIndex(po => po.id === id);
  if (index === -1) throw new Error('Procedure override not found');
  
  mockProcedureOverrides[index] = { ...mockProcedureOverrides[index], ...data };
  return mockProcedureOverrides[index];
}

export async function deleteProcedureOverride(id: string): Promise<void> {
  await delay(300);
  const index = mockProcedureOverrides.findIndex(po => po.id === id);
  if (index === -1) throw new Error('Procedure override not found');
  mockProcedureOverrides.splice(index, 1);
}

// Combos API
export async function getCombos(): Promise<Combo[]> {
  await delay(300);
  return mockCombos;
}

export async function createCombo(data: ComboFormData): Promise<Combo> {
  await delay(500);
  const newCombo: Combo = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockCombos.push(newCombo);
  return newCombo;
}

export async function updateCombo(id: string, data: ComboFormData): Promise<Combo> {
  await delay(500);
  const index = mockCombos.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Combo not found');
  
  const updated: Combo = {
    ...mockCombos[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  mockCombos[index] = updated;
  return updated;
}

export async function deleteCombo(id: string): Promise<void> {
  await delay(300);
  const index = mockCombos.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Combo not found');
  mockCombos.splice(index, 1);
}

// Campaigns API
export async function getCampaigns(): Promise<Campaign[]> {
  await delay(300);
  return mockCampaigns;
}

export async function createCampaign(data: CampaignFormData): Promise<Campaign> {
  await delay(500);
  const newCampaign: Campaign = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockCampaigns.push(newCampaign);
  return newCampaign;
}

export async function updateCampaign(id: string, data: CampaignFormData): Promise<Campaign> {
  await delay(500);
  const index = mockCampaigns.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Campaign not found');
  
  const updated: Campaign = {
    ...mockCampaigns[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  mockCampaigns[index] = updated;
  return updated;
}

export async function deleteCampaign(id: string): Promise<void> {
  await delay(300);
  const index = mockCampaigns.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Campaign not found');
  mockCampaigns.splice(index, 1);
}

// Matrix Toggle API
export async function setProcedureAvailability(params: {
  professionalId: string;
  procedureId: string;
  enabled: boolean;
}): Promise<void> {
  await delay(800); // Simulate network delay
  
  const existingIndex = mockProcedureOverrides.findIndex(
    o => o.professionalId === params.professionalId && o.procedureId === params.procedureId
  );
  
  if (params.enabled) {
    // Enable: create override if it doesn't exist
    if (existingIndex === -1) {
      const newOverride: ProcedureOverride = {
        id: crypto.randomUUID(),
        professionalId: params.professionalId,
        procedureId: params.procedureId,
        price: null,
        commissionPct: null,
        duration: null,
        enabled: true,
        createdAt: new Date().toISOString(),
      };
      mockProcedureOverrides.push(newOverride);
    } else {
      // Update existing override to enabled
      mockProcedureOverrides[existingIndex].enabled = true;
      mockProcedureOverrides[existingIndex].updatedAt = new Date().toISOString();
    }
  } else {
    // Disable: remove override completely
    if (existingIndex !== -1) {
      mockProcedureOverrides.splice(existingIndex, 1);
    }
  }
}