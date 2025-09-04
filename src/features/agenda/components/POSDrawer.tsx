import React, { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, CreditCard, Banknote, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { Appointment, ProcedureCatalog, ProcedureItem } from '../types';
import { useCompleteAppointment, useProceduresCatalog, useProfessionalsCatalog } from '../hooks';
import { usePaymentMethods } from '../../settings/hooks';
import { moneyFmt } from '../utils';

const itemSchema = z.object({
  id: z.string(),
  procedureId: z.string(),
  professionalId: z.string(),
  name: z.string().min(1),
  price: z.number().min(0),
  qty: z.number().min(1),
});

const posSchema = z.object({
  items: z.array(itemSchema).min(1),
  paymentMethod: z.string().min(1),
  discountPct: z.number().min(0).max(100).optional(),
  discountValue: z.number().min(0).optional(),
  finalTotal: z.number().min(0).optional(),
  commissionPct: z.number().min(0).max(100),
});

type POSFormData = z.infer<typeof posSchema>;

interface POSDrawerProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (posData: {
    items: Array<{ id: string; procedureId: string; name: string; price: number; qty: number; professionalId: string }>; 
    total: number; 
    paymentMethod: string;
  }) => void;
}

// Payment methods are now managed via Settings

function EditIconButton({
  active, label, onClick,
}: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border
                  hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  ${active ? "bg-accent/60" : "bg-card"}`}
    >
      <Pencil className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
    </button>
  );
}

function ProcedureRow({
  idx,
  disabled,
  procedures,
  professionals,
  register,
  setValue,
  remove,
  watch,
  defaultProfessionalId,
}: {
  idx: number;
  disabled: boolean;
  procedures: ProcedureCatalog[];
  professionals: { id: string; name: string }[];
  register: any;
  setValue: (name: string, val: any) => void;
  remove: (index: number) => void;
  watch: any;
  defaultProfessionalId: string;
}) {
  const selectedProcedureId = watch(`items.${idx}.procedureId`);
  
  const onSelectProcedure = (id: string) => {
    const p = procedures.find((x) => x.id === id);
    if (!p) return;
    setValue(`items.${idx}.procedureId`, p.id);
    setValue(`items.${idx}.name`, p.name);
    setValue(`items.${idx}.price`, p.defaultPrice);
    // se ainda não houver profissional atribuído, assume o do agendamento
    const currentProf = watch(`items.${idx}.professionalId`);
    if (!currentProf) setValue(`items.${idx}.professionalId`, defaultProfessionalId);
  };

  return (
    <div className="grid grid-cols-[minmax(220px,1fr)_minmax(180px,1fr)_110px_88px_36px] items-center gap-2 rounded-lg border bg-card p-2">
      {/* Procedimento */}
      <select
        {...register(`items.${idx}.procedureId`)}
        disabled={disabled}
        onChange={(e) => onSelectProcedure(e.target.value)}
        className="rounded-md border px-2 py-1 text-sm disabled:opacity-60 disabled:bg-muted/50"
      >
        <option value="">{procedures.length ? "Selecione um procedimento" : "Carregando..."}</option>
        {procedures.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {/* Profissional responsável */}
      <select
        {...register(`items.${idx}.professionalId`)}
        disabled={disabled}
        className="rounded-md border px-2 py-1 text-sm disabled:opacity-60 disabled:bg-muted/50"
      >
        <option value="">{professionals.length ? "Selecione um profissional" : "Carregando..."}</option>
        {professionals.map((pro) => (
          <option key={pro.id} value={pro.id}>{pro.name}</option>
        ))}
      </select>

      {/* Preço */}
      <input
        type="number"
        step="0.01"
        {...register(`items.${idx}.price`, { valueAsNumber: true })}
        disabled={disabled}
        className="rounded-md border px-2 py-1 text-sm disabled:opacity-60 disabled:bg-muted/50"
        placeholder="0.00"
      />

      {/* Qtd */}
      <input
        type="number"
        {...register(`items.${idx}.qty`, { valueAsNumber: true })}
        disabled={false}
        className="rounded-md border px-2 py-1 text-sm"
        placeholder="1"
        min="1"
      />

      {/* Remover */}
      <button
        type="button"
        onClick={() => remove(idx)}
        disabled={disabled}
        className="rounded-md border px-2 py-1 text-sm hover:bg-accent disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Remover procedimento"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function POSDrawer({ appointment, isOpen, onClose, onComplete }: POSDrawerProps) {
  const [editItems, setEditItems] = useState(false);
  const [editFinalTotal, setEditFinalTotal] = useState(false);
  const [canEditCommission, setCanEditCommission] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const editItemsRef = useRef<HTMLDivElement>(null);
  const editFinalTotalRef = useRef<HTMLDivElement>(null);
  const editCommissionRef = useRef<HTMLDivElement>(null);
  
  const completeAppointment = useCompleteAppointment();
  const { data: procedures = [] } = useProceduresCatalog();
  const { data: professionals = [] } = useProfessionalsCatalog();
  const { data: paymentMethodsFromSettings = [] } = usePaymentMethods();
  
  const form = useForm<POSFormData>({
    resolver: zodResolver(posSchema),
    defaultValues: {
      items: appointment.procedures.map(proc => ({
        id: crypto.randomUUID(),
        procedureId: proc.id,
        professionalId: appointment.professionalId,
        name: proc.name,
        price: proc.price,
        qty: 1,
      })),
      paymentMethod: paymentMethodsFromSettings?.[0]?.id || '',
      discountPct: 0,
      discountValue: 0,
      finalTotal: undefined,
      commissionPct: 40, // Padrão 40%
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedValues = form.watch();
  const { items = [], discountPct = 0, discountValue = 0, finalTotal, commissionPct = 40, paymentMethod } = watchedValues;

  // Cálculos baseados nos items
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = discountValue || (subtotal * (discountPct / 100));
  const calculatedTotal = subtotal - discountAmount;
  const actualTotal = finalTotal !== undefined ? finalTotal : calculatedTotal;
  const commissionAmount = actualTotal * (commissionPct / 100);

  // Fee calculation
  const selectedPaymentMethod = paymentMethodsFromSettings.find(pm => pm.id === paymentMethod);
  const feeAmount = selectedPaymentMethod 
    ? selectedPaymentMethod.feeType === "percent" 
      ? (actualTotal * selectedPaymentMethod.feeValue) / 100
      : selectedPaymentMethod.feeValue
    : 0;
  const netAmount = actualTotal - feeAmount;

  // Focus management
  useEffect(() => {
    if (isOpen && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard handling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Click outside to exit edit modes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Exit edit items mode if clicking outside
      if (editItems && editItemsRef.current && !editItemsRef.current.contains(target)) {
        setEditItems(false);
      }
      
      // Exit edit final total mode if clicking outside
      if (editFinalTotal && editFinalTotalRef.current && !editFinalTotalRef.current.contains(target)) {
        setEditFinalTotal(false);
      }
      
      // Exit edit commission mode if clicking outside
      if (canEditCommission && editCommissionRef.current && !editCommissionRef.current.contains(target)) {
        setCanEditCommission(false);
      }
    };

    if (editItems || editFinalTotal || canEditCommission) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editItems, editFinalTotal, canEditCommission]);

  const onSubmit = async (data: POSFormData) => {
    if (onComplete) {
      // Pass the POS data to parent for handling
      onComplete({
        items: data.items,
        total: actualTotal,
        paymentMethod: data.paymentMethod,
      });
    } else {
      // Fallback: handle completion directly (for backwards compatibility)
      try {
        await completeAppointment.mutateAsync({
          appointmentId: appointment.id,
          data: {
            items: data.items,
            total: actualTotal,
            paymentMethod: data.paymentMethod,
          },
        });

        toast.success('Agendamento finalizado com sucesso!', {
          description: `Total: ${moneyFmt.format(actualTotal)}`,
        });

        onClose();
      } catch (error) {
        toast.error('Erro ao finalizar agendamento', {
          description: 'Tente novamente ou contate o suporte.',
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[920px] lg:max-w-[1040px] max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pos-title"
      >
        <DialogDescription className="sr-only">
          Finalizar atendimento - registre os procedimentos realizados e forma de pagamento
        </DialogDescription>
        <DialogTitle className="sr-only">
          Finalizar Atendimento
        </DialogTitle>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" id="pos-title" ref={titleRef} tabIndex={-1}>
              Finalizar Atendimento
            </h3>
          </div>

          {/* grid principal */}
          <div className="mt-4 grid gap-6 md:grid-cols-[1.4fr_1fr]">
            {/* Coluna esquerda — Cliente + Procedimentos */}
            <section className="space-y-4">
              <div className="rounded-xl border bg-muted/30 p-3">
                <div className="text-sm font-medium">Cliente</div>
                <div className="mt-2 rounded-lg bg-card px-3 py-2 text-sm text-muted-foreground">
                  {appointment.customer.name}
                  <span className="ml-2 text-xs">
                    {appointment.startsAt.slice(11, 16)} – {appointment.endsAt.slice(11, 16)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Procedimentos</div>
                <EditIconButton
                  active={editItems}
                  label="Editar procedimentos"
                  onClick={() => setEditItems((v) => !v)}
                />
              </div>

              <div className="space-y-2" ref={editItemsRef}>
                {/* Headers */}
                <div className="grid grid-cols-[minmax(220px,1fr)_minmax(180px,1fr)_110px_88px_36px] items-center gap-2 px-2 text-xs text-muted-foreground">
                  <div>Procedimento</div>
                  <div>Profissional</div>
                  <div>Preço (R$)</div>
                  <div>Qtd</div>
                  <div></div>
                </div>
                
                {fields.map((field, idx) => (
                  <ProcedureRow
                    key={field.id}
                    idx={idx}
                    disabled={!editItems}
                    procedures={procedures}
                    professionals={professionals}
                    register={form.register}
                    setValue={form.setValue}
                    remove={remove}
                    watch={form.watch}
                    defaultProfessionalId={appointment.professionalId}
                  />
                ))}

                <button
                  type="button"
                  onClick={() =>
                    append({
                      id: crypto.randomUUID(),
                      procedureId: "",
                      professionalId: appointment.professionalId,
                      name: "",
                      price: 0,
                      qty: 1,
                    })
                  }
                  disabled={!editItems}
                  className="rounded-md border px-3 py-2 text-sm hover:bg-accent disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  + Adicionar procedimento
                </button>
              </div>
            </section>

            {/* Coluna direita — Resumo, desconto, comissão, pagamento */}
            <aside className="space-y-4">
              <div className="rounded-xl border bg-card p-3" ref={editFinalTotalRef}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Valores</div>
                  <EditIconButton
                    active={editFinalTotal}
                    label="Editar valor final"
                    onClick={() => setEditFinalTotal((v) => !v)}
                  />
                </div>

                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>

                  {!editFinalTotal ? (
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Desconto (R$)</span>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8"
                          {...form.register("discountValue", { valueAsNumber: true })}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Desconto (%)</span>
                        <Input
                          type="number"
                          step="1"
                          className="h-8"
                          {...form.register("discountPct", { valueAsNumber: true })}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="mt-2 flex items-center justify-between gap-2">
                      <span>Valor final</span>
                      <Input
                        type="number"
                        step="0.01"
                        className="w-32 h-8"
                        {...form.register("finalTotal", { valueAsNumber: true })}
                      />
                    </label>
                  )}

                  <div className="flex justify-between border-t pt-2 text-base font-semibold">
                    <span>Total</span>
                    <span className="text-primary">R$ {actualTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-3" ref={editCommissionRef}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">% Comissão</div>
                  <EditIconButton
                    active={canEditCommission}
                    label="Editar comissão"
                    onClick={() => setCanEditCommission((v) => !v)}
                  />
                </div>
                <div className="mt-2 grid grid-cols-2 items-center gap-2 text-sm">
                  <Input
                    type="number"
                    step="0.5"
                    disabled={!canEditCommission}
                    className="h-8"
                    {...form.register("commissionPct", { valueAsNumber: true })}
                  />
                  <div className="text-right font-medium">R$ {commissionAmount.toFixed(2)}</div>
                </div>
              </div>

              {/* Fee Breakdown */}
              {selectedPaymentMethod && feeAmount > 0 && (
                <div className="rounded-xl border bg-card p-3">
                  <div className="text-sm font-medium mb-2">Custo da Modalidade</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa</span>
                      <span>
                        {selectedPaymentMethod.feeType === "percent" 
                          ? `${selectedPaymentMethod.feeValue}%`
                          : selectedPaymentMethod.feeValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custo</span>
                      <span className="text-destructive">
                        {feeAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-1 font-medium">
                      <span>Recebido Líquido</span>
                      <span className="text-emerald-600">
                        {netAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border bg-card p-3">
                <div className="text-sm font-medium">Forma de Pagamento</div>
                <Select
                  value={form.watch('paymentMethod')}
                  onValueChange={(value) => form.setValue('paymentMethod', value as any)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodsFromSettings
                      .filter(method => method.active)
                      .map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <div className="flex flex-col">
                              <span>{method.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {method.feeType === "percent" 
                                  ? `${method.feeValue}%`
                                  : method.feeValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                                }
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </aside>
          </div>

          {/* footer fixo do modal */}
          <div className="mt-6 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={completeAppointment.isPending}>
              {completeAppointment.isPending ? 'Finalizando...' : 'Finalizar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}