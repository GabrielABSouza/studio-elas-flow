import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Percent, DollarSign } from "lucide-react";
import { usePaymentMethods, useDeletePaymentMethod } from "../hooks";
import { PaymentMethodDrawer } from "./PaymentMethodDrawer";
import type { PaymentMethod } from "../types";

interface PaymentMethodsListProps {
  canManage?: boolean;
}

export function PaymentMethodsList({ canManage = true }: PaymentMethodsListProps) {
  const { data: paymentMethods, isLoading } = usePaymentMethods();
  const deleteMutation = useDeletePaymentMethod();
  
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedMethod, setSelectedMethod] = React.useState<PaymentMethod | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [methodToDelete, setMethodToDelete] = React.useState<PaymentMethod | undefined>();

  const handleEdit = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setDrawerOpen(true);
  };

  const handleDelete = (method: PaymentMethod) => {
    setMethodToDelete(method);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!methodToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(methodToDelete.id);
      setDeleteDialogOpen(false);
      setMethodToDelete(undefined);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleNewMethod = () => {
    setSelectedMethod(undefined);
    setDrawerOpen(true);
  };

  const formatFee = (method: PaymentMethod) => {
    if (method.feeType === "percent") {
      return `${method.feeValue}%`;
    } else {
      return method.feeValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Formas de Pagamento</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie as formas de pagamento e seus custos
            </p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Nova forma
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded mb-3"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-muted rounded w-16"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Formas de Pagamento</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie as formas de pagamento e seus custos
            </p>
          </div>
          <Button onClick={handleNewMethod} disabled={!canManage}>
            <Plus className="h-4 w-4 mr-2" />
            Nova forma
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paymentMethods?.map((method) => (
            <Card key={method.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{method.name}</CardTitle>
                  <Badge variant={method.active ? "default" : "secondary"}>
                    {method.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  {method.feeType === "percent" ? (
                    <Percent className="h-3 w-3" />
                  ) : (
                    <DollarSign className="h-3 w-3" />
                  )}
                  {method.feeType === "percent" ? "Percentual" : "Valor fixo"}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="text-2xl font-semibold">
                  {formatFee(method)}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(method)}
                    disabled={!canManage}
                    className="flex-1"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(method)}
                    disabled={!canManage}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {paymentMethods?.length === 0 && (
          <Card className="py-12">
            <CardContent className="text-center">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma forma de pagamento</h3>
              <p className="text-muted-foreground mb-4">
                Adicione formas de pagamento para calcular custos nos atendimentos
              </p>
              <Button onClick={handleNewMethod}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira forma
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Drawer for Create/Edit */}
      <PaymentMethodDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedMethod(undefined);
        }}
        paymentMethod={selectedMethod}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover forma de pagamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{methodToDelete?.name}"? 
              Esta ação não pode ser desfeita e pode afetar relatórios históricos.
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