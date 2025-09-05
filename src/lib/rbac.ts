import type { Role, Permission } from '@/features/permissions/types';

// Simple RBAC helper for application
// In a real app, this would read from the permissions matrix API

export function can(role: Role, permission: Permission): boolean {
  // This is a simplified version for MVP
  // In production, this would integrate with the permissions matrix from the API
  
  const permissions: Record<Role, Permission[]> = {
    admin: [
      // Full access - all permissions
      'agenda.read', 'agenda.create', 'agenda.update', 'agenda.delete', 'agenda.confirm', 'agenda.cancel',
      'clientes.read', 'clientes.create', 'clientes.update', 'clientes.delete', 'clientes.export',
      'procedimentos.read', 'procedimentos.create', 'procedimentos.update', 'procedimentos.delete', 'procedimentos.configure',
      'combos.read', 'combos.create', 'combos.update', 'combos.delete', 'combos.configure',
      'relatorios.read', 'relatorios.export',
      'pos.read', 'pos.finalize',
      'configuracoes.read', 'configuracoes.configure',
      'permissoes.read', 'permissoes.configure',
    ],
    gestor: [
      // Everything except permissions.configure
      'agenda.read', 'agenda.create', 'agenda.update', 'agenda.delete', 'agenda.confirm', 'agenda.cancel',
      'clientes.read', 'clientes.create', 'clientes.update', 'clientes.delete', 'clientes.export',
      'procedimentos.read', 'procedimentos.create', 'procedimentos.update', 'procedimentos.delete', 'procedimentos.configure',
      'combos.read', 'combos.create', 'combos.update', 'combos.delete', 'combos.configure',
      'relatorios.read', 'relatorios.export',
      'pos.read', 'pos.finalize',
      'configuracoes.read', 'configuracoes.configure',
      'permissoes.read',
    ],
    recepcao: [
      // Reception: basic operations, no delete/configure
      'agenda.read', 'agenda.create', 'agenda.update', 'agenda.confirm', 'agenda.cancel',
      'clientes.read', 'clientes.create', 'clientes.update',
      'procedimentos.read',
      'combos.read',
      'pos.read', 'pos.finalize',
    ],
    profissional: [
      // Professional: limited to their own data
      'agenda.read',
      'clientes.read',
      'procedimentos.read',
      'combos.read',
      'pos.read', 'pos.finalize',
    ],
  };

  return permissions[role]?.includes(permission) || false;
}