import { Card, CardContent } from "@/components/ui/card";
import { ProfessionalMatrix } from "@/features/settings/components/ProfessionalMatrix";

export default function MatrixPage() {
  return (
    <Card>
      <CardContent className="p-6">
        <ProfessionalMatrix />
      </CardContent>
    </Card>
  );
}