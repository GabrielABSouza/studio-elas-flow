import * as React from "react";

type Status = "to_confirm" | "confirmed" | "completed";

const BORDER_BY_STATUS: Record<Status, string> = {
  to_confirm: "border-amber-300/50",
  confirmed: "border-primary/40",
  completed: "border-green-400/50",
};

const DOT_BY_STATUS: Record<Status, string> = {
  to_confirm: "bg-amber-400/80",
  confirmed: "bg-primary",
  completed: "bg-green-500",
};

export function AppointmentPill({
  customerName,
  subtitle,       // procedimento, duração, etc.
  status,
  onOpen,
}: {
  customerName: string;
  subtitle?: string;
  status: Status;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className={[
        "w-full text-left rounded-xl border bg-card px-2 py-1",
        "hover:bg-accent/60 transition-colors",
        "hover:shadow-sm",
        status === "confirmed" && "hover:border-primary/60",
        status === "to_confirm" && "hover:border-amber-400/60",
        status === "completed" && "hover:border-green-500/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        BORDER_BY_STATUS[status],
      ].filter(Boolean).join(" ")}
      aria-label={`Cliente ${customerName} - ${status}`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${DOT_BY_STATUS[status]} ${status === "to_confirm" ? "animate-pulse" : ""}`} />
        <span className="truncate text-xs font-medium">{customerName}</span>
      </div>
      {subtitle ? <div className="truncate text-[11px] text-muted-foreground">{subtitle}</div> : null}
    </button>
  );
}