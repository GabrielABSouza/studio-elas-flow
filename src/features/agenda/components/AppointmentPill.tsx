import * as React from "react";

export type ApptStatus = "to_confirm" | "confirmed" | "completed";

const BORDER: Record<ApptStatus, string> = {
  to_confirm: "border-amber-300/50",
  confirmed:  "border-primary/40",
  completed:  "border-green-400/50",
};
const DOT: Record<ApptStatus, string> = {
  to_confirm: "bg-amber-400/80",
  confirmed:  "bg-primary",
  completed:  "bg-green-500",
};

export function AppointmentPill(props: {
  customerName: string;
  subtitle?: string;
  status: ApptStatus;
  onOpen: () => void;
}) {
  const { customerName, subtitle, status, onOpen } = props;
  return (
    <button
      onClick={onOpen}
      className={[
        "w-full text-left rounded-xl border bg-card px-2 py-1",
        "hover:bg-accent/60 hover:shadow-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        BORDER[status],
      ].join(" ")}
      data-testid="appointment-pill"
      aria-label={`Agendamento de ${customerName}`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${DOT[status]} ${status === "to_confirm" ? "animate-pulse" : ""}`} />
        <span className="truncate text-xs font-medium">{customerName}</span>
      </div>
      {subtitle && <div className="truncate text-[11px] text-muted-foreground">{subtitle}</div>}
    </button>
  );
}