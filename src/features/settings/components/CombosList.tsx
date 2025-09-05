import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Package, Percent, DollarSign, Calendar } from "lucide-react";
import { useCombos, useDeleteCombo } from "../hooks";
import { ComboDrawer } from "./ComboDrawer";
import type { Combo } from "../types";

export function CombosList() {
  const { data: combos, isLoading } = useCombos();
  const deleteMutation = useDeleteCombo();
  
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedCombo, setSelectedCombo] = React.useState<Combo | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [comboToDelete, setComboToDelete] = React.useState<Combo | undefined>();

  const handleEdit = (combo: Combo) => {
    setSelectedCombo(combo);
    setDrawerOpen(true);
  };

  const handleDelete = (combo: Combo) => {
    setComboToDelete(combo);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!comboToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(comboToDelete.id);
      setDeleteDialogOpen(false);
      setComboToDelete(undefined);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleNewCombo = () => {
    setSelectedCombo(undefined);
    setDrawerOpen(true);
  };

  const formatDiscount = (combo: Combo) => {
    if (combo.discountType === "percent") {
      return `${combo.discountValue}%`;
    } else {
      return combo.discountValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
  };

  const formatDateRange = (combo: Combo) => {
    if (!combo.validFrom && !combo.validTo) return "Sempre válido";
    
    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString("pt-BR");
    };

    if (combo.validFrom && combo.validTo) {
      return `${formatDate(combo.validFrom)} até ${formatDate(combo.validTo)}`;
    }
    if (combo.validFrom) {
      return `A partir de ${formatDate(combo.validFrom)}`;
    }
    if (combo.validTo) {
      return `Até ${formatDate(combo.validTo)}`;
    }
    return "—";
  };

  const isValidToday = (combo: Combo) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (combo.validFrom) {
      const fromDate = new Date(combo.validFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (today < fromDate) return false;
    }
    
    if (combo.validTo) {
      const toDate = new Date(combo.validTo);
      toDate.setHours(23, 59, 59, 999);
      if (today > toDate) return false;
    }
    
    return true;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Combos</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie pacotes de serviços com desconto
            </p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Novo combo
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-1/6"></div>
                  <div className="h-4 bg-muted rounded w-1/6"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
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
            <h3 className="text-lg font-semibold">Combos</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie pacotes de serviços com desconto
            </p>
          </div>
          <Button onClick={handleNewCombo}>
            <Plus className="h-4 w-4 mr-2" />
            Novo combo
          </Button>
        </div>

        {combos?.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum combo cadastrado</h3>
                <p className="text-muted-foreground mb-4">
                  Crie combos para oferecer pacotes de serviços com desconto
                </p>
                <Button onClick={handleNewCombo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeiro combo
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
                    <TableHead>Itens</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combos?.map((combo) => {
                    const validToday = isValidToday(combo);
                    
                    return (
                      <TableRow key={combo.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{combo.name}</div>
                            {combo.description && (
                              <div className="text-sm text-muted-foreground">{combo.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {combo.items.length} {combo.items.length === 1 ? 'item' : 'itens'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {combo.discountType === "percent" ? (
                              <Percent className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <DollarSign className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="font-medium">{formatDiscount(combo)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className={validToday ? "" : "text-muted-foreground"}>
                              {formatDateRange(combo)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={combo.active ? "default" : "secondary"}>
                              {combo.active ? "Ativo" : "Inativo"}
                            </Badge>
                            {combo.active && !validToday && (
                              <Badge variant="outline" className="text-xs">
                                Fora da validade
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(combo)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(combo)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Drawer for Create/Edit */}
      <ComboDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedCombo(undefined);
        }}
        combo={selectedCombo}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover combo?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{comboToDelete?.name}"? 
              Esta ação não pode ser desfeita e pode afetar vendas futuras.
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