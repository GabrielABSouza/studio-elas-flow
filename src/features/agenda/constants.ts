export const APPOINTMENT_STATUS_STYLES = {
  to_confirm: {
    container: "border-amber-300/50 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    dot: "bg-amber-500",
    pulse: true
  },
  confirmed: {
    container: "border-emerald-400/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    dot: "bg-emerald-500",
    pulse: false
  },
  completed: {
    container: "border-sky-400/50 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300",
    dot: "bg-sky-500",
    pulse: false
  },
  canceled: {
    container: "border-rose-400/50 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300",
    dot: "bg-rose-500",
    pulse: false
  }
} as const;

export type AppointmentStatusKey = keyof typeof APPOINTMENT_STATUS_STYLES;

export const STATUS_LABELS = {
  to_confirm: "A confirmar",
  confirmed: "Confirmado", 
  completed: "Executado",
  canceled: "Cancelado"
} as const;