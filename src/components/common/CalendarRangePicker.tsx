import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export interface DateRangeValue {
  from: Date;
  to: Date;
}

export function CalendarRangePicker({
  range,
  onChange,
  triggerClassName,
  placeholder = "Selecionar período",
  triggerAsChild = false,
  children,
}: {
  range?: DateRangeValue;
  onChange: (range: DateRangeValue | undefined) => void;
  triggerClassName?: string;
  placeholder?: string;
  triggerAsChild?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedRange: DateRange | undefined) => {
    if (selectedRange?.from && selectedRange?.to) {
      onChange({
        from: selectedRange.from,
        to: selectedRange.to,
      });
      setOpen(false);
    } else if (selectedRange?.from && !selectedRange?.to) {
      // Keep popover open for selecting end date
    } else {
      onChange(undefined);
    }
  };

  const formatRange = (range: DateRangeValue) => {
    const formatDate = (date: Date) => 
      date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    return `${formatDate(range.from)} – ${formatDate(range.to)}`;
  };

  const TriggerComponent = triggerAsChild ? (
    React.cloneElement(children as React.ReactElement, { onClick: () => setOpen(!open) })
  ) : (
    <Button
      variant="outline"
      className={cn(
        "justify-start font-normal",
        !range && "text-muted-foreground",
        triggerClassName
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {range ? formatRange(range) : placeholder}
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        {TriggerComponent}
      </PopoverTrigger>
      <PopoverContent 
        className="z-50 w-auto p-0 rounded-xl border bg-popover shadow-lg" 
        align="start" 
        side="bottom" 
        sideOffset={8}
      >
        <Calendar
          mode="range"
          selected={range ? { from: range.from, to: range.to } : undefined}
          onSelect={handleSelect}
          numberOfMonths={2}
          className={cn(
            "p-2",
            "[&_button]:rounded-md [&_button:hover]:bg-accent",
            "[&_.rdp-day_selected]:bg-primary [&_.rdp-day_selected]:text-primary-foreground",
            "[&_.rdp-day_today]:ring-1 [&_.rdp-day_today]:ring-primary"
          )}
        />
        <div className="flex items-center justify-between p-3 border-t">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                onChange({ from: weekAgo, to: today });
                setOpen(false);
              }}
            >
              Últimos 7 dias
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date();
                const monthAgo = new Date(today);
                monthAgo.setDate(today.getDate() - 30);
                onChange({ from: monthAgo, to: today });
                setOpen(false);
              }}
            >
              Últimos 30 dias
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Fechar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}