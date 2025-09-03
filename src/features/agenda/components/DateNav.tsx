import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { shiftDays, formatLocalDate, parseISODate, formatDisplayDate } from '../utils';

interface DateNavProps {
  date: string;
  onChange: (date: string) => void;
}

export function DateNav({ date, onChange }: DateNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentDate = parseISODate(date);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(formatLocalDate(selectedDate));
      setIsOpen(false);
    }
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
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[200px] justify-start text-left font-normal hover:bg-muted/80 transition-colors"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {formatDisplayDate(date)}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 shadow-xl border-primary/10" align="start">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleDateSelect}
            defaultMonth={currentDate}
            className="rounded-lg border-0"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium text-foreground",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-muted/60 rounded-md transition-colors",
              day_selected: "bg-gradient-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-soft",
              day_today: "bg-accent text-accent-foreground font-semibold",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
          />
        </PopoverContent>
      </Popover>
      
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