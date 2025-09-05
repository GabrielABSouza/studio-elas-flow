import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useAgendaDay } from '../hooks';
import { hhmmRange, indexAppointments, formatDisplayDate } from '../utils';
import { AppointmentPill, type ApptStatus } from './AppointmentPill';
import { AppointmentActionsDialog } from './AppointmentActionsDialog';
import { AddSlotButton } from './AddSlotButton';
import { Appointment, AppointmentStatus } from '../types';

// Mapeia nossos status para os do AppointmentPill
function mapStatus(status: AppointmentStatus): ApptStatus {
  switch (status) {
    case 'completed':
      return 'completed';
    case 'confirmed':
      return 'confirmed';
    case 'to_confirm':
      return 'to_confirm';
    case 'canceled':
      return 'canceled';
    default:
      return 'to_confirm';
  }
}

interface DayGridProps {
  date: string;
  showCanceled?: boolean;
  onCreateAppointment?: (opts: { startISO?: string; professionalId?: string; lockedProfessionalId?: string }) => void;
  onRescheduleAppointment?: (appointment: Appointment) => void;
}

export function DayGrid({ date, showCanceled = false, onCreateAppointment, onRescheduleAppointment }: DayGridProps) {
  const { professionals, appointments, isLoading } = useAgendaDay(date);
  const [active, setActive] = useState<Appointment | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  
  const slots = useMemo(() => hhmmRange(8, 20, 30), []);
  const appointmentIndex = useMemo(() => indexAppointments(appointments, date), [appointments, date]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Carregando...</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {formatDisplayDate(date)}
          </h2>
        </div>
        
        <div className="overflow-auto">
          <div className="min-w-[800px]">
            {/* header horários */}
            <div className="sticky top-0 z-10 grid bg-muted/70 backdrop-blur border-b"
                 style={{ gridTemplateColumns: `220px repeat(${slots.length}, minmax(90px,1fr))` }}>
              <div className="p-2 text-xs" aria-hidden /> {/* sem 'Profissional' */}
              {slots.map(s => <div key={s} className="p-2 text-xs text-muted-foreground text-center">{s}</div>)}
            </div>

            {/* linhas */}
            <div className="grid" style={{ gridTemplateColumns: `220px repeat(${slots.length}, minmax(90px,1fr))` }}>
              {professionals.map(p => (
                <React.Fragment key={p.id}>
                  {/* célula do profissional (sem bolinha colorida) */}
                  <div className="sticky left-0 z-10 bg-background border-r border-t p-2">
                    <div className="text-sm font-medium leading-tight">{p.name}</div>
                    {p.role && <div className="text-xs text-muted-foreground">{p.role}</div>}
                  </div>

                  {slots.map(s => {
                    const slotAppointments = appointmentIndex.get(p.id)?.get(s) ?? [];
                    const appt = slotAppointments[0];
                    const slotDateTime = `${date}T${s}:00-03:00`; // São Paulo timezone
                    
                    return (
                      <div key={`${p.id}_${s}`} className="border-t border-l p-1">
                        {appt ? (
                          <>
                            <AppointmentPill
                              customerName={appt.customer.name}
                              subtitle={appt.procedures?.[0]?.name}
                              status={mapStatus(appt.status)}
                              showCanceled={showCanceled}
                              onOpen={() => {
                                setActive(appt);
                                setActionsOpen(true);
                              }}
                            />
                            
                            {/* Badge para múltiplos agendamentos */}
                            {slotAppointments.length > 1 && (
                              <div className="mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  +{slotAppointments.length - 1}
                                </Badge>
                              </div>
                            )}
                          </>
                        ) : (
                          <AddSlotButton
                            onCreate={(opts) => onCreateAppointment?.({
                              ...opts,
                              lockedProfessionalId: p.id // Trava o profissional do slot
                            })}
                            startISO={slotDateTime}
                            professionalId={p.id}
                          />
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {appointments.length === 0 && (
            <div className="min-h-[420px]" />
          )}
        </div>
      </div>
      
      {active && (
        <AppointmentActionsDialog
          appointment={active}
          professional={professionals.find(p => p.id === active.professionalId)}
          open={actionsOpen}
          onOpenChange={(open) => {
            setActionsOpen(open);
            if (!open) setActive(null);
          }}
          onReschedule={onRescheduleAppointment}
        />
      )}
      
    </>
  );
}