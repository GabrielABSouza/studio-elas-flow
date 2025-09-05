import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { shiftDays, formatLocalDate, parseISODate } from '../utils';
import { CalendarPopover } from '@/components/common/CalendarPopover';

interface DateNavProps {
  date: string;
  onChange: (date: string) => void;
}

export function DateNav({ date, onChange }: DateNavProps) {
  const currentDate = parseISODate(date);

  const handleDateSelect = (selectedDate: Date) => {
    onChange(formatLocalDate(selectedDate));
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(shiftDays(date, -1))}
        className="px-2 hover:bg-muted/80 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Dia anterior</span>
      </Button>
      
      <CalendarPopover
        date={currentDate}
        onChange={handleDateSelect}
        triggerClassName="min-w-[200px] justify-start text-left font-normal hover:bg-muted/80 transition-colors"
      />
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(formatLocalDate(new Date()))}
        className="px-3 font-medium hover:bg-muted/80 transition-colors"
      >
        Hoje
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(shiftDays(date, 1))}
        className="px-2 hover:bg-muted/80 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Próximo dia</span>
      </Button>
    </div>
  );
}