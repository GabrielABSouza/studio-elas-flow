import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as api from './api';
import type { PaymentMethodFormData, ProcedureFormData, ProcedureOverrideFormData, ComboFormData, CampaignFormData } from './schemas';
import type { ProcedureOverride } from './types';

// Query Keys
export const settingsKeys = {
  all: ['settings'] as const,
  paymentMethods: () => [...settingsKeys.all, 'payment-methods'] as const,
  procedures: () => [...settingsKeys.all, 'procedures'] as const,
  professionals: () => [...settingsKeys.all, 'professionals'] as const,
  procedureOverrides: () => [...settingsKeys.all, 'procedure-overrides'] as const,
  combos: () => [...settingsKeys.all, 'combos'] as const,
  campaigns: () => [...settingsKeys.all, 'campaigns'] as const,
};

// Payment Methods
export function usePaymentMethods() {
  return useQuery({
    queryKey: settingsKeys.paymentMethods(),
    queryFn: api.getPaymentMethods,
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentMethodFormData) => api.createPaymentMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.paymentMethods() });
      toast.success('Forma de pagamento criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar forma de pagamento: ' + (error as Error).message);
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PaymentMethodFormData }) => 
      api.updatePaymentMethod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.paymentMethods() });
      toast.success('Forma de pagamento atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar forma de pagamento: ' + (error as Error).message);
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.paymentMethods() });
      toast.success('Forma de pagamento removida com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover forma de pagamento: ' + (error as Error).message);
    },
  });
}

// Procedures
export function useProcedures() {
  return useQuery({
    queryKey: settingsKeys.procedures(),
    queryFn: api.getProcedures,
  });
}

export function useCreateProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProcedureFormData) => api.createProcedure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.procedures() });
      toast.success('Procedimento criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar procedimento: ' + (error as Error).message);
    },
  });
}

export function useUpdateProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProcedureFormData }) => 
      api.updateProcedure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.procedures() });
      toast.success('Procedimento atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar procedimento: ' + (error as Error).message);
    },
  });
}

export function useDeleteProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProcedure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.procedures() });
      toast.success('Procedimento removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover procedimento: ' + (error as Error).message);
    },
  });
}

// Professionals
export function useProfessionals() {
  return useQuery({
    queryKey: settingsKeys.professionals(),
    queryFn: api.getProfessionals,
  });
}

// Procedure Overrides
export function useProcedureOverrides() {
  return useQuery({
    queryKey: settingsKeys.procedureOverrides(),
    queryFn: api.getProcedureOverrides,
  });
}

export function useCreateProcedureOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProcedureOverrideFormData) => api.createProcedureOverride(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.procedureOverrides() });
      toast.success('Override criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar override: ' + (error as Error).message);
    },
  });
}

export function useUpdateProcedureOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProcedureOverrideFormData }) => 
      api.updateProcedureOverride(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.procedureOverrides() });
      toast.success('Override atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar override: ' + (error as Error).message);
    },
  });
}

export function useDeleteProcedureOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProcedureOverride(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.procedureOverrides() });
      toast.success('Override removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover override: ' + (error as Error).message);
    },
  });
}

// Combos
export function useCombos() {
  return useQuery({
    queryKey: settingsKeys.combos(),
    queryFn: api.getCombos,
  });
}

export function useCreateCombo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ComboFormData) => api.createCombo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.combos() });
      toast.success('Combo criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar combo: ' + (error as Error).message);
    },
  });
}

export function useUpdateCombo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ComboFormData }) => 
      api.updateCombo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.combos() });
      toast.success('Combo atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar combo: ' + (error as Error).message);
    },
  });
}

export function useDeleteCombo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCombo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.combos() });
      toast.success('Combo removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover combo: ' + (error as Error).message);
    },
  });
}

// Campaigns
export function useCampaigns() {
  return useQuery({
    queryKey: settingsKeys.campaigns(),
    queryFn: api.getCampaigns,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CampaignFormData) => api.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.campaigns() });
      toast.success('Campanha criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar campanha: ' + (error as Error).message);
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CampaignFormData }) => 
      api.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.campaigns() });
      toast.success('Campanha atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar campanha: ' + (error as Error).message);
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.campaigns() });
      toast.success('Campanha removida com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover campanha: ' + (error as Error).message);
    },
  });
}

// Matrix Toggle Hook
export function useToggleAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.setProcedureAvailability,
    onMutate: async ({ professionalId, procedureId, enabled }) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.procedureOverrides() });
      const prevOverrides = queryClient.getQueryData<ProcedureOverride[]>(settingsKeys.procedureOverrides());
      
      // Optimistic update
      queryClient.setQueryData(settingsKeys.procedureOverrides(), (old: ProcedureOverride[] | undefined) => {
        if (!old) return old;
        
        const existingIndex = old.findIndex(
          (o) => o.professionalId === professionalId && o.procedureId === procedureId
        );
        
        if (enabled) {
          if (existingIndex === -1) {
            // Add new override
            return [...old, {
              id: `temp-${Date.now()}`,
              professionalId,
              procedureId,
              price: null,
              commissionPct: null,
              duration: null,
              enabled: true,
              createdAt: new Date().toISOString(),
            }];
          } else {
            // Update existing to enabled
            return old.map(o => 
              o.professionalId === professionalId && o.procedureId === procedureId
                ? { ...o, enabled: true }
                : o
            );
          }
        } else {
          // Remove override when disabled
          return old.filter(o => 
            !(o.professionalId === professionalId && o.procedureId === procedureId)
          );
        }
      });
      
      return { prevOverrides };
    },
    onError: (_, __, context) => {
      if (context?.prevOverrides) {
        queryClient.setQueryData(settingsKeys.procedureOverrides(), context.prevOverrides);
      }
      toast.error('Não foi possível salvar. Tente novamente.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.procedureOverrides() });
    },
  });
}