import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type DateRange = { 
  from: Date | null; 
  to: Date | null; 
};

type SelectionPhase = 'idle' | 'selecting';

interface CalendarRangePopoverProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onComplete?: (range: Required<DateRange>) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  className?: string;
}

export function CalendarRangePopover({
  value,
  onChange,
  onComplete,
  minDate,
  maxDate,
  placeholder = "Selecionar período",
  className,
}: CalendarRangePopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);
  const [phase, setPhase] = React.useState<SelectionPhase>('idle');

  // Initialize phase based on current value
  React.useEffect(() => {
    if (!value.from && !value.to) {
      setPhase('idle');
    } else if (value.from && !value.to) {
      setPhase('selecting');
    } else {
      setPhase('idle');
    }
  }, [value.from, value.to]);

  const handleDateClick = (date: Date) => {
    if (phase === 'idle' || (!value.from && !value.to)) {
      // First click: set start date
      onChange({ from: date, to: null });
      setPhase('selecting');
    } else if (phase === 'selecting' && value.from) {
      if (date >= value.from) {
        // Valid end date
        const newRange = { from: value.from, to: date };
        onChange(newRange);
        onComplete?.(newRange as Required<DateRange>);
        setOpen(false);
        setPhase('idle');
      } else {
        // Date before start, reset to new start
        onChange({ from: date, to: null });
        setPhase('selecting');
      }
    } else {
      // Reset selection
      onChange({ from: date, to: null });
      setPhase('selecting');
    }
  };

  const handleClear = () => {
    onChange({ from: null, to: null });
    setPhase('idle');
  };

  const handleToday = () => {
    const today = new Date();
    onChange({ from: today, to: today });
    onComplete?.({ from: today, to: today });
    setOpen(false);
    setPhase('idle');
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const getDateClassName = (date: Date) => {
    const baseClass = "h-9 w-9 text-sm p-0 font-normal hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring";
    const isDisabled = isDateDisabled(date);
    const isToday = date.toDateString() === new Date().toDateString();

    if (isDisabled) {
      return cn(baseClass, "opacity-30 cursor-not-allowed");
    }

    // Check if this date is start, end, or in between
    const { from, to } = value;
    const isStart = from && date.toDateString() === from.toDateString();
    const isEnd = to && date.toDateString() === to.toDateString();
    const isBetween = from && to && date > from && date < to;

    // Hover preview when selecting
    const previewEnd = phase === 'selecting' && from && hoverDate && hoverDate >= from;
    const isHoverBetween = previewEnd && from && hoverDate && date > from && date <= hoverDate;

    if (isStart && isEnd) {
      // Same day selection
      return cn(baseClass, "rounded-full bg-primary text-primary-foreground");
    } else if (isStart) {
      return cn(baseClass, "rounded-l-full bg-primary text-primary-foreground");
    } else if (isEnd) {
      return cn(baseClass, "rounded-r-full bg-primary text-primary-foreground");
    } else if (isBetween) {
      return cn(baseClass, "bg-primary/10 text-foreground");
    } else if (isHoverBetween) {
      return cn(baseClass, "bg-primary/5 text-foreground");
    } else if (isToday) {
      return cn(baseClass, "ring-1 ring-primary");
    }

    return baseClass;
  };

  const formatRange = (range: DateRange) => {
    if (!range.from || !range.to) return placeholder;
    const formatDate = (date: Date) => 
      new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(date);
    return `${formatDate(range.from)} – ${formatDate(range.to)}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get the first day of the week (0 = Sunday)
    const firstDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const renderMonth = (monthDate: Date, isSecondMonth = false) => {
    const days = getDaysInMonth(monthDate);
    const monthName = monthNames[monthDate.getMonth()];
    const year = monthDate.getFullYear();

    return (
      <div className="p-2">
        {/* Month header */}
        <div className="flex items-center justify-between mb-4">
          {!isSecondMonth && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <h2 className={cn("text-sm font-semibold", isSecondMonth && "mx-auto")}>
            {monthName} {year}
          </h2>
          {!isSecondMonth && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map((day) => (
            <div key={day} className="h-9 w-9 flex items-center justify-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <div key={index} className="h-9 w-9 flex items-center justify-center">
              {date && (
                <Button
                  variant="ghost"
                  className={getDateClassName(date)}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => setHoverDate(date)}
                  onMouseLeave={() => setHoverDate(null)}
                  disabled={isDateDisabled(date)}
                  aria-label={date.toLocaleDateString('pt-BR')}
                >
                  {date.getDate()}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const secondMonth = new Date(currentMonth);
  secondMonth.setMonth(secondMonth.getMonth() + 1);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start font-normal",
            !value.from && !value.to && "text-muted-foreground",
            className
          )}
          aria-label="Selecionar período personalizado"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatRange(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="z-50 w-auto rounded-xl border bg-popover p-0 shadow-lg"
      >
        {/* Calendar grid - single on mobile, dual on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderMonth(currentMonth)}
          <div className="hidden md:block">
            {renderMonth(secondMonth, true)}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between p-3 border-t">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              Limpar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
            >
              Hoje
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}