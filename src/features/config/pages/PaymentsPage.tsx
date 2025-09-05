import { ComingSoonTile } from "@/components/common/ComingSoonTile";
import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  return (
    <ComingSoonTile
      icon={CreditCard}
      title="Custo por modalidade e taxas"
      subtitle="Consolidação/edição de meios de pagamento e custos (percentual/fixo)"
      className="max-w-md mx-auto"
    />
  );
}