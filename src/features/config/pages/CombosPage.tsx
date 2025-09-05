import { Card, CardContent } from "@/components/ui/card";
import { CombosList } from "@/features/settings/components/CombosList";

export default function CombosPage() {
  return (
    <Card>
      <CardContent className="p-6">
        <CombosList />
      </CardContent>
    </Card>
  );
}