import * as React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { X, Clock, DollarSign, Percent } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { procedureSchema, type ProcedureFormData } from "../schemas";
import { useCreateProcedure, useUpdateProcedure } from "../hooks";
import type { Procedure } from "../types";

interface ProcedureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  procedure?: Procedure;
}

export function ProcedureDrawer({ 
  isOpen, 
  onClose, 
  procedure 
}: ProcedureDrawerProps) {
  const isEditing = !!procedure;
  const createMutation = useCreateProcedure();
  const updateMutation = useUpdateProcedure();
  
  const form = useForm<ProcedureFormData>({
    resolver: zodResolver(procedureSchema),
    defaultValues: {
      name: procedure?.name || "",
      category: procedure?.category || "",
      duration: procedure?.duration || 60,
      basePrice: procedure?.basePrice || 0,
      baseCommissionPct: procedure?.baseCommissionPct || 40,
      active: procedure?.active ?? true,
    },
  });

  const watchedValues = form.watch();
  const { duration, basePrice, baseCommissionPct } = watchedValues;

  const formatDuration = React.useMemo(() => {
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    if (hours === 0) return `${mins} minutos`;
    if (mins === 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}min`;
  }, [duration]);

  const commissionPreview = React.useMemo(() => {
    if (!basePrice || !baseCommissionPct) return null;
    const commissionAmount = (basePrice * baseCommissionPct) / 100;
    return commissionAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }, [basePrice, baseCommissionPct]);

  const onSubmit = async (data: ProcedureFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: procedure.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
      form.reset();
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="flex items-center justify-between border-b pb-4">
          <DrawerTitle>
            {isEditing ? "Editar procedimento" : "Novo procedimento"}
          </DrawerTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DrawerHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-3">
                Informações Básicas
              </h3>
              
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome do procedimento</Label>
                <Input
                  id="name"
                  placeholder="Ex: Corte Feminino, Manicure..."
                  {...form.register("name")}
                  aria-invalid={!!form.formState.errors.name}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoria (opcional)</Label>
                <Input
                  id="category"
                  placeholder="Ex: Cabelo, Unhas, Estética..."
                  {...form.register("category")}
                />
              </div>

              {/* Duração */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (minutos)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="60"
                    className="pl-9"
                    {...form.register("duration", { valueAsNumber: true })}
                    aria-invalid={!!form.formState.errors.duration}
                  />
                </div>
                {duration > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formatDuration}
                  </p>
                )}
                {form.formState.errors.duration && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.duration.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preço e Comissão */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-3">
                Preço e Comissão
              </h3>
              
              {/* Preço Base */}
              <div className="space-y-2">
                <Label htmlFor="basePrice">Preço base</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    {...form.register("basePrice", { valueAsNumber: true })}
                    aria-invalid={!!form.formState.errors.basePrice}
                  />
                </div>
                {form.formState.errors.basePrice && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.basePrice.message}
                  </p>
                )}
              </div>

              {/* Percentual Comissão */}
              <div className="space-y-2">
                <Label htmlFor="baseCommissionPct">Comissão padrão (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="baseCommissionPct"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    placeholder="40"
                    className="pl-9"
                    {...form.register("baseCommissionPct", { valueAsNumber: true })}
                    aria-invalid={!!form.formState.errors.baseCommissionPct}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </div>
                </div>
                {commissionPreview && (
                  <p className="text-xs text-muted-foreground">
                    Comissão: {commissionPreview}
                  </p>
                )}
                {form.formState.errors.baseCommissionPct && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.baseCommissionPct.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={form.watch("active")}
              onCheckedChange={(checked) => form.setValue("active", checked)}
            />
            <Label htmlFor="active" className="cursor-pointer">
              Procedimento ativo
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Salvando..."
                : isEditing
                ? "Atualizar"
                : "Criar"}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}