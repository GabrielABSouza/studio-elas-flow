import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddSlotButtonProps {
  onCreate: (opts: { startISO: string; professionalId: string }) => void;
  startISO: string;
  professionalId: string;
}

export function AddSlotButton({ onCreate, startISO, professionalId }: AddSlotButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onCreate({ startISO, professionalId })}
      className="h-8 w-full opacity-0 hover:opacity-100 transition-opacity border-dashed"
    >
      <Plus className="h-3 w-3" />
    </Button>
  );
}