export type Role = 'admin' | 'gestor' | 'recepcao' | 'profissional';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export type Resource = 
  | 'agenda' 
  | 'clientes' 
  | 'procedimentos' 
  | 'combos' 
  | 'relatorios' 
  | 'pos' 
  | 'configuracoes' 
  | 'permissoes';

export type Action = 
  | 'read' 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'export' 
  | 'confirm' 
  | 'finalize' 
  | 'cancel' 
  | 'configure';

export type Permission = `${Resource}.${Action}`;

export type RoleMatrix = Record<Role, Record<Permission, boolean>>;

export interface UpdateUserRoleRequest {
  userId: string;
  role: Role;
}

export interface UpdateRoleMatrixRequest {
  role: Role;
  permissions: Record<Permission, boolean>;
}