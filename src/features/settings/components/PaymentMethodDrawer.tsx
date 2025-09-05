import * as React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { X, Calculator } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentMethodSchema, type PaymentMethodFormData } from "../schemas";
import { useCreatePaymentMethod, useUpdatePaymentMethod } from "../hooks";
import type { PaymentMethod } from "../types";

interface PaymentMethodDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod?: PaymentMethod;
}

export function PaymentMethodDrawer({ 
  isOpen, 
  onClose, 
  paymentMethod 
}: PaymentMethodDrawerProps) {
  const isEditing = !!paymentMethod;
  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();
  
  const form = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: paymentMethod?.name || "",
      feeType: paymentMethod?.feeType || "percent",
      feeValue: paymentMethod?.feeValue || 0,
      active: paymentMethod?.active ?? true,
    },
  });

  const watchedValues = form.watch();
  const { feeType, feeValue } = watchedValues;

  const calculatePreview = React.useMemo(() => {
    const sampleAmount = 100; // R$ 100 como exemplo
    
    if (feeType === "percent") {
      const fee = (sampleAmount * feeValue) / 100;
      const net = sampleAmount - fee;
      return {
        fee: fee.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        net: net.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        feeFormatted: `${feeValue}%`
      };
    } else {
      const fee = feeValue;
      const net = sampleAmount - fee;
      return {
        fee: fee.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        net: net.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        feeFormatted: fee.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      };
    }
  }, [feeType, feeValue]);

  const onSubmit = async (data: PaymentMethodFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: paymentMethod.id, data });
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
            {isEditing ? "Editar forma de pagamento" : "Nova forma de pagamento"}
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
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da forma de pagamento</Label>
            <Input
              id="name"
              placeholder="Ex: PIX, Cartão Débito, Dinheiro..."
              {...form.register("name")}
              aria-invalid={!!form.formState.errors.name}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Tipo de Custo */}
          <div className="space-y-4">
            <Label>Tipo de custo</Label>
            <RadioGroup
              value={feeType}
              onValueChange={(value) => {
                form.setValue("feeType", value as "percent" | "fixed");
                form.setValue("feeValue", 0); // Reset value when type changes
              }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percent" id="percent" />
                <Label htmlFor="percent" className="cursor-pointer">
                  Percentual (%)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed" className="cursor-pointer">
                  Fixo (R$)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Valor do Custo */}
          <div className="space-y-2">
            <Label htmlFor="feeValue">
              {feeType === "percent" ? "Percentual" : "Valor fixo"}
            </Label>
            <div className="relative">
              <Input
                id="feeValue"
                type="number"
                step={feeType === "percent" ? "0.01" : "0.01"}
                min="0"
                max={feeType === "percent" ? "100" : undefined}
                placeholder={feeType === "percent" ? "Ex: 2.49" : "Ex: 1.50"}
                {...form.register("feeValue", { valueAsNumber: true })}
                aria-invalid={!!form.formState.errors.feeValue}
              />
              {feeType === "percent" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </div>
              )}
              {feeType === "fixed" && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </div>
              )}
            </div>
            {form.formState.errors.feeValue && (
              <p className="text-sm text-destructive">
                {form.formState.errors.feeValue.message}
              </p>
            )}
          </div>

          {/* Preview de Cálculo */}
          {feeValue > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Prévia (R$ 100,00)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Taxa</p>
                    <p className="font-medium">{calculatePreview.feeFormatted}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Custo</p>
                    <p className="font-medium text-destructive">{calculatePreview.fee}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Líquido</p>
                    <p className="font-medium text-emerald-600">{calculatePreview.net}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Ativo */}
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={form.watch("active")}
              onCheckedChange={(checked) => form.setValue("active", checked)}
            />
            <Label htmlFor="active" className="cursor-pointer">
              Forma de pagamento ativa
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