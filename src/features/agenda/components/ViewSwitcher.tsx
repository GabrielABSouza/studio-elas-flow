import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CalendarDays, Grid3x3 } from 'lucide-react';

type ViewType = 'day' | 'week' | 'month';

interface ViewSwitcherProps {
  value: ViewType;
  onChange: (view: ViewType) => void;
}

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ViewType)}>
      <TabsList>
        <TabsTrigger value="day" className="gap-2">
          <Calendar className="h-4 w-4" />
          Dia
        </TabsTrigger>
        <TabsTrigger value="week" className="gap-2">
          <CalendarDays className="h-4 w-4" />
          Semana
        </TabsTrigger>
        <TabsTrigger value="month" className="gap-2">
          <Grid3x3 className="h-4 w-4" />
          Mês
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}