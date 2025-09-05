import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as api from './api';
import type { User, Role, RoleMatrix, UpdateUserRoleRequest, UpdateRoleMatrixRequest } from './types';

// Query Keys
export const permissionsKeys = {
  all: ['permissions'] as const,
  users: () => [...permissionsKeys.all, 'users'] as const,
  roleMatrix: () => [...permissionsKeys.all, 'role-matrix'] as const,
};

// Users
export function useUsers() {
  return useQuery({
    queryKey: permissionsKeys.users(),
    queryFn: api.getUsers,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateUserRoleRequest) => api.updateUserRole(data),
    onMutate: async ({ userId, role }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: permissionsKeys.users() });
      
      // Snapshot previous value
      const prevUsers = queryClient.getQueryData<User[]>(permissionsKeys.users());
      
      // Optimistic update
      queryClient.setQueryData(permissionsKeys.users(), (old: User[] | undefined) => {
        if (!old) return old;
        return old.map(user => 
          user.id === userId ? { ...user, role } : user
        );
      });
      
      return { prevUsers };
    },
    onSuccess: (updatedUser) => {
      toast.success(`Papel de ${updatedUser.name} alterado para ${updatedUser.role}`);
    },
    onError: (error, variables, context) => {
      // Rollback
      if (context?.prevUsers) {
        queryClient.setQueryData(permissionsKeys.users(), context.prevUsers);
      }
      toast.error('Erro ao alterar papel do usuário: ' + (error as Error).message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: permissionsKeys.users() });
    },
  });
}

// Role Matrix
export function useRoleMatrix() {
  return useQuery({
    queryKey: permissionsKeys.roleMatrix(),
    queryFn: api.getRoleMatrix,
  });
}

export function useUpdateRoleMatrix() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateRoleMatrixRequest) => api.updateRoleMatrix(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionsKeys.roleMatrix() });
      toast.success('Permissões atualizadas com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar permissões: ' + (error as Error).message);
    },
  });
}