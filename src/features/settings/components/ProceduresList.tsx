import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Clock, DollarSign } from "lucide-react";
import { useProcedures, useDeleteProcedure } from "../hooks";
import { ProcedureDrawer } from "./ProcedureDrawer";
import type { Procedure } from "../types";

export function ProceduresList() {
  const { data: procedures, isLoading } = useProcedures();
  const deleteMutation = useDeleteProcedure();
  
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedProcedure, setSelectedProcedure] = React.useState<Procedure | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [procedureToDelete, setProcedureToDelete] = React.useState<Procedure | undefined>();

  const handleEdit = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setDrawerOpen(true);
  };

  const handleDelete = (procedure: Procedure) => {
    setProcedureToDelete(procedure);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!procedureToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(procedureToDelete.id);
      setDeleteDialogOpen(false);
      setProcedureToDelete(undefined);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleNewProcedure = () => {
    setSelectedProcedure(undefined);
    setDrawerOpen(true);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatCommission = (percentage: number) => {
    return `${percentage}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Procedimentos</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie os serviços oferecidos e seus preços
            </p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Novo procedimento
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-1/6"></div>
                  <div className="h-4 bg-muted rounded w-1/6"></div>
                  <div className="h-4 bg-muted rounded w-1/6"></div>
                  <div className="h-4 bg-muted rounded w-1/6"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Procedimentos</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie os serviços oferecidos e seus preços
            </p>
          </div>
          <Button onClick={handleNewProcedure}>
            <Plus className="h-4 w-4 mr-2" />
            Novo procedimento
          </Button>
        </div>

        {procedures?.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum procedimento cadastrado</h3>
                <p className="text-muted-foreground mb-4">
                  Adicione procedimentos para começar a agendar serviços
                </p>
                <Button onClick={handleNewProcedure}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeiro procedimento
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Preço Base</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {procedures?.map((procedure) => (
                    <TableRow key={procedure.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{procedure.name}</div>
                          {procedure.category && (
                            <div className="text-sm text-muted-foreground">{procedure.category}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {procedure.category || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatDuration(procedure.duration)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatPrice(procedure.basePrice)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCommission(procedure.baseCommissionPct)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={procedure.active ? "default" : "secondary"}>
                          {procedure.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(procedure)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(procedure)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Drawer for Create/Edit */}
      <ProcedureDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedProcedure(undefined);
        }}
        procedure={selectedProcedure}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover procedimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{procedureToDelete?.name}"? 
              Esta ação não pode ser desfeita e pode afetar agendamentos futuros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}