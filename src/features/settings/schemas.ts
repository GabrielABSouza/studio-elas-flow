import { z } from 'zod';

export const paymentMethodSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(60, 'Nome deve ter no máximo 60 caracteres'),
  feeType: z.enum(['percent', 'fixed'], { 
    required_error: 'Selecione o tipo de custo' 
  }),
  feeValue: z.coerce.number().min(0, 'Valor deve ser maior ou igual a zero'),
  active: z.boolean().default(true),
}).refine((data) => {
  if (data.feeType === 'percent' && data.feeValue > 100) {
    return false;
  }
  return true;
}, {
  message: 'Para tipo percentual, o valor deve ser no máximo 100',
  path: ['feeValue']
});

export const procedureSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  category: z.string().optional(),
  duration: z.coerce.number().min(1, 'Duração deve ser pelo menos 1 minuto'),
  basePrice: z.coerce.number().min(0, 'Preço deve ser maior ou igual a zero'),
  baseCommissionPct: z.coerce.number().min(0, 'Comissão deve ser maior ou igual a zero').max(100, 'Comissão deve ser no máximo 100%'),
  active: z.boolean().default(true),
});

export const procedureOverrideSchema = z.object({
  procedureId: z.string(),
  professionalId: z.string(),
  price: z.coerce.number().min(0).optional(),
  commissionPct: z.coerce.number().min(0).max(100).optional(),
  duration: z.coerce.number().min(1).optional(),
  bufferBefore: z.coerce.number().min(0).optional(),
  bufferAfter: z.coerce.number().min(0).optional(),
});

export const comboItemSchema = z.object({
  procedureId: z.string(),
  quantity: z.coerce.number().min(1),
});

export const comboSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  description: z.string().optional(),
  items: z.array(comboItemSchema).min(1, 'Adicione pelo menos um item'),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.coerce.number().min(0),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  active: z.boolean().default(true),
}).refine((data) => {
  if (data.discountType === 'percent' && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: 'Para desconto percentual, o valor deve ser no máximo 100',
  path: ['discountValue']
});

export const campaignSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  description: z.string().optional(),
  scope: z.enum(['category', 'procedure', 'payment', 'day']),
  scopeValues: z.array(z.string()).min(1, 'Selecione pelo menos um item'),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.coerce.number().min(0),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  active: z.boolean().default(true),
}).refine((data) => {
  if (data.discountType === 'percent' && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: 'Para desconto percentual, o valor deve ser no máximo 100',
  path: ['discountValue']
});

export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;
export type ProcedureFormData = z.infer<typeof procedureSchema>;
export type ProcedureOverrideFormData = z.infer<typeof procedureOverrideSchema>;
export type ComboFormData = z.infer<typeof comboSchema>;
export type CampaignFormData = z.infer<typeof campaignSchema>;