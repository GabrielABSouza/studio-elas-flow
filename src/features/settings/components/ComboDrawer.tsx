import * as React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2, Package } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { comboSchema, type ComboFormData } from "../schemas";
import { useCreateCombo, useUpdateCombo, useProcedures } from "../hooks";
import type { Combo } from "../types";

interface ComboDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  combo?: Combo;
}

export function ComboDrawer({ 
  isOpen, 
  onClose, 
  combo 
}: ComboDrawerProps) {
  const isEditing = !!combo;
  const createMutation = useCreateCombo();
  const updateMutation = useUpdateCombo();
  const { data: procedures = [] } = useProcedures();
  
  const form = useForm<ComboFormData>({
    resolver: zodResolver(comboSchema),
    defaultValues: {
      name: combo?.name || "",
      description: combo?.description || "",
      items: combo?.items || [{ procedureId: "", quantity: 1 }],
      discountType: combo?.discountType || "percent",
      discountValue: combo?.discountValue || 0,
      validFrom: combo?.validFrom || "",
      validTo: combo?.validTo || "",
      active: combo?.active ?? true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedValues = form.watch();
  const { items, discountType, discountValue } = watchedValues;

  // Calculate combo preview
  const comboPreview = React.useMemo(() => {
    const selectedProcedures = items.map(item => {
      const procedure = procedures.find(p => p.id === item.procedureId);
      return procedure ? {
        ...procedure,
        quantity: item.quantity
      } : null;
    }).filter(Boolean);

    const totalPrice = selectedProcedures.reduce((acc, proc) => 
      acc + (proc!.basePrice * proc!.quantity), 0);

    const discountAmount = discountType === "percent" 
      ? (totalPrice * discountValue) / 100
      : discountValue;
    
    const finalPrice = Math.max(0, totalPrice - discountAmount);

    return {
      selectedProcedures,
      totalPrice,
      discountAmount,
      finalPrice,
      savings: totalPrice - finalPrice
    };
  }, [items, procedures, discountType, discountValue]);

  const onSubmit = async (data: ComboFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: combo.id, data });
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

  const addItem = () => {
    append({ procedureId: "", quantity: 1 });
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="flex items-center justify-between border-b pb-4">
          <DrawerTitle>
            {isEditing ? "Editar combo" : "Novo combo"}
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
                <Label htmlFor="name">Nome do combo</Label>
                <Input
                  id="name"
                  placeholder="Ex: Combo Beleza Total, Pacote Noiva..."
                  {...form.register("name")}
                  aria-invalid={!!form.formState.errors.name}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o que está incluído no combo..."
                  {...form.register("description")}
                  className="min-h-20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Itens do Combo */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Itens do Combo
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar item
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-start">
                    <div className="flex-1 space-y-2">
                      <Label>Procedimento</Label>
                      <Select
                        value={form.watch(`items.${index}.procedureId`)}
                        onValueChange={(value) => form.setValue(`items.${index}.procedureId`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um procedimento" />
                        </SelectTrigger>
                        <SelectContent>
                          {procedures
                            .filter(proc => proc.active)
                            .map((procedure) => (
                              <SelectItem key={procedure.id} value={procedure.id}>
                                <div className="flex justify-between w-full">
                                  <span>{procedure.name}</span>
                                  <span className="text-muted-foreground ml-2">
                                    {procedure.basePrice.toLocaleString("pt-BR", { 
                                      style: "currency", 
                                      currency: "BRL" 
                                    })}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-20 space-y-2">
                      <Label>Qtd</Label>
                      <Input
                        type="number"
                        min="1"
                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </div>
                    
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="mt-6 h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {form.formState.errors.items && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.items.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Desconto */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-3">
                Desconto
              </h3>
              
              {/* Tipo de Desconto */}
              <div className="space-y-3">
                <Label>Tipo de desconto</Label>
                <RadioGroup
                  value={discountType}
                  onValueChange={(value) => {
                    form.setValue("discountType", value as "percent" | "fixed");
                    form.setValue("discountValue", 0);
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
                      Valor fixo (R$)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Valor do Desconto */}
              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  {discountType === "percent" ? "Percentual de desconto" : "Valor do desconto"}
                </Label>
                <div className="relative">
                  <Input
                    id="discountValue"
                    type="number"
                    step={discountType === "percent" ? "0.1" : "0.01"}
                    min="0"
                    max={discountType === "percent" ? "100" : undefined}
                    placeholder={discountType === "percent" ? "10" : "50.00"}
                    {...form.register("discountValue", { valueAsNumber: true })}
                    aria-invalid={!!form.formState.errors.discountValue}
                  />
                  {discountType === "percent" && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </div>
                  )}
                  {discountType === "fixed" && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </div>
                  )}
                </div>
                {form.formState.errors.discountValue && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.discountValue.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prévia do Combo */}
          {comboPreview.selectedProcedures.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Prévia do Combo
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  {comboPreview.selectedProcedures.map((proc, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{proc!.name} {proc!.quantity > 1 && `(${proc!.quantity}x)`}</span>
                      <span>
                        {(proc!.basePrice * proc!.quantity).toLocaleString("pt-BR", { 
                          style: "currency", 
                          currency: "BRL" 
                        })}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>
                        {comboPreview.totalPrice.toLocaleString("pt-BR", { 
                          style: "currency", 
                          currency: "BRL" 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-destructive">
                      <span>Desconto:</span>
                      <span>
                        -{comboPreview.discountAmount.toLocaleString("pt-BR", { 
                          style: "currency", 
                          currency: "BRL" 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-emerald-600">
                        {comboPreview.finalPrice.toLocaleString("pt-BR", { 
                          style: "currency", 
                          currency: "BRL" 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validade */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-3">
                Período de Validade (opcional)
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Válido a partir de</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    {...form.register("validFrom")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="validTo">Válido até</Label>
                  <Input
                    id="validTo"
                    type="date"
                    {...form.register("validTo")}
                  />
                </div>
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
              Combo ativo
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