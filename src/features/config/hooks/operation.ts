import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as api from '../api/operation';
import type { 
  BusinessHours, 
  Closure, 
  ClosureScope, 
  CreateClosureRequest, 
  UpdateClosureRequest 
} from '../types/operation';

// Query Keys
export const operationKeys = {
  all: ['operation'] as const,
  businessHours: () => [...operationKeys.all, 'businessHours'] as const,
  closures: (scope?: ClosureScope) => [...operationKeys.all, 'closures', scope] as const,
};

// Business Hours Hooks
export function useBusinessHours() {
  return useQuery({
    queryKey: operationKeys.businessHours(),
    queryFn: api.getBusinessHours,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSaveBusinessHours() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (businessHours: BusinessHours) => api.saveBusinessHours(businessHours),
    onSuccess: () => {
      // Invalidate business hours and agenda data
      queryClient.invalidateQueries({ queryKey: operationKeys.businessHours() });
      queryClient.invalidateQueries({ queryKey: ['agenda'] }); // Invalidate agenda cache
      toast.success('Horários de atendimento salvos com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao salvar horários de atendimento: ' + (error as Error).message);
    },
  });
}

// Closures Hooks
export function useClosures(scope?: ClosureScope) {
  return useQuery({
    queryKey: operationKeys.closures(scope),
    queryFn: () => api.getClosures(scope),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateClosure() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateClosureRequest) => api.createClosure(data),
    onSuccess: (newClosure) => {
      // Invalidate closures and agenda data
      queryClient.invalidateQueries({ queryKey: operationKeys.closures() });
      queryClient.invalidateQueries({ queryKey: ['agenda'] }); // Invalidate agenda cache
      toast.success(`Bloqueio "${newClosure.title}" criado com sucesso!`);
    },
    onError: (error) => {
      toast.error('Erro ao criar bloqueio: ' + (error as Error).message);
    },
  });
}

export function useUpdateClosure() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateClosureRequest) => api.updateClosure(data),
    onSuccess: (updatedClosure) => {
      // Invalidate closures and agenda data
      queryClient.invalidateQueries({ queryKey: operationKeys.closures() });
      queryClient.invalidateQueries({ queryKey: ['agenda'] }); // Invalidate agenda cache
      toast.success(`Bloqueio "${updatedClosure.title}" atualizado com sucesso!`);
    },
    onError: (error) => {
      toast.error('Erro ao atualizar bloqueio: ' + (error as Error).message);
    },
  });
}

export function useDeleteClosure() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.deleteClosure(id),
    onSuccess: () => {
      // Invalidate closures and agenda data
      queryClient.invalidateQueries({ queryKey: operationKeys.closures() });
      queryClient.invalidateQueries({ queryKey: ['agenda'] }); // Invalidate agenda cache
      toast.success('Bloqueio removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover bloqueio: ' + (error as Error).message);
    },
  });
}