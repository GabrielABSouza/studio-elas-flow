import * as React from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useClientsSearch } from "../hooks";
import type { Client } from "../api";
import { cn } from "@/lib/utils";

export function ClientSearchCombobox({
  value, onSelect, placeholder = "Buscar cliente...", className,
}: {
  value?: { id?: string; name: string; phone?: string };
  onSelect: (v: { id?: string; name: string; phone?: string; isNew: boolean }) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState(value?.name ?? "");
  const { data = [], isFetching } = useClientsSearch(input);

  const choose = (c: Client) => {
    onSelect({ id: c.id, name: c.name, phone: c.phone, isNew: false });
    setInput(c.name);
    setOpen(false);
  };

  const chooseNew = () => {
    const name = input.trim();
    if (!name) return;
    onSelect({ name, isNew: true, phone: "" });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start font-normal", className)}>
          {input || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Digite o nome…"
            value={input}
            onValueChange={setInput}
          />
          <CommandEmpty>
            {isFetching ? "Buscando..." : "Nenhum cliente encontrado"}
          </CommandEmpty>
          <CommandGroup heading="Clientes">
            {data.map((c) => (
              <CommandItem key={c.id} onSelect={() => choose(c)}>
                {c.name} {c.phone ? <span className="ml-2 text-xs text-muted-foreground">({c.phone})</span> : null}
              </CommandItem>
            ))}
            {input.trim() && (
              <CommandItem onSelect={chooseNew} value={`novo:${input}`}>
                + Criar novo cliente "{input.trim()}"
              </CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}