import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarRangePopover, type DateRange } from '@/components/common/CalendarRangePopover';
import { Download, TrendingUp, TrendingDown, DollarSign, Users, Target } from 'lucide-react';
import { ReportDrawer } from '@/features/reports/components/ReportDrawer';
import { type ReportType } from '@/features/reports/hooks/useFavorites';
import { getTop3ByRevenue, getTop3ByCommission, formatBRLShort } from '@/features/reports/mocks';
import { ComingSoonTile } from '@/components/common/ComingSoonTile';

type PeriodPreset = 'today' | '7d' | '30d' | 'custom';

export default function Reports() {
  const [period, setPeriod] = useState<PeriodPreset>('30d');
  const [customRange, setCustomRange] = useState<DateRange>({ from: null, to: null });
  const [openDrawer, setOpenDrawer] = useState<ReportType | null>(null);

  const getDateRange = (): { from: Date; to: Date } | null => {
    if (period === 'custom') {
      if (customRange.from && customRange.to) {
        return { from: customRange.from, to: customRange.to };
      }
      return null; // Don't trigger queries until both dates are selected
    }
    const days = period === 'today' ? 0 : period === '7d' ? 7 : 30;
    const from = new Date();
    if (days > 0) {
      from.setDate(from.getDate() - days);
    }
    return {
      from,
      to: new Date(),
    };
  };

  const dateRange = getDateRange();
  const filters = dateRange ? {
    ...dateRange,
    // Status sempre inclui to_confirm, confirmed, completed e exclui canceled
    status: ['to_confirm', 'confirmed', 'completed'] as string[],
    professionalId: undefined,
  } : null;

  // Mock data para os cards de relatórios
  const topProfsByRevenue = getTop3ByRevenue();
  const topProfsByCommission = getTop3ByCommission();
  
  const reportCards = [
    {
      id: 'revenue.total' as ReportType,
      title: 'Faturamento Total',
      description: 'Receita total do período',
      icon: DollarSign,
      value: 'R$ 47.970',
      change: { value: 12.5, trend: 'up' as const },
      miniChart: <div className="h-8 w-16 bg-gradient-to-r from-primary/10 to-primary/30 rounded" />,
    },
    {
      id: 'revenue.byMethod' as ReportType,
      title: 'Vendas por Modalidade',
      description: 'Distribuição por forma de pagamento',
      icon: Target,
      value: 'R$ 47.970',
      miniChart: (
        <div className="flex items-center gap-1 h-8">
          <div className="grid grid-cols-2 gap-1 w-8 h-8">
            <div className="rounded-full bg-[hsl(var(--chart-1))]" />
            <div className="rounded-full bg-[hsl(var(--chart-2))]" />
            <div className="rounded-full bg-[hsl(var(--chart-3))]" />
            <div className="rounded-full bg-[hsl(var(--chart-4))]" />
          </div>
        </div>
      ),
    },
    {
      id: 'revenue.byPro' as ReportType,
      title: 'Faturamento por Profissional',
      description: 'Top 3 profissionais',
      icon: Users,
      value: `${topProfsByRevenue[0].name.split(' ')[0]}: ${formatBRLShort(topProfsByRevenue[0].revenue)}`,
      miniChart: <div className="space-y-1">
        <div className="h-1 w-12 bg-primary rounded" />
        <div className="h-1 w-8 bg-primary/70 rounded" />
        <div className="h-1 w-6 bg-primary/40 rounded" />
      </div>,
    },
    {
      id: 'commission.byPro' as ReportType,
      title: 'Comissão por Profissional',
      description: 'Top 3 comissões',
      icon: Users,
      value: `${topProfsByCommission[0].name.split(' ')[0]}: ${formatBRLShort(topProfsByCommission[0].commission)}`,
      badge: { text: 'realizado', variant: 'secondary' as const },
      miniChart: <div className="space-y-1">
        <div className="h-1 w-10 bg-secondary rounded" />
        <div className="h-1 w-7 bg-secondary/70 rounded" />
        <div className="h-1 w-5 bg-secondary/40 rounded" />
      </div>,
    },
    {
      id: 'commission.forecast' as ReportType,
      title: 'Projeção - Próxima Semana',
      description: 'Comissão projetada',
      icon: TrendingUp,
      value: 'R$ 3.420',
      change: { value: 8.7, trend: 'up' as const },
      miniChart: <div className="flex items-end space-x-px h-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-2 bg-primary/60 rounded-t" style={{ height: `${20 + Math.random() * 12}px` }} />
        ))}
      </div>,
    },
  ];

  const handlePeriodChange = (newPeriod: PeriodPreset) => {
    setPeriod(newPeriod);
  };

  const handleCustomRangeChange = (range: DateRange) => {
    setCustomRange(range);
  };

  const handleCustomRangeComplete = (range: Required<DateRange>) => {
    setCustomRange(range);
  };



  return (
    <div className="min-h-screen bg-gradient-background">
      <PageHeader
        title="Relatórios"
        description="Acompanhe indicadores e exporte relatórios detalhados"
      >
        <Button variant="outline" disabled className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </PageHeader>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Filtros Globais */}
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4" style={{ overflow: 'visible' }}>
              {/* Período */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Período:</span>
                <Select value={period} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="7d">7 dias</SelectItem>
                    <SelectItem value="30d">30 dias</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
                
                {period === 'custom' && (
                  <CalendarRangePopover
                    value={customRange}
                    onChange={handleCustomRangeChange}
                    onComplete={handleCustomRangeComplete}
                    placeholder="Selecionar período"
                    className="w-64"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard de KPIs */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.id}
                  className="border-primary/10 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] focus-within:ring-2 focus-within:ring-primary/20 group"
                  onClick={() => setOpenDrawer(card.id)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setOpenDrawer(card.id)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{card.value}</span>
                          {card.badge && (
                            <Badge variant={card.badge.variant} className="text-xs">
                              {card.badge.text}
                            </Badge>
                          )}
                        </div>
                        {card.change && (
                          <div className={`flex items-center gap-1 mt-1 text-xs ${
                            card.change.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {card.change.trend === 'up' ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {Math.abs(card.change.value)}%
                          </div>
                        )}
                      </div>
                      {card.miniChart && (
                        <div className="flex items-center">
                          {card.miniChart}
                        </div>
                      )}
                    </div>
                    <CardDescription className="mt-2">{card.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Coming Soon Tile for Cost Total */}
            <ComingSoonTile
              icon={DollarSign}
              title="Custo Total"
              subtitle="Consolidação de taxas por modalidade e outros custos"
            />
          </div>
        </div>
      </div>

      {/* Report Drawer */}
      {openDrawer && (
        <ReportDrawer
          reportType={openDrawer}
          filters={filters}
          onClose={() => setOpenDrawer(null)}
        />
      )}
    </div>
  );
}