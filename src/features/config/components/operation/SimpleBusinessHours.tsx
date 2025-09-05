import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SimpleBusinessHours() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Horários de Atendimento</CardTitle>
        <p className="text-sm text-muted-foreground">
          Teste simples do componente
        </p>
      </CardHeader>
      <CardContent>
        <p>Componente básico funcionando!</p>
      </CardContent>
    </Card>
  );
}