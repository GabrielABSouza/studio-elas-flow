import type { User, Role, RoleMatrix, UpdateUserRoleRequest, UpdateRoleMatrixRequest } from './types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock users data
let mockUsers: User[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@studioelas.com',
    role: 'admin',
    active: true,
  },
  {
    id: '2',
    name: 'Carlos Santos',
    email: 'carlos.santos@studioelas.com',
    role: 'gestor',
    active: true,
  },
  {
    id: '3',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@studioelas.com',
    role: 'recepcao',
    active: true,
  },
  {
    id: '4',
    name: 'João Costa',
    email: 'joao.costa@studioelas.com',
    role: 'profissional',
    active: true,
  },
];

// Default role matrix with proper MVP permissions
const defaultRoleMatrix: RoleMatrix = {
  admin: {
    // Full access
    'agenda.read': true,
    'agenda.create': true,
    'agenda.update': true,
    'agenda.delete': true,
    'agenda.confirm': true,
    'agenda.cancel': true,
    'clientes.read': true,
    'clientes.create': true,
    'clientes.update': true,
    'clientes.delete': true,
    'clientes.export': true,
    'procedimentos.read': true,
    'procedimentos.create': true,
    'procedimentos.update': true,
    'procedimentos.delete': true,
    'procedimentos.configure': true,
    'combos.read': true,
    'combos.create': true,
    'combos.update': true,
    'combos.delete': true,
    'combos.configure': true,
    'relatorios.read': true,
    'relatorios.export': true,
    'pos.read': true,
    'pos.finalize': true,
    'configuracoes.read': true,
    'configuracoes.configure': true,
    'permissoes.read': true,
    'permissoes.configure': true,
  },
  gestor: {
    // Everything except permissions.configure
    'agenda.read': true,
    'agenda.create': true,
    'agenda.update': true,
    'agenda.delete': true,
    'agenda.confirm': true,
    'agenda.cancel': true,
    'clientes.read': true,
    'clientes.create': true,
    'clientes.update': true,
    'clientes.delete': true,
    'clientes.export': true,
    'procedimentos.read': true,
    'procedimentos.create': true,
    'procedimentos.update': true,
    'procedimentos.delete': true,
    'procedimentos.configure': true,
    'combos.read': true,
    'combos.create': true,
    'combos.update': true,
    'combos.delete': true,
    'combos.configure': true,
    'relatorios.read': true,
    'relatorios.export': true,
    'pos.read': true,
    'pos.finalize': true,
    'configuracoes.read': true,
    'configuracoes.configure': true,
    'permissoes.read': true,
    'permissoes.configure': false,
  },
  recepcao: {
    // Reception: agenda, clients, POS finalize, no delete/configure
    'agenda.read': true,
    'agenda.create': true,
    'agenda.update': true,
    'agenda.delete': false,
    'agenda.confirm': true,
    'agenda.cancel': true,
    'clientes.read': true,
    'clientes.create': true,
    'clientes.update': true,
    'clientes.delete': false,
    'clientes.export': false,
    'procedimentos.read': true,
    'procedimentos.create': false,
    'procedimentos.update': false,
    'procedimentos.delete': false,
    'procedimentos.configure': false,
    'combos.read': true,
    'combos.create': false,
    'combos.update': false,
    'combos.delete': false,
    'combos.configure': false,
    'relatorios.read': false,
    'relatorios.export': false,
    'pos.read': true,
    'pos.finalize': true,
    'configuracoes.read': false,
    'configuracoes.configure': false,
    'permissoes.read': false,
    'permissoes.configure': false,
  },
  profissional: {
    // Professional: own agenda read, own POS finalize, clients read
    'agenda.read': true,
    'agenda.create': false,
    'agenda.update': false,
    'agenda.delete': false,
    'agenda.confirm': false,
    'agenda.cancel': false,
    'clientes.read': true,
    'clientes.create': false,
    'clientes.update': false,
    'clientes.delete': false,
    'clientes.export': false,
    'procedimentos.read': true,
    'procedimentos.create': false,
    'procedimentos.update': false,
    'procedimentos.delete': false,
    'procedimentos.configure': false,
    'combos.read': true,
    'combos.create': false,
    'combos.update': false,
    'combos.delete': false,
    'combos.configure': false,
    'relatorios.read': false,
    'relatorios.export': false,
    'pos.read': true,
    'pos.finalize': true,
    'configuracoes.read': false,
    'configuracoes.configure': false,
    'permissoes.read': false,
    'permissoes.configure': false,
  },
};

let currentRoleMatrix: RoleMatrix = { ...defaultRoleMatrix };

export async function getUsers(): Promise<User[]> {
  await delay(300);
  return mockUsers.filter(user => user.active);
}

export async function updateUserRole({ userId, role }: UpdateUserRoleRequest): Promise<User> {
  await delay(500);
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  mockUsers[userIndex] = { ...mockUsers[userIndex], role };
  return mockUsers[userIndex];
}

export async function getRoleMatrix(): Promise<RoleMatrix> {
  await delay(300);
  return currentRoleMatrix;
}

export async function updateRoleMatrix({ role, permissions }: UpdateRoleMatrixRequest): Promise<void> {
  await delay(800);
  currentRoleMatrix[role] = { ...currentRoleMatrix[role], ...permissions };
}