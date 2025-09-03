import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, DollarSign, CreditCard, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { Appointment, PaymentMethod } from '../types';
import { useCompleteAppointment } from '../hooks';
import { moneyFmt } from '../utils';

const posSchema = z.object({
  paymentMethod: z.enum(['cash', 'pix', 'credit', 'debit', 'mixed']),
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
}

const paymentMethods = [
  { value: 'cash', label: 'Dinheiro', icon: Banknote },
  { value: 'pix', label: 'PIX', icon: DollarSign },
  { value: 'credit', label: 'Cartão de Crédito', icon: CreditCard },
  { value: 'debit', label: 'Cartão de Débito', icon: CreditCard },
  { value: 'mixed', label: 'Misto', icon: DollarSign },
];

export function POSDrawer({ appointment, isOpen, onClose }: POSDrawerProps) {
  const [editMode, setEditMode] = useState<'items' | 'final' | 'commission' | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const completeAppointment = useCompleteAppointment();
  
  const subtotal = appointment.procedures.reduce((sum, proc) => sum + proc.price, 0);
  
  const form = useForm<POSFormData>({
    resolver: zodResolver(posSchema),
    defaultValues: {
      paymentMethod: 'cash',
      discountPct: 0,
      discountValue: 0,
      finalTotal: subtotal,
      commissionPct: 40, // Padrão 40%
    },
  });

  const watchedValues = form.watch();
  const { discountPct = 0, discountValue = 0, finalTotal, commissionPct = 40 } = watchedValues;

  // Cálculos
  const discountAmount = discountValue || (subtotal * (discountPct / 100));
  const calculatedTotal = subtotal - discountAmount;
  const actualTotal = finalTotal !== undefined ? finalTotal : calculatedTotal;
  const commissionAmount = actualTotal * (commissionPct / 100);

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

  const onSubmit = async (data: POSFormData) => {
    try {
      await completeAppointment.mutateAsync({
        appointmentId: appointment.id,
        data: {
          items: appointment.procedures.map(proc => ({
            procedureId: proc.id,
            name: proc.name,
            price: proc.price,
            quantity: 1,
            professionalId: appointment.professionalId,
          })),
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pos-title"
      >
        <DialogHeader>
          <DialogTitle id="pos-title" ref={titleRef} tabIndex={-1}>
            Finalizar Atendimento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Informações do Cliente */}
          <div className="space-y-2">
            <h3 className="font-semibold">Cliente</h3>
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium">{appointment.customer.name}</div>
              <div className="text-sm text-muted-foreground">
                {appointment.startsAt.slice(11, 16)} - {appointment.endsAt.slice(11, 16)}
              </div>
            </div>
          </div>

          {/* Procedimentos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Procedimentos</h3>
              {editMode !== 'items' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode('items')}
                  aria-label="Editar itens"
                >
                  Editar
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {appointment.procedures.map((procedure) => (
                <div key={procedure.id} className="flex justify-between items-center p-2 bg-muted rounded">
                  <div>
                    <div className="font-medium text-sm">{procedure.name}</div>
                    <div className="text-xs text-muted-foreground">1x</div>
                  </div>
                  <div className="font-medium">
                    {moneyFmt.format(procedure.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totais */}
          <div className="space-y-3">
            <Separator />
            
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{moneyFmt.format(subtotal)}</span>
            </div>

            {/* Desconto */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Desconto</Label>
                {editMode !== 'final' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditMode(editMode === 'final' ? null : 'final')}
                  >
                    Editar
                  </Button>
                )}
              </div>
              
              {editMode === 'final' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="discountPct" className="text-xs">%</Label>
                    <Input
                      id="discountPct"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      {...form.register('discountPct', { valueAsNumber: true })}
                      aria-describedby={form.formState.errors.discountPct ? 'discount-pct-error' : undefined}
                    />
                    {form.formState.errors.discountPct && (
                      <p id="discount-pct-error" role="alert" className="text-xs text-red-600 mt-1">
                        {form.formState.errors.discountPct.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="discountValue" className="text-xs">Valor (R$)</Label>
                    <Input
                      id="discountValue"
                      type="number"
                      min="0"
                      step="0.01"
                      {...form.register('discountValue', { valueAsNumber: true })}
                      aria-describedby={form.formState.errors.discountValue ? 'discount-value-error' : undefined}
                    />
                    {form.formState.errors.discountValue && (
                      <p id="discount-value-error" role="alert" className="text-xs text-red-600 mt-1">
                        {form.formState.errors.discountValue.message}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-right text-red-600">
                  -{moneyFmt.format(discountAmount)}
                </div>
              )}
            </div>

            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span className="text-primary">{moneyFmt.format(actualTotal)}</span>
            </div>

            {/* Comissão */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label>Comissão</Label>
                {editMode !== 'commission' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditMode('commission')}
                  >
                    Editar
                  </Button>
                )}
              </div>
              
              {editMode === 'commission' ? (
                <div>
                  <Label htmlFor="commissionPct" className="text-xs">Percentual (%)</Label>
                  <Input
                    id="commissionPct"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    {...form.register('commissionPct', { valueAsNumber: true })}
                    aria-describedby={form.formState.errors.commissionPct ? 'commission-error' : undefined}
                  />
                  {form.formState.errors.commissionPct && (
                    <p id="commission-error" role="alert" className="text-xs text-red-600 mt-1">
                      {form.formState.errors.commissionPct.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex justify-between text-sm">
                  <span>{commissionPct}%</span>
                  <span className="text-green-600">{moneyFmt.format(commissionAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <Select
              value={form.watch('paymentMethod')}
              onValueChange={(value) => form.setValue('paymentMethod', value as PaymentMethod)}
            >
              <SelectTrigger aria-label="Selecionar forma de pagamento">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {method.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={completeAppointment.isPending}
            >
              {completeAppointment.isPending ? 'Finalizando...' : 'Finalizar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}