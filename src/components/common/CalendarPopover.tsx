import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CalendarPopover({
  date,
  onChange,
  triggerClassName,
  placeholder = "Selecione uma data",
}: {
  date?: Date;
  onChange: (date: Date) => void;
  triggerClassName?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start font-normal",
            !date && "text-muted-foreground",
            triggerClassName
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            date.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-xl border bg-popover p-2 shadow-lg">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              onChange(selectedDate);
              setOpen(false);
            }
          }}
          className={cn(
            "[&_button]:rounded-md [&_button:hover]:bg-accent",
            "[&_.rdp-day_selected]:bg-primary [&_.rdp-day_selected]:text-primary-foreground",
            "[&_.rdp-day_today]:ring-1 [&_.rdp-day_today]:ring-primary"
          )}
        />
        <div className="mt-2 flex justify-between px-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(new Date());
              setOpen(false);
            }}
          >
            Hoje
          </Button>
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