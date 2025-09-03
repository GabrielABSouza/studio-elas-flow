import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useAgendaDay } from '../hooks';
import { hhmmRange, indexAppointments, detectOverlaps, formatDisplayDate } from '../utils';
import { AppointmentCard } from './AppointmentCard';
import { POSDrawer } from './POSDrawer';
import { Appointment } from '../types';

interface DayGridProps {
  date: string;
}

export function DayGrid({ date }: DayGridProps) {
  const { professionals, appointments, isLoading } = useAgendaDay(date);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  const slots = useMemo(() => hhmmRange(8, 20, 30), []);
  const appointmentIndex = useMemo(() => indexAppointments(appointments, date), [appointments, date]);
  const overlaps = useMemo(() => detectOverlaps(appointments), [appointments]);

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
        
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header com horários */}
            <div className="sticky top-0 z-10 bg-muted/70 backdrop-blur border-b grid" style={{ gridTemplateColumns: '200px repeat(' + slots.length + ', 1fr)' }}>
              <div className="p-2" aria-hidden="true"></div>
              {slots.map((slot) => (
                <div key={slot} className="p-2 text-xs text-center font-medium text-muted-foreground border-l">
                  {slot}
                </div>
              ))}
            </div>
              
            {/* Grid de profissionais e horários */}
            <div className="grid" style={{ gridTemplateColumns: '200px repeat(' + slots.length + ', 1fr)' }}>
              {professionals.map((professional) => {
                const profAppointments = appointmentIndex.get(professional.id);
                
                return (
                  <React.Fragment key={professional.id}>
                    <div className="sticky left-0 z-10 bg-background border-r border-t p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: professional.color || '#8B5CF6' }}
                        />
                        <div>
                          <div className="font-medium text-sm">{professional.name}</div>
                          {professional.role && (
                            <div className="text-xs text-muted-foreground">
                              {professional.role}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {slots.map((slot) => {
                      const slotAppointments = profAppointments?.get(slot) ?? [];
                      
                      return (
                        <div
                          key={`${professional.id}-${slot}`}
                          className="min-h-[80px] p-1 border-l border-t hover:bg-muted/40 transition-colors relative"
                        >
                          {slotAppointments.slice(0, 2).map((appointment) => (
                            <div key={appointment.id} className="mb-1">
                              <AppointmentCard
                                appointment={appointment}
                                isOverlap={overlaps.has(appointment.id)}
                                onClick={() => setSelectedAppointment(appointment)}
                              />
                            </div>
                          ))}
                          
                          {slotAppointments.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{slotAppointments.length - 2}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          
          {appointments.length === 0 && (
            <div className="min-h-[420px]" />
          )}
        </div>
      </div>
      
      {selectedAppointment && (
        <POSDrawer
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </>
  );
}