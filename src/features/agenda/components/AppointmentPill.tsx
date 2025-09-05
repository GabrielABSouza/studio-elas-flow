import * as React from "react";
import { cn } from "@/lib/utils";
import { APPOINTMENT_STATUS_STYLES, type AppointmentStatusKey } from "../constants";

export type ApptStatus = AppointmentStatusKey;

export function AppointmentPill(props: {
  customerName: string;
  subtitle?: string;
  status: ApptStatus;
  onOpen: () => void;
  showCanceled?: boolean;
}) {
  const { customerName, subtitle, status, onOpen, showCanceled = false } = props;
  
  const styles = APPOINTMENT_STATUS_STYLES[status];
  
  // Don't render canceled appointments unless explicitly requested
  if (status === "canceled" && !showCanceled) {
    return null;
  }
  
  const isCanceled = status === "canceled";
  
  return (
    <button
      onClick={isCanceled ? undefined : onOpen}
      className={cn(
        "w-full text-left rounded-xl border px-2 py-1 transition-colors",
        styles.container,
        isCanceled ? "opacity-60 cursor-not-allowed pointer-events-none" : "hover:bg-accent/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
      data-testid="appointment-pill"
      aria-label={`Agendamento de ${customerName}`}
      disabled={isCanceled}
    >
      <div className="flex items-center gap-2">
        <span className={cn(
          "h-2.5 w-2.5 rounded-full",
          styles.dot,
          styles.pulse && "animate-pulse"
        )} />
        <span className="truncate text-xs font-medium">{customerName}</span>
      </div>
      {subtitle && <div className="truncate text-[11px] text-muted-foreground">{subtitle}</div>}
    </button>
  );
}