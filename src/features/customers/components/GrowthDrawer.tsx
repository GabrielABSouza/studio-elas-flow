import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, X, Calendar, Users, BarChart3 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomersGrowth } from "../hooks";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar
} from "recharts";

interface GrowthDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GrowthDrawer({ open, onOpenChange }: GrowthDrawerProps) {
  const [groupBy, setGroupBy] = useState<'week' | 'month'>('week');

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
    groupBy
  });

  // Debug logging in development
  if (import.meta.env.DEV && open) {
    console.debug('[GrowthDrawer]', { 
      growthData, 
      isLoading, 
      error,
      groupBy,
      from: dates.from.toISOString(),
      to: dates.to.toISOString()
    });
  }

  const formatPct = (value: number, showSign = true) => {
    const sign = showSign && value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getPctColor = (value: number) => {
    return value >= 0 ? 'text-emerald-600' : 'text-rose-600';
  };

  const getPctIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown;
  };

  // Generate monthly summary table
  const generateMonthlySummary = () => {
    if (!growthData) return [];
    
    const monthlyData: Record<string, number> = {};
    
    growthData.series.forEach(point => {
      const month = new Date(point.date).toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
      });
      monthlyData[month] = (monthlyData[month] || 0) + point.value;
    });

    const months = Object.entries(monthlyData).map(([month, count], index, arr) => {
      const prevCount = index > 0 ? arr[index - 1][1] : 0;
      const momPct = prevCount > 0 ? ((count - prevCount) / prevCount) * 100 : count > 0 ? 100 : 0;
      
      return { month, count, momPct };
    });

    return months;
  };

  const monthlySummary = generateMonthlySummary();

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl">Crescimento — Últimos 3 Meses</DrawerTitle>
              <DrawerDescription>
                Análise de crescimento da base de clientes
              </DrawerDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 overflow-y-auto pb-8">
          <div className="p-6 space-y-6">
            {/* Period Info & Grouping Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {dates.from.toLocaleDateString('pt-BR')} — {dates.to.toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <Select value={groupBy} onValueChange={(value: 'week' | 'month') => setGroupBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* This Month */}
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mês Atual</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <div className="text-2xl font-bold text-primary">
                      {growthData?.totals.thisMonth || 0}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Novos clientes
                  </p>
                </CardContent>
              </Card>

              {/* Previous Month */}
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mês Anterior</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground">
                      {growthData?.totals.prevMonth || 0}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Novos clientes
                  </p>
                </CardContent>
              </Card>

              {/* MoM Change */}
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Variação M/M</CardTitle>
                  {isLoading ? null : growthData ? (
                    (() => {
                      const Icon = getPctIcon(growthData.momPct);
                      return <Icon className={`h-4 w-4 ${getPctColor(growthData.momPct)}`} />;
                    })()
                  ) : null}
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : growthData ? (
                    <div className={`text-2xl font-bold ${getPctColor(growthData.momPct)}`}>
                      {formatPct(growthData.momPct)}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground">—</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Comparação mensal
                  </p>
                </CardContent>
              </Card>

              {/* Last 3 Months Total */}
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total 3 Meses</CardTitle>
                  <BarChart3 className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <div className="text-2xl font-bold text-primary">
                      {growthData?.totals.last3Months || 0}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Novos clientes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Crescimento por {groupBy === 'week' ? 'Semana' : 'Mês'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[280px] w-full" />
                ) : growthData && growthData.series && growthData.series.length > 0 ? (
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {groupBy === 'week' ? (
                        <AreaChart data={growthData.series}>
                          <XAxis 
                            dataKey="x" 
                            axisLine={false}
                            tickLine={false}
                            className="text-xs"
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            className="text-xs"
                          />
                          <Tooltip
                            labelFormatter={(value) => `Semana: ${value}`}
                            formatter={(value: number) => [value, 'Novos clientes']}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.1}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      ) : (
                        <BarChart data={growthData.series}>
                          <XAxis 
                            dataKey="x" 
                            axisLine={false}
                            tickLine={false}
                            className="text-xs"
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            className="text-xs"
                          />
                          <Tooltip
                            labelFormatter={(value) => `Mês: ${value}`}
                            formatter={(value: number) => [value, 'Novos clientes']}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px'
                            }}
                          />
                          <Bar
                            dataKey="value"
                            fill="hsl(var(--primary))"
                            radius={[2, 2, 0, 0]}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{error ? 'Erro ao carregar dados' : 'Sem dados para exibir'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : monthlySummary.length > 0 ? (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-3 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
                      <div>Mês</div>
                      <div>Novos Clientes</div>
                      <div>MoM %</div>
                    </div>
                    
                    {/* Rows */}
                    {monthlySummary.map((row, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 py-2 text-sm">
                        <div className="font-medium">{row.month}</div>
                        <div>{row.count}</div>
                        <div className={getPctColor(row.momPct)}>
                          {row.momPct === 0 ? '—' : formatPct(row.momPct)}
                        </div>
                      </div>
                    ))}
                    
                    <Separator className="my-2" />
                    
                    {/* Total */}
                    <div className="grid grid-cols-3 gap-4 font-medium text-sm">
                      <div>Total</div>
                      <div>{growthData?.totals.last3Months || 0}</div>
                      <div>—</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum dado disponível para o período
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}