import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CheckCircle, XCircle, Plus } from "lucide-react";
import { Appointment } from "../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { POSDrawer } from "./POSDrawer";
import { ConfirmCancelDialog } from "./ConfirmCancelDialog";
import { CustomerUpdatePrompt } from "./CustomerUpdatePrompt";
import { useConfirmAppointment, useCancelAppointment, useCompleteAppointment } from "../hooks";
import { toast } from "sonner";
import { STATUS_LABELS } from "../constants";

const STATUS_BADGE_STYLES = {
  to_confirm: "border-amber-300/50 bg-amber-50/80 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
  confirmed: "border-emerald-400/50 bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
  completed: "border-sky-400/50 bg-sky-50/80 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300",
  canceled: "border-rose-400/50 bg-rose-50/80 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300",
} as const;

interface AppointmentActionsDialogProps {
  appointment: Appointment;
  professional?: { id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule?: (appointment: Appointment) => void;
}

export function AppointmentActionsDialog({
  appointment,
  professional,
  open,
  onOpenChange,
  onReschedule,
}: AppointmentActionsDialogProps) {
  const [posOpen, setPosOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [customerUpdateOpen, setCustomerUpdateOpen] = React.useState(false);

  const confirmMutation = useConfirmAppointment();
  const cancelMutation = useCancelAppointment();
  const completeMutation = useCompleteAppointment();

  const statusLabel = STATUS_LABELS[appointment.status];
  const statusBadgeStyle = STATUS_BADGE_STYLES[appointment.status];

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: format(date, "dd/MM/yyyy", { locale: ptBR }),
      time: format(date, "HH:mm", { locale: ptBR }),
      weekday: format(date, "EEEE", { locale: ptBR }),
    };
  };

  const startDateTime = formatDateTime(appointment.startsAt);

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync(appointment.id);
      toast.success("Agendamento confirmado!");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
      toast.error("Erro ao confirmar agendamento");
    }
  };

  const handleFinalize = () => {
    setPosOpen(true);
    // Não fechar o dialog principal - deixar aberto até POS ser concluído
  };

  const handleReschedule = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (import.meta.env.DEV) {
      console.debug('[reagendar] clicked', appointment.id);
      console.debug('[reagendar] opening dialog with', appointment);
    }
    onReschedule?.(appointment);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setCancelOpen(true);
  };

  const handleCancelConfirm = async (reason: string, notes?: string, notify?: { client: boolean; professional: boolean }) => {
    try {
      await cancelMutation.mutateAsync({
        appointmentId: appointment.id,
        reason,
        notes,
        notifyClient: notify?.client,
        notifyProfessional: notify?.professional,
      });
      toast.success("Agendamento cancelado!");
      setCancelOpen(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      toast.error("Erro ao cancelar agendamento");
    }
  };

  const handleCreateNew = () => {
    onReschedule?.(appointment);
    onOpenChange(false);
  };

  const handlePOSComplete = async (posData: {
    items: Array<{ id: string; procedureId: string; name: string; price: number; qty: number; professionalId: string }>; 
    total: number; 
    paymentMethod: string;
  }) => {
    try {
      await completeMutation.mutateAsync({
        appointmentId: appointment.id,
        data: posData,
      });
      setPosOpen(false);
      onOpenChange(false); // Fechar dialog principal apenas após sucesso
      setCustomerUpdateOpen(true);
      toast.success("Atendimento finalizado com sucesso!");
    } catch (error) {
      console.error("Erro ao finalizar atendimento:", error);
      toast.error("Erro ao finalizar atendimento");
      // Em caso de erro, manter POS aberto para nova tentativa
    }
  };

  const renderActionButtons = () => {
    switch (appointment.status) {
      case "to_confirm":
        return (
          <>
            <Button onClick={handleConfirm} disabled={confirmMutation.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar
            </Button>
            <Button variant="secondary" onClick={handleReschedule}>
              <CalendarClock className="h-4 w-4 mr-2" />
              Reagendar
            </Button>
            <Button variant="ghost" onClick={handleCancel} className="text-destructive hover:text-destructive">
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </>
        );

      case "confirmed":
        return (
          <>
            <Button onClick={handleFinalize}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
            <Button variant="secondary" onClick={handleReschedule}>
              <CalendarClock className="h-4 w-4 mr-2" />
              Reagendar
            </Button>
            <Button variant="ghost" onClick={handleCancel} className="text-destructive hover:text-destructive">
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </>
        );

      case "completed":
        return (
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Criar novo agendamento
          </Button>
        );

      case "canceled":
        return (
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Criar novo agendamento
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ações do agendamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Header informativo */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{appointment.customer.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {professional?.name || `Profissional ID: ${appointment.professionalId}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <span className="capitalize">{startDateTime.weekday}</span>
                  <span className="mx-2">•</span>
                  <span>{startDateTime.date}</span>
                  <span className="mx-2">•</span>
                  <span className="font-medium">{startDateTime.time}</span>
                </div>
                <Badge variant="outline" className={statusBadgeStyle}>
                  {statusLabel}
                </Badge>
              </div>

              {appointment.procedures && appointment.procedures.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {appointment.procedures.map(p => p.name).join(", ")}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-4 border-t">
              {renderActionButtons()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}

      <POSDrawer
        appointment={appointment}
        isOpen={posOpen}
        onClose={() => setPosOpen(false)}
        onComplete={handlePOSComplete}
      />

      <ConfirmCancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancelConfirm}
      />

      <CustomerUpdatePrompt
        isOpen={customerUpdateOpen}
        onClose={() => setCustomerUpdateOpen(false)}
        customerName={appointment.customer.name}
        customerId={appointment.customer.id}
      />
    </>
  );
}