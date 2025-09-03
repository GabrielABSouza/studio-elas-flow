import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { DateNav } from '../components/DateNav';
import { ViewSwitcher } from '../components/ViewSwitcher';
import { DayGrid } from '../components/DayGrid';
import { WeekGrid } from '../components/WeekGrid';
import { MonthGrid } from '../components/MonthGrid';
import { formatLocalDate, isValidDate } from '../utils';

type ViewType = 'day' | 'week' | 'month';

export default function AgendaPage() {
  const [view, setView] = useState<ViewType>('day');
  const [date, setDate] = useState<string>(formatLocalDate(new Date()));
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
      pathname: '/agenda', 
      search: params.toString() 
    }, { 
      replace: true 
    });
  }, [view, date, navigate]);

  const renderView = () => {
    switch (view) {
      case 'day':
        return <DayGrid date={date} />;
      case 'week':
        return <WeekGrid date={date} />;
      case 'month':
        return <MonthGrid date={date} />;
      default:
        return <DayGrid date={date} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <PageHeader title="Agenda">
        <div className="flex flex-wrap items-center gap-4">
          <DateNav date={date} onChange={setDate} />
          <ViewSwitcher value={view} onChange={setView} />
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 py-8">
        {renderView()}
      </div>
    </div>
  );
}