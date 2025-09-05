import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Settings, Users } from "lucide-react";
import { useProcedures, useProfessionals, useProcedureOverrides, useToggleAvailability } from "../hooks";
import type { Procedure, Professional, ProcedureOverride } from "../types";

export function ProfessionalMatrix() {
  const { data: procedures = [], isLoading: proceduresLoading } = useProcedures();
  const { data: professionals = [], isLoading: professionalsLoading } = useProfessionals();
  const { data: overrides = [], isLoading: overridesLoading } = useProcedureOverrides();
  
  const toggleAvailability = useToggleAvailability();

  // Group procedures by category
  const proceduresByCategory = React.useMemo(() => {
    const grouped = procedures.reduce((acc, procedure) => {
      const category = procedure.category || 'Outros';
      if (!acc[category]) acc[category] = [];
      acc[category].push(procedure);
      return acc;
    }, {} as Record<string, Procedure[]>);
    
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [procedures]);

  // Create override lookup map
  const overrideMap = React.useMemo(() => {
    const map = new Map<string, ProcedureOverride>();
    overrides.forEach(override => {
      const key = `${override.professionalId}-${override.procedureId}`;
      map.set(key, override);
    });
    return map;
  }, [overrides]);

  const isEnabled = (professionalId: string, procedureId: string) => {
    const key = `${professionalId}-${procedureId}`;
    return overrideMap.has(key);
  };


  const handleToggle = (professionalId: string, procedureId: string, enabled: boolean) => {
    toggleAvailability.mutate({ professionalId, procedureId, enabled });
  };

  const isLoading = proceduresLoading || professionalsLoading || overridesLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Matriz Profissionais × Procedimentos</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie quais procedimentos cada profissional pode executar
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-full"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded w-full"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Matriz Profissionais × Procedimentos</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie quais procedimentos cada profissional pode executar
        </p>
      </div>

      {procedures.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum procedimento encontrado</h3>
              <p className="text-muted-foreground">
                Cadastre procedimentos primeiro na aba Procedimentos
              </p>
            </div>
          </CardContent>
        </Card>
      ) : professionals.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum profissional encontrado</h3>
              <p className="text-muted-foreground">
                Cadastre profissionais primeiro no menu Equipe
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-32">Profissional</TableHead>
                    {proceduresByCategory.map(([category, categoryProcedures]) => (
                      <TableHead key={category} className="text-center" colSpan={categoryProcedures.length}>
                        <div className="font-medium">{category}</div>
                      </TableHead>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableHead></TableHead>
                    {proceduresByCategory.map(([, categoryProcedures]) => 
                      categoryProcedures.map(procedure => (
                        <TableHead key={procedure.id} className="text-center min-w-24">
                          <div className="text-xs">{procedure.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {procedure.basePrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </div>
                        </TableHead>
                      ))
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {professionals.map(professional => (
                    <TableRow key={professional.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{professional.name}</div>
                          <div className="text-xs text-muted-foreground">{professional.role}</div>
                        </div>
                      </TableCell>
                      {procedures.map(procedure => {
                        const enabled = isEnabled(professional.id, procedure.id);
                        const isPending = toggleAvailability.isPending;

                        return (
                          <TableCell key={procedure.id} className="text-center">
                            <div className="flex items-center justify-center p-2">
                              <Switch
                                checked={enabled}
                                disabled={isPending}
                                onCheckedChange={(checked) => handleToggle(professional.id, procedure.id, checked)}
                                aria-label={`${professional.name} • ${procedure.name} • ${enabled ? 'habilitado' : 'desabilitado'}`}
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
        </Card>
      )}
    </div>
  );
}