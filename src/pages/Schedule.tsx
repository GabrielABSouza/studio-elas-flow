import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DateNav } from '@/features/agenda/components/DateNav';
import { ViewSwitcher } from '@/features/agenda/components/ViewSwitcher';
import { DayGrid } from '@/features/agenda/components/DayGrid';
import { WeekGrid } from '@/features/agenda/components/WeekGrid';
import { MonthGrid } from '@/features/agenda/components/MonthGrid';
import { NewAppointmentDialog } from '@/features/agenda/components/NewAppointmentDialog';
import { formatLocalDate, isValidDate } from '@/features/agenda/utils';
import { Appointment } from '@/features/agenda/types';

type ViewType = 'day' | 'week' | 'month';
type AppointmentDialogMode = 'create' | 'edit';

type DialogState = {
  open: boolean;
  mode: AppointmentDialogMode;
  appointment?: Appointment | null;
  lockedProfessionalId?: string | null;
  defaults?: {
    startISO?: string;
    professionalId?: string;
  };
};

export default function Schedule() {
  const [view, setView] = useState<ViewType>('day');
  const [date, setDate] = useState<string>(formatLocalDate(new Date()));
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    mode: 'create',
    appointment: null,
    lockedProfessionalId: null,
    defaults: {},
  });

  const openCreateDialog = (opts: { startISO?: string; professionalId?: string; lockedProfessionalId?: string } = {}) => {
    if (import.meta.env.DEV) {
      console.debug('[Schedule] openCreateDialog:', opts);
    }
    setDialogState({
      open: true,
      mode: 'create',
      appointment: null,
      lockedProfessionalId: opts.lockedProfessionalId || null,
      defaults: opts,
    });
  };

  const openRescheduleDialog = (appointment: Appointment) => {
    if (import.meta.env.DEV) {
      console.debug('[Schedule] openRescheduleDialog:', appointment);
    }
    setDialogState({
      open: true,
      mode: 'edit',
      appointment: appointment,
      lockedProfessionalId: null, // Reagendar permite editar profissional
      defaults: {
        startISO: appointment.startsAt,
        professionalId: appointment.professionalId,
      },
    });
  };

  const closeDialog = () => {
    setDialogState({
      open: false,
      mode: 'create',
      appointment: null,
      lockedProfessionalId: null, // Limpa o lock ao fechar
      defaults: {},
    });
  };

  // Hidratação inicial da URL
  useEffect(() => {
    const urlView = searchParams.get('view') as ViewType;
    const urlDate = searchParams.get('date');
    
    if (urlView && ['day', 'week', 'month'].includes(urlView)) {
      setView(urlView);
    }
    
    if (urlDate && isValidDate(urlDate)) {
      setDate(urlDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronização de mudanças com URL
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('view', view);
    params.set('date', date);
    
    navigate({ 
      pathname: '/schedule', 
      search: params.toString() 
    }, { 
      replace: true 
    });
  }, [view, date, navigate]);

  const renderView = () => {
    switch (view) {
      case 'day':
        return <DayGrid 
          date={date} 
          onCreateAppointment={openCreateDialog} 
          onRescheduleAppointment={openRescheduleDialog}
        />;
      case 'week':
        return <WeekGrid date={date} />;
      case 'month':
        return <MonthGrid date={date} />;
      default:
        return <DayGrid 
          date={date} 
          onCreateAppointment={openCreateDialog}
          onRescheduleAppointment={openRescheduleDialog}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <PageHeader
        title="Agenda"
        description="Gerencie seus agendamentos e compromissos"
      >
        <Button onClick={() => openCreateDialog()} className="gap-2 shadow-elegant">
          <Plus className="h-4 w-4" />
          Novo agendamento
        </Button>
      </PageHeader>

      <div className="container mx-auto px-4 py-8">
        {/* Controls - navegação de data + view switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <DateNav date={date} onChange={setDate} />
          <ViewSwitcher value={view} onChange={setView} />
        </div>

        {/* Agenda em si */}
        <div className="mt-4">
          {renderView()}
        </div>
      </div>

      <NewAppointmentDialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
        mode={dialogState.mode}
        appointmentId={dialogState.appointment?.id}
        defaultStartISO={dialogState.defaults?.startISO}
        defaultProfessionalId={dialogState.defaults?.professionalId}
        lockedProfessionalId={dialogState.lockedProfessionalId}
        defaultClient={dialogState.appointment ? {
          id: dialogState.appointment.customer.id,
          name: dialogState.appointment.customer.name,
        } : undefined}
        onCreated={(id) => {
          console.log('Appointment created/updated:', id);
          closeDialog();
          // TODO: Refresh appointments
        }}
      />
    </div>
  );
}