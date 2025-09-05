import { Card, CardContent } from "@/components/ui/card";
import { ProceduresList } from "@/features/settings/components/ProceduresList";

export default function ProceduresPage() {
  return (
    <Card>
      <CardContent className="p-6">
        <ProceduresList />
      </CardContent>
    </Card>
  );
}