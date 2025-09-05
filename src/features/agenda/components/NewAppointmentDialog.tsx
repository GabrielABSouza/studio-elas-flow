import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X, Lock } from "lucide-react";
import { ClientSearchCombobox } from "./ClientSearchCombobox";
import { format, parseISO, formatISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useProceduresCatalog, useProfessionalsCatalog, useCreateAppointment, useUpdateAppointment, useAppointment } from "../hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ItemSchema = z.object({
  procedureId: z.string().min(1, "Selecione um procedimento"),
  professionalId: z.string().min(1, "Selecione o profissional"),
  qty: z.number().min(1).default(1),
});

const FormSchema = z.object({
  clientId: z.string().optional(),
  clientName: z.string().min(1),
  clientPhone: z.string().optional(),
  professionalId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  items: z.array(ItemSchema).min(1, "Adicione pelo menos um procedimento"),
}).refine((data) => data.endTime > data.startTime, {
  message: "Horário de fim deve ser posterior ao horário de início",
  path: ["endTime"],
});

export type NewAppointmentPayload = z.infer<typeof FormSchema>;

// Field styling for white background consistency
const fieldBase =
  "h-10 w-full bg-white dark:bg-zinc-900 " +
  "border border-input rounded-md px-3 py-2 text-sm " +
  "text-foreground placeholder:text-muted-foreground " +
  "shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export function NewAppointmentDialog({
  open, onOpenChange, mode = "create", appointmentId, defaultStartISO, defaultProfessionalId, lockedProfessionalId, defaultClient, onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode?: "create" | "edit";
  appointmentId?: string;
  defaultStartISO?: string;
  defaultProfessionalId?: string;
  lockedProfessionalId?: string;
  defaultClient?: { id?: string; name: string; phone?: string };
  onCreated?: (id: string) => void;
}) {
  if (import.meta.env.DEV) {
    console.debug('[NewAppointmentDialog] props:', { open, mode, appointmentId, lockedProfessionalId });
  }
  const { data: procedures = [], isLoading: loadingProcedures } = useProceduresCatalog();
  const { data: professionals = [], isLoading: loadingProfessionals } = useProfessionalsCatalog();
  const { data: existingAppointment, isLoading: loadingAppointment } = useAppointment(appointmentId, { enabled: !!appointmentId });
  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentMutation = useUpdateAppointment();

  const isEdit = mode === "edit" && appointmentId;

  const nextHalfHourTime = React.useMemo(() => {
    const d = new Date(); 
    d.setSeconds(0, 0);
    const m = d.getMinutes(); 
    // Round up to next 30-minute interval
    if (m < 30) d.setMinutes(30);
    else d.setMinutes(60); // Next hour
    return d.toTimeString().slice(0, 5);
  }, []);

  const defaultEndTime = React.useMemo(() => {
    const d = new Date(); 
    d.setSeconds(0, 0);
    const m = d.getMinutes(); 
    // Round up to next 30-minute interval and add 1 hour
    if (m < 30) d.setMinutes(30);
    else d.setMinutes(60); // Next hour
    d.setHours(d.getHours() + 1); // Add 1 hour for default duration
    return d.toTimeString().slice(0, 5);
  }, []);

  const todayDate = React.useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const form = useForm<NewAppointmentPayload>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      clientId: defaultClient?.id,
      clientName: defaultClient?.name || "",
      clientPhone: defaultClient?.phone || "",
      professionalId: defaultProfessionalId || professionals[0]?.id || "",
      date: defaultStartISO ? defaultStartISO.split('T')[0] : todayDate,
      startTime: defaultStartISO ? new Date(defaultStartISO).toTimeString().slice(0, 5) : nextHalfHourTime,
      endTime: defaultStartISO ? (() => {
        const endDate = new Date(defaultStartISO);
        endDate.setHours(endDate.getHours() + 1);
        return endDate.toTimeString().slice(0, 5);
      })() : defaultEndTime,
      items: [{ procedureId: "", professionalId: defaultProfessionalId || "", qty: 1 }],
    },
  });

  // Load existing appointment data when in edit mode
  React.useEffect(() => {
    if (isEdit && existingAppointment && !loadingAppointment) {
      if (import.meta.env.DEV) {
        console.debug('[reagendar] form reset for appointment', existingAppointment.id);
      }
      const startDate = new Date(existingAppointment.startsAt);
      const endDate = new Date(existingAppointment.endsAt);
      const resetData: NewAppointmentPayload = {
        clientId: existingAppointment.customer.id,
        clientName: existingAppointment.customer.name,
        clientPhone: "", // Phone not available in appointment data
        professionalId: existingAppointment.professionalId,
        date: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        items: existingAppointment.procedures?.map((proc) => ({
          procedureId: proc.id,
          professionalId: existingAppointment.professionalId,
          qty: 1, // Default qty
        })) || [{ procedureId: "", professionalId: existingAppointment.professionalId, qty: 1 }],
      };
      form.reset(resetData);
    }
  }, [isEdit, existingAppointment, loadingAppointment, form]);

  const { fields, append, remove } = useFieldArray({ 
    control: form.control, 
    name: "items" 
  });

  const onClientSelect = (v: { id?: string; name: string; phone?: string; isNew: boolean }) => {
    form.setValue("clientId", v.id);
    form.setValue("clientName", v.name);
    if (v.phone) form.setValue("clientPhone", v.phone);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      // Calculate startISO from date and startTime
      const [startHours, startMinutes] = values.startTime.split(':').map(Number);
      const startDate = new Date(values.date);
      startDate.setHours(startHours, startMinutes, 0, 0);
      const startISO = startDate.toISOString();
      
      // Calculate endISO from date and endTime
      const [endHours, endMinutes] = values.endTime.split(':').map(Number);
      const endDate = new Date(values.date);
      endDate.setHours(endHours, endMinutes, 0, 0);
      const endISO = endDate.toISOString();

      // Force locked professional if provided (security/validation)
      const finalProfessionalId = lockedProfessionalId || values.professionalId;
      
      const payload = {
        clientId: values.clientId,
        clientName: values.clientName,
        clientPhone: values.clientPhone,
        professionalId: finalProfessionalId,
        startISO,
        endISO,
        items: values.items.map(item => ({
          procedureId: item.procedureId,
          professionalId: item.professionalId,
          qty: item.qty
        }))
      };

      if (isEdit) {
        await updateAppointmentMutation.mutateAsync({ 
          appointmentId: appointmentId!,
          ...payload
        });
        toast.success("Agendamento atualizado com sucesso!");
      } else {
        const result = await createAppointmentMutation.mutateAsync(payload);
        toast.success("Agendamento criado com sucesso!");
        onCreated?.(result.id);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error(isEdit ? "Erro ao atualizar agendamento:" : "Erro ao criar agendamento:", error);
      toast.error(isEdit ? "Erro ao atualizar agendamento. Tente novamente." : "Erro ao criar agendamento. Tente novamente.");
    }
  });

  // Auto-fill professional for new procedure items
  const watchedProfessionalId = form.watch("professionalId");
  React.useEffect(() => {
    if (watchedProfessionalId) {
      fields.forEach((_, index) => {
        const currentProf = form.getValues(`items.${index}.professionalId`);
        if (!currentProf) {
          form.setValue(`items.${index}.professionalId`, watchedProfessionalId);
        }
      });
    }
  }, [watchedProfessionalId, fields, form]);

  // Set locked professional ID if provided
  React.useEffect(() => {
    if (lockedProfessionalId) {
      if (import.meta.env.DEV) {
        console.debug('[NewAppointmentDialog] setting locked professional:', lockedProfessionalId);
      }
      form.setValue('professionalId', lockedProfessionalId, { shouldDirty: false, shouldValidate: true });
    }
  }, [lockedProfessionalId, form]);

  // Helper function to get professional name by ID
  const getProfessionalName = (id: string) => {
    return professionals.find(p => p.id === id)?.name || `Profissional ID: ${id}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[720px] max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit && existingAppointment ? `Reagendar — ${existingAppointment.customer.name}` : 
             isEdit ? "Editar agendamento" : "Novo agendamento"}
          </DialogTitle>
          <DialogDescription>
            {isEdit && existingAppointment ? (
              `Atual: ${format(new Date(existingAppointment.startsAt), "dd/MM 'às' HH:mm", { locale: ptBR })}`
            ) : (
              "Preencha os dados abaixo para criar um novo agendamento"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
          {/* Coluna esquerda */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <ClientSearchCombobox
                value={{ name: form.getValues("clientName") }}
                onSelect={onClientSelect}
                className={cn(fieldBase, "justify-start")}
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  <Input className={cn(fieldBase)} {...form.register("clientName")} />
                  {form.formState.errors.clientName && (
                    <p className="text-xs text-destructive">{form.formState.errors.clientName.message}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Telefone</Label>
                  <Input className={cn(fieldBase)} placeholder="(00) 00000-0000" {...form.register("clientPhone")} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Procedimentos</Label>
              
              {/* Headers */}
              <div className="grid grid-cols-[1fr_1fr_80px_36px] items-center gap-2 px-2 text-xs text-muted-foreground">
                <div>Procedimento</div>
                <div>Profissional</div>
                <div>Qtd</div>
                <div></div>
              </div>
              
              <div className="space-y-2">
                {fields.map((f, i) => (
                  <div key={f.id} className="grid grid-cols-[1fr_1fr_80px_36px] items-center gap-2 rounded-lg border bg-card p-2">
                    {/* Procedimento */}
                    <Select
                      value={form.watch(`items.${i}.procedureId`)}
                      onValueChange={(v) => {
                        const proc = procedures.find(p => p.id === v);
                        form.setValue(`items.${i}.procedureId`, v);
                        // Auto-fill professional if not set
                        if (!form.getValues(`items.${i}.professionalId`)) {
                          form.setValue(`items.${i}.professionalId`, watchedProfessionalId || "");
                        }
                      }}
                    >
                      <SelectTrigger className={cn(fieldBase, "justify-between")}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingProcedures ? (
                          <div className="p-2 text-sm text-muted-foreground">Carregando...</div>
                        ) : (
                          procedures.map((procedure) => (
                            <SelectItem key={procedure.id} value={procedure.id}>{procedure.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>

                    {/* Profissional responsável */}
                    <Select
                      value={form.watch(`items.${i}.professionalId`) || form.getValues("professionalId")}
                      onValueChange={(v) => form.setValue(`items.${i}.professionalId`, v)}
                    >
                      <SelectTrigger className={cn(fieldBase, "justify-between")}>
                        <SelectValue placeholder="Profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingProfessionals ? (
                          <div className="p-2 text-sm text-muted-foreground">Carregando...</div>
                        ) : (
                          professionals.map((pro) => (
                            <SelectItem key={pro.id} value={pro.id}>{pro.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>

                    {/* Quantidade */}
                    <Input 
                      className={cn(fieldBase)}
                      type="number" 
                      min={1} 
                      {...form.register(`items.${i}.qty`, { valueAsNumber: true })} 
                    />

                    {/* Remover */}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => remove(i)}
                      disabled={fields.length <= 1}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ 
                  procedureId: "", 
                  professionalId: form.getValues("professionalId"), 
                  qty: 1 
                })}
                className="w-full"
              >
                + Adicionar procedimento
              </Button>
              
              {form.formState.errors.items && (
                <p className="text-xs text-destructive">{form.formState.errors.items.message}</p>
              )}
            </div>
          </div>

          {/* Coluna direita */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Profissional (do agendamento)</Label>
              {lockedProfessionalId ? (
                <>
                  <div className={cn(fieldBase, "flex items-center justify-between")}>
                    <span>{getProfessionalName(lockedProfessionalId)}</span>
                    <Lock className="h-4 w-4 opacity-60" aria-hidden />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Profissional definido pelo slot da agenda. Para alterar, selecione outro slot ou crie pelo botão '+ Novo agendamento'.
                  </p>
                  <input type="hidden" {...form.register('professionalId')} />
                </>
              ) : (
                <Select
                  value={form.watch("professionalId")}
                  onValueChange={(v) => form.setValue("professionalId", v)}
                >
                  <SelectTrigger className={cn(fieldBase, "justify-between")}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProfessionals ? (
                      <div className="p-2 text-sm text-muted-foreground">Carregando...</div>
                    ) : (
                      professionals.map((pro) => (
                        <SelectItem key={pro.id} value={pro.id}>{pro.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
              {form.formState.errors.professionalId && (
                <p className="text-xs text-destructive">{form.formState.errors.professionalId.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn(fieldBase, "justify-between")}>
                      {form.watch("date") ? format(parseISO(form.watch("date")), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione a data"}
                      <CalendarIcon className="h-4 w-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar
                      mode="single"
                      selected={form.watch("date") ? parseISO(form.watch("date")) : undefined}
                      onSelect={(d) => {
                        if (d) {
                          form.setValue("date", formatISO(d, { representation: 'date' }));
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.date && (
                  <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Horário Início</Label>
                  <Select
                    value={form.watch("startTime")}
                    onValueChange={(startTime) => {
                      form.setValue("startTime", startTime);
                      
                      // Auto-adjust endTime to be at least 30 minutes after startTime
                      const currentEndTime = form.watch("endTime");
                      const [startH, startM] = startTime.split(':').map(Number);
                      const [endH, endM] = currentEndTime.split(':').map(Number);
                      
                      const startMinutes = startH * 60 + startM;
                      const endMinutes = endH * 60 + endM;
                      
                      if (endMinutes <= startMinutes) {
                        const newEndMinutes = startMinutes + 30;
                        const newEndH = Math.floor(newEndMinutes / 60);
                        const newEndM = newEndMinutes % 60;
                        
                        if (newEndH < 24) {
                          const newEndTime = `${String(newEndH).padStart(2, "0")}:${String(newEndM).padStart(2, "0")}`;
                          form.setValue("endTime", newEndTime);
                        }
                      }
                    }}
                  >
                    <SelectTrigger className={cn(fieldBase, "justify-between")}>
                      <SelectValue placeholder="Início" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 * 2 }, (_, i) => {
                        const h = String(Math.floor(i / 2)).padStart(2, "0");
                        const m = i % 2 === 0 ? "00" : "30";
                        const val = `${h}:${m}`;
                        return <SelectItem key={val} value={val}>{val}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.startTime && (
                    <p className="text-xs text-destructive">{form.formState.errors.startTime.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Horário Fim</Label>
                  <Select
                    value={form.watch("endTime")}
                    onValueChange={(endTime) => form.setValue("endTime", endTime)}
                  >
                    <SelectTrigger className={cn(fieldBase, "justify-between")}>
                      <SelectValue placeholder="Fim" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 * 2 }, (_, i) => {
                        const h = String(Math.floor(i / 2)).padStart(2, "0");
                        const m = i % 2 === 0 ? "00" : "30";
                        const val = `${h}:${m}`;
                        return <SelectItem key={val} value={val}>{val}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.endTime && (
                    <p className="text-xs text-destructive">{form.formState.errors.endTime.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting || createAppointmentMutation.isPending || updateAppointmentMutation.isPending}
              >
                {form.formState.isSubmitting || createAppointmentMutation.isPending || updateAppointmentMutation.isPending 
                  ? "Salvando..." 
                  : isEdit ? "Salvar alterações" : "Salvar"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}