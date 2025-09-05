import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

interface ConfirmCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string, notes?: string, notify?: { client: boolean; professional: boolean }) => Promise<void>;
}

const CANCEL_REASONS = [
  { value: "client_cancelled", label: "Cliente desistiu" },
  { value: "rescheduled", label: "Reagendado" },
  { value: "professional_unavailable", label: "Profissional indisponível" },
  { value: "duplicate", label: "Duplicado" },
  { value: "no_show", label: "No-show" },
  { value: "other", label: "Outro" },
];

export function ConfirmCancelDialog({ open, onOpenChange, onConfirm }: ConfirmCancelDialogProps) {
  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [notifyClient, setNotifyClient] = React.useState(false);
  const [notifyProfessional, setNotifyProfessional] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!reason) return;

    setIsSubmitting(true);
    try {
      await onConfirm(reason, notes || undefined, {
        client: notifyClient,
        professional: notifyProfessional,
      });
      
      // Reset form
      setReason("");
      setNotes("");
      setNotifyClient(false);
      setNotifyProfessional(false);
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isSubmitting) {
      onOpenChange(open);
      if (!open) {
        // Reset form when closing
        setReason("");
        setNotes("");
        setNotifyClient(false);
        setNotifyProfessional(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Cancelar agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo do cancelamento</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {CANCEL_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes adicionais sobre o cancelamento..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Notificações</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-client"
                checked={notifyClient}
                onCheckedChange={setNotifyClient}
              />
              <Label
                htmlFor="notify-client"
                className="text-sm font-normal cursor-pointer"
              >
                Notificar cliente
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-professional"
                checked={notifyProfessional}
                onCheckedChange={setNotifyProfessional}
              />
              <Label
                htmlFor="notify-professional"
                className="text-sm font-normal cursor-pointer"
              >
                Notificar profissional
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Voltar
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
          >
            {isSubmitting ? "Cancelando..." : "Confirmar cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}