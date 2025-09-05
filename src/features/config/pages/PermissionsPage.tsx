import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTab } from "@/features/permissions/components/UsersTab";
import { PermissionsMatrixTab } from "@/features/permissions/components/PermissionsMatrixTab";

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="matrix">Matriz de Permissões</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <UsersTab />
        </TabsContent>
        
        <TabsContent value="matrix" className="mt-6">
          <PermissionsMatrixTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}