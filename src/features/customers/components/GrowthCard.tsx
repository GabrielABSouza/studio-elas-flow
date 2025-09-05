import { useMemo } from "react";
import { TrendingUp, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomersGrowth } from "../hooks";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface GrowthCardProps {
  onOpenDrawer: () => void;
}

export function GrowthCard({ onOpenDrawer }: GrowthCardProps) {
  // Calculate last 3 months with stable dates
  const dates = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 90);
    return { from, to };
  }, []);

  const { data: growthData, isLoading, error } = useCustomersGrowth({
    from: dates.from,
    to: dates.to,
    groupBy: 'week'
  });

  // Debug logging in development
  if (import.meta.env.DEV) {
    console.debug('[GrowthCard]', { 
      growthData, 
      isLoading, 
      error,
      from: dates.from.toISOString(),
      to: dates.to.toISOString()
    });
  }

  const formatPct = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getPctColor = (value: number) => {
    return value >= 0 ? 'text-emerald-600' : 'text-rose-600';
  };

  const handleCardClick = () => {
    onOpenDrawer();
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDrawer();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenDrawer();
    }
  };

  return (
    <Card 
      className="border-primary/20 shadow-soft cursor-pointer hover:shadow-elegant transition-shadow"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Ver detalhes do crescimento de clientes"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
        <TrendingUp className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Main KPI */}
        <div className="space-y-1">
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : growthData ? (
            <div className={`text-2xl font-bold ${getPctColor(growthData.momPct)}`}>
              {formatPct(growthData.momPct)}
            </div>
          ) : (
            <div className="text-2xl font-bold text-muted-foreground">—</div>
          )}
        </div>
        
        {/* Mini Chart */}
        <div className="h-[64px] w-full mt-2">
          {isLoading ? (
            <Skeleton className="h-full w-full rounded" />
          ) : growthData && growthData.series && growthData.series.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData.series}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
              {error ? 'Erro ao carregar' : 'Sem dados'}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Últimos 3 meses
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs gap-1 p-1 h-auto"
            onClick={handleButtonClick}
          >
            Ver detalhes
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}