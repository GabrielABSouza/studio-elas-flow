import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import { useRoleMatrix, useUpdateRoleMatrix } from "../hooks";
import type { Role, Resource, Action, Permission, RoleMatrix } from "../types";

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  gestor: 'Gestor',
  recepcao: 'Recepção',
  profissional: 'Profissional',
};

const RESOURCE_LABELS: Record<Resource, string> = {
  agenda: 'Agenda',
  clientes: 'Clientes',
  procedimentos: 'Procedimentos',
  combos: 'Combos',
  relatorios: 'Relatórios',
  pos: 'POS',
  configuracoes: 'Configurações',
  permissoes: 'Permissões',
};

const ACTION_LABELS: Record<Action, string> = {
  read: 'Visualizar',
  create: 'Criar',
  update: 'Editar',
  delete: 'Excluir',
  export: 'Exportar',
  confirm: 'Confirmar',
  finalize: 'Finalizar',
  cancel: 'Cancelar',
  configure: 'Configurar',
};

const RESOURCES: Resource[] = [
  'agenda',
  'clientes', 
  'procedimentos',
  'combos',
  'relatorios',
  'pos',
  'configuracoes',
  'permissoes',
];

const ACTIONS: Action[] = [
  'read',
  'create',
  'update', 
  'delete',
  'export',
  'confirm',
  'finalize',
  'cancel',
  'configure',
];

export function PermissionsMatrixTab() {
  const [selectedRole, setSelectedRole] = useState<Role>('gestor');
  const [pendingChanges, setPendingChanges] = useState<Record<Permission, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  const { data: roleMatrix, isLoading } = useRoleMatrix();
  const updateRoleMatrix = useUpdateRoleMatrix();

  const currentRolePermissions = roleMatrix?.[selectedRole] || {};
  
  // Merge current permissions with pending changes
  const effectivePermissions = { ...currentRolePermissions, ...pendingChanges };

  const handleToggle = (resource: Resource, action: Action, enabled: boolean) => {
    const permission: Permission = `${resource}.${action}`;
    const newPendingChanges = { ...pendingChanges, [permission]: enabled };
    setPendingChanges(newPendingChanges);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!hasChanges || Object.keys(pendingChanges).length === 0) return;
    
    updateRoleMatrix.mutate({
      role: selectedRole,
      permissions: pendingChanges,
    }, {
      onSuccess: () => {
        setPendingChanges({});
        setHasChanges(false);
      },
    });
  };

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setPendingChanges({});
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Permissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-40"></div>
            <div className="h-64 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Permissões</CardTitle>
        <div className="flex items-center gap-2">
          <label htmlFor="role-select" className="text-sm font-medium">
            Papel:
          </label>
          <Select value={selectedRole} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-40" id="role-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_LABELS).map(([role, label]) => (
                <SelectItem key={role} value={role}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-32">Recurso</TableHead>
                {ACTIONS.map((action) => (
                  <TableHead key={action} className="text-center min-w-24">
                    <div className="text-xs font-medium">
                      {ACTION_LABELS[action]}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {RESOURCES.map((resource) => (
                <TableRow key={resource}>
                  <TableCell className="font-medium">
                    {RESOURCE_LABELS[resource]}
                  </TableCell>
                  {ACTIONS.map((action) => {
                    const permission: Permission = `${resource}.${action}`;
                    const enabled = effectivePermissions[permission] || false;
                    const isPending = permission in pendingChanges;
                    
                    return (
                      <TableCell key={action} className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={enabled}
                            onCheckedChange={(checked) => handleToggle(resource, action, checked)}
                            aria-label={`${ROLE_LABELS[selectedRole]} • ${RESOURCE_LABELS[resource]} • ${ACTION_LABELS[action]} • ${enabled ? 'permitido' : 'negado'}`}
                            className={isPending ? 'ring-2 ring-primary/20' : ''}
                          />
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {hasChanges && (
        <CardFooter className="border-t bg-muted/20">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {Object.keys(pendingChanges).length} alteração(ões) pendente(s)
            </p>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || updateRoleMatrix.isPending}
              size="sm"
            >
              {updateRoleMatrix.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar alterações
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}