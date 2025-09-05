import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, ExternalLink, FileText, FileSpreadsheet } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { CalendarRangePopover, type DateRange } from '@/components/common/CalendarRangePopover';
import { type ReportType } from '../hooks/useFavorites';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getTop3ByRevenue, getTop3ByCommission, formatBRL } from '../mocks';

interface ReportFilters {
  from: Date;
  to: Date;
  status?: string[];
  professionalId?: string;
}

interface ReportDrawerProps {
  reportType: ReportType;
  filters: ReportFilters;
  onClose: () => void;
}

interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
  total?: number;
}

interface TableData {
  headers: string[];
  rows: Array<Record<string, string | number>>;
}

const reportConfigs = {
  'revenue.total': {
    title: 'Faturamento Total',
    description: 'Receita total acumulada no período',
    chartType: 'line' as const,
    exportFormats: ['csv', 'xlsx', 'pdf'] as const,
  },
  'revenue.byMethod': {
    title: 'Vendas por Modalidade de Pagamento',
    description: 'Distribuição da receita por forma de pagamento',
    chartType: 'donut' as const,
    exportFormats: ['csv', 'xlsx', 'pdf'] as const,
  },
  'revenue.byPro': {
    title: 'Faturamento por Profissional',
    description: 'Ranking dos profissionais por receita gerada',
    chartType: 'bar' as const,
    exportFormats: ['csv', 'xlsx', 'pdf'] as const,
  },
  'commission.total': {
    title: 'Comissão Total Realizada',
    description: 'Comissões pagas no período',
    chartType: 'line' as const,
    exportFormats: ['csv', 'xlsx', 'pdf'] as const,
  },
  'commission.byPro': {
    title: 'Comissão por Profissional',
    description: 'Ranking de comissões por profissional',
    chartType: 'bar' as const,
    exportFormats: ['csv', 'xlsx', 'pdf'] as const,
  },
  'commission.forecast': {
    title: 'Projeção de Comissão - Próxima Semana',
    description: 'Estimativa de comissões baseada em agendamentos confirmados',
    chartType: 'bar' as const,
    exportFormats: ['csv', 'xlsx', 'pdf'] as const,
  },
  'cost.total': {
    title: 'Custo Total',
    description: 'Relatório em desenvolvimento',
    chartType: 'line' as const,
    exportFormats: ['csv', 'xlsx', 'pdf'] as const,
  },
};

// Mock chart component
function MockChart({ type, data }: { type: 'line' | 'donut' | 'bar'; data: ChartData }) {
  const getChartElement = () => {
    switch (type) {
      case 'line': {
        const chartData = data.labels.map((label, index) => ({
          name: label,
          value: data.values[index],
        }));

        return (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData}
                barCategoryGap={8}
                barGap={2}
                margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
              >
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL',
                      notation: 'compact'
                    }).format(value)
                  }
                />
                <Tooltip
                  formatter={(value: number) => [
                    new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(value),
                    'Faturamento'
                  ]}
                  labelFormatter={(label) => `Semana: ${label}`}
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
            </ResponsiveContainer>
          </div>
        );
      }
      
      case 'donut': {
        const total = data.total || data.values.reduce((acc, val) => acc + val, 0);
        const formatCurrency = (value: number) => 
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        const formatPercent = (value: number, total: number) => 
          new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / total);

        return (
          <div className="h-80 p-4">
            {/* Responsive grid: donut + legend */}
            <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-6 h-full items-center">
              {/* Donut Chart */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <svg width="160" height="160" className="transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      stroke="hsl(var(--muted))"
                      strokeWidth="20"
                      fill="none"
                      opacity="0.2"
                    />
                    {data.values.map((value, index) => {
                      const percentage = value / total;
                      const offset = data.values.slice(0, index).reduce((acc, val) => acc + val / total, 0);
                      const strokeDasharray = `${percentage * 377} 377`; // 2π * 60
                      const strokeDashoffset = -offset * 377;
                      const color = data.colors?.[index] || `hsl(var(--chart-${index + 1}))`;
                      
                      return (
                        <circle
                          key={index}
                          cx="80"
                          cy="80"
                          r="60"
                          stroke={color}
                          strokeWidth="20"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          fill="none"
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold">{formatCurrency(total)}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {data.labels.map((label, index) => {
                  const value = data.values[index];
                  const color = data.colors?.[index] || `hsl(var(--chart-${index + 1}))`;
                  return (
                    <div key={index} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm truncate">{label}:</span>
                      </div>
                      <div className="text-sm font-medium text-right">
                        {formatCurrency(value)} ({formatPercent(value, total)})
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Empty state */}
            {data.values.length === 0 && (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Sem dados no período
              </div>
            )}
          </div>
        );
      }
      
      case 'bar':
        return (
          <div className="h-64 flex flex-col justify-center space-y-4 px-4">
            {data.labels.map((label, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-sm w-24 text-right">{label}</span>
                <div className="flex-1 bg-muted rounded">
                  <div
                    className="h-6 bg-gradient-to-r from-primary to-primary/80 rounded flex items-center justify-end px-2"
                    style={{ width: `${(data.values[index] / Math.max(...data.values)) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">
                      {typeof data.values[index] === 'number' ? data.values[index].toLocaleString() : data.values[index]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return <div className="h-64 bg-muted rounded flex items-center justify-center">Gráfico {type}</div>;
    }
  };

  return (
    <Card className="border-primary/10">
      <CardHeader>
        <CardTitle className="text-base">Visualização</CardTitle>
      </CardHeader>
      <CardContent>
        {getChartElement()}
      </CardContent>
    </Card>
  );
}

type PeriodPreset = 'today' | '7d' | '30d' | 'custom';

export function ReportDrawer({ reportType, filters, onClose }: ReportDrawerProps) {
  const [, setSearchParams] = useSearchParams();
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'pdf'>('csv');
  
  // Independent drawer filters - initialize with dashboard period
  const [drawerPeriod, setDrawerPeriod] = useState<PeriodPreset>(() => {
    const daysDiff = Math.ceil((filters.to.getTime() - filters.from.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 1) return 'today';
    if (daysDiff <= 7) return '7d';
    if (daysDiff <= 30) return '30d';
    return 'custom';
  });
  const [drawerCustomRange, setDrawerCustomRange] = useState<DateRange>(() => {
    const daysDiff = Math.ceil((filters.to.getTime() - filters.from.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 30 ? { from: filters.from, to: filters.to } : { from: null, to: null };
  });
  
  const config = reportConfigs[reportType];

  const getDrawerDateRange = (): { from: Date; to: Date } | null => {
    if (drawerPeriod === 'custom') {
      if (drawerCustomRange.from && drawerCustomRange.to) {
        return { from: drawerCustomRange.from, to: drawerCustomRange.to };
      }
      return null; // Don't trigger queries until both dates are selected
    }
    const days = drawerPeriod === 'today' ? 0 : drawerPeriod === '7d' ? 7 : 30;
    const from = new Date();
    if (days > 0) {
      from.setDate(from.getDate() - days);
    }
    return {
      from,
      to: new Date(),
    };
  };

  const dateRange = getDrawerDateRange();
  const drawerFilters = dateRange ? {
    ...dateRange,
    // Status sempre inclui to_confirm, confirmed, completed internamente
    status: ['to_confirm', 'confirmed', 'completed'] as string[],
    professionalId: undefined,
  } : null;

  // Mock data - replace with real API calls based on reportType and filters
  const getMockData = (): { chart: ChartData; table: TableData } => {
    switch (reportType) {
      case 'revenue.total':
        return {
          chart: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'],
            values: [8450, 12300, 15200, 18900, 22600],
          },
          table: {
            headers: ['Semana', 'Agendamentos', 'Receita'],
            rows: [
              { semana: 'Sem 1 (30/10 - 05/11)', agendamentos: 32, receita: 'R$ 8.450' },
              { semana: 'Sem 2 (06/11 - 12/11)', agendamentos: 41, receita: 'R$ 12.300' },
              { semana: 'Sem 3 (13/11 - 19/11)', agendamentos: 48, receita: 'R$ 15.200' },
              { semana: 'Sem 4 (20/11 - 26/11)', agendamentos: 52, receita: 'R$ 18.900' },
              { semana: 'Sem 5 (27/11 - 03/12)', agendamentos: 58, receita: 'R$ 22.600' },
            ],
          },
        };
      
      case 'revenue.byMethod': {
        const paymentData = [
          { modalidade: 'PIX', receita: 29432, taxa: 0, custo: 0, liquido: 29432, color: 'hsl(var(--chart-1))' },
          { modalidade: 'Débito', receita: 9056, taxa: 1.39, custo: 125.88, liquido: 8930.12, color: 'hsl(var(--chart-2))' },
          { modalidade: 'Crédito', receita: 4528, taxa: 2.49, custo: 112.75, liquido: 4415.25, color: 'hsl(var(--chart-3))' },
          { modalidade: 'Dinheiro', receita: 1358, taxa: 0, custo: 0, liquido: 1358, color: 'hsl(var(--chart-4))' },
          { modalidade: 'Voucher', receita: 906, taxa: 0, custo: 0, liquido: 906, color: 'hsl(var(--chart-5))' },
        ];
        const totalValue = paymentData.reduce((acc, item) => acc + item.receita, 0);
        const totalCost = paymentData.reduce((acc, item) => acc + item.custo, 0);
        const totalNet = paymentData.reduce((acc, item) => acc + item.liquido, 0);
        const sortedData = paymentData.sort((a, b) => b.receita - a.receita);
        
        return {
          chart: {
            labels: sortedData.map(item => item.modalidade),
            values: sortedData.map(item => item.receita),
            colors: sortedData.map(item => item.color),
            total: totalValue,
          },
          table: {
            headers: ['Modalidade', 'Receita Bruta', 'Taxa', 'Custo', 'Receita Líquida'],
            rows: sortedData.map(item => ({
              modalidade: item.modalidade,
              receita: item.receita,
              taxa: item.taxa,
              custo: item.custo,
              liquido: item.liquido,
              percentual: (item.receita / totalValue) * 100,
              color: item.color,
            })),
            totals: {
              receita: totalValue,
              custo: totalCost,
              liquido: totalNet,
            },
          },
        };
      }
      
      case 'revenue.byPro': {
        const topProfessionals = getTop3ByRevenue();
        return {
          chart: {
            labels: topProfessionals.map(prof => prof.name.split(' ')[0]), // Primeiro nome
            values: topProfessionals.map(prof => prof.revenue),
          },
          table: {
            headers: ['Posição', 'Profissional', 'Agendamentos', 'Receita', '% do Total'],
            rows: topProfessionals.map((prof, index) => ({
              posicao: `${index + 1}º`,
              profissional: prof.name,
              agendamentos: Math.floor(prof.revenue / 180), // Mock: ~R$180 por agendamento
              receita: formatBRL(prof.revenue),
              percentual: `${((prof.revenue / topProfessionals.reduce((sum, p) => sum + p.revenue, 0)) * 100).toFixed(1)}%`,
            })),
          },
        };
      }
      
      case 'commission.byPro': {
        const topProfessionals = getTop3ByCommission();
        return {
          chart: {
            labels: topProfessionals.map(prof => prof.name.split(' ')[0]), // Primeiro nome
            values: topProfessionals.map(prof => prof.commission),
          },
          table: {
            headers: ['Posição', 'Profissional', 'Agendamentos', 'Receita', 'Comissão', '% Comissão'],
            rows: topProfessionals.map((prof, index) => ({
              posicao: `${index + 1}º`,
              profissional: prof.name,
              agendamentos: Math.floor(prof.revenue / 180), // Mock: ~R$180 por agendamento
              receita: formatBRL(prof.revenue),
              comissao: formatBRL(prof.commission),
              percentualComissao: `${((prof.commission / prof.revenue) * 100).toFixed(1)}%`,
            })),
          },
        };
      }
      
      case 'commission.forecast':
        return {
          chart: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            values: [420, 580, 650, 720, 890, 760, 400],
          },
          table: {
            headers: ['Data', 'Profissional', 'Agendamentos', 'Comissão Projetada'],
            rows: [
              { data: '11/11 (Seg)', profissional: 'Ana Silva', agendamentos: 6, comissao: 'R$ 180' },
              { data: '11/11 (Seg)', profissional: 'Bruno Costa', agendamentos: 4, comissao: 'R$ 240' },
              { data: '12/11 (Ter)', profissional: 'Ana Silva', agendamentos: 8, comissao: 'R$ 320' },
              { data: '12/11 (Ter)', profissional: 'Carla Santos', agendamentos: 5, comissao: 'R$ 260' },
            ],
          },
        };
      
      case 'cost.total':
        return {
          chart: { labels: [], values: [] },
          table: { headers: [], rows: [] },
        };
      
      default:
        return {
          chart: { labels: [], values: [] },
          table: { headers: [], rows: [] },
        };
    }
  };

  const mockData = getMockData();


  const handleExport = () => {
    if (!drawerFilters) {
      alert('Selecione um período válido para exportar.');
      return;
    }
    
    // Mock export functionality
    const fileName = `${config.title.toLowerCase().replace(/\s+/g, '-')}.${exportFormat}`;
    console.log(`Exportando ${fileName} com filtros:`, drawerFilters);
    
    // In a real implementation, this would trigger the actual export
    alert(`Exportação iniciada: ${fileName}`);
  };

  const handleFullReport = () => {
    // Update URL to deep-link to this report
    if (!drawerFilters) return;
    
    const params = new URLSearchParams();
    params.set('report', reportType);
    params.set('from', drawerFilters.from.toISOString().split('T')[0]);
    params.set('to', drawerFilters.to.toISOString().split('T')[0]);
    if (drawerFilters.professionalId) params.set('professional', drawerFilters.professionalId);
    
    setSearchParams(params);
    
    // Navigate to full report page (would be implemented separately)
    console.log('Navegando para relatório completo:', reportType);
  };

  return (
    <Sheet open onOpenChange={() => onClose()}>
      <SheetContent side="right" className="p-0 md:max-w-[1040px]">
        <div className="flex h-[100dvh] flex-col">
          {/* Header */}
          <div className="shrink-0 p-6">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle className="text-xl">{config.title}</SheetTitle>
                  <SheetDescription>{config.description}</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            
            {/* Drawer Independent Filters */}
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center gap-4" style={{ overflow: 'visible' }}>
                {/* Período */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Período:</span>
                  <Select value={drawerPeriod} onValueChange={(value: PeriodPreset) => setDrawerPeriod(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="7d">7 dias</SelectItem>
                      <SelectItem value="30d">30 dias</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {drawerPeriod === 'custom' && (
                    <CalendarRangePopover
                      value={drawerCustomRange}
                      onChange={setDrawerCustomRange}
                      onComplete={(range) => setDrawerCustomRange(range)}
                      placeholder="Selecionar período"
                      className="w-64"
                    />
                  )}
                </div>
              </div>

              {/* Filter Chips Display */}
              <div className="flex flex-wrap gap-2">
                {drawerFilters && (
                  <Badge variant="outline">
                    {drawerFilters.from.toLocaleDateString('pt-BR')} - {drawerFilters.to.toLocaleDateString('pt-BR')}
                  </Badge>
                )}
                {reportType.includes('commission') && reportType !== 'commission.forecast' && (
                  <Badge variant="secondary">realizado</Badge>
                )}
              </div>
            </div>
          </div>

          {/* BODY rolável */}
          <div className="grow overflow-y-auto px-6 pb-28">
            <div className="space-y-6">
              {/* Development placeholder for cost.total */}
              {reportType === 'cost.total' ? (
                <Card className="border-primary/10">
                  <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-lg">Relatório em Desenvolvimento</h3>
                      <p className="text-muted-foreground max-w-md">
                        O relatório de Custo Total está sendo implementado e estará disponível em breve.
                        Inclurá análise de comissões, impostos, taxas de cartão e outros custos operacionais.
                      </p>
                    </div>
                    <Badge variant="outline" className="mt-2">Em breve</Badge>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Chart */}
                  <MockChart type={config.chartType} data={mockData.chart} />

                  {/* Table */}
                  <Card className="border-primary/10">
                    <CardHeader>
                      <CardTitle className="text-base">Dados Detalhados</CardTitle>
                    </CardHeader>
                    <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {mockData.table.headers.map(header => (
                          <TableHead key={header}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockData.table.rows.map((row, index) => {
                        // Tratamento especial para a tabela de modalidades de pagamento
                        if (reportType === 'revenue.byMethod') {
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: row.color as string }}
                                  />
                                  {row.modalidade}
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Intl.NumberFormat('pt-BR', { 
                                  style: 'currency', 
                                  currency: 'BRL' 
                                }).format(row.receita as number)}
                              </TableCell>
                              <TableCell>
                                <span className={row.taxa === 0 ? "text-muted-foreground" : ""}>
                                  {row.taxa === 0 ? "—" : `${row.taxa}%`}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className={row.custo === 0 ? "text-muted-foreground" : "text-destructive"}>
                                  {row.custo === 0 
                                    ? "—" 
                                    : new Intl.NumberFormat('pt-BR', { 
                                        style: 'currency', 
                                        currency: 'BRL' 
                                      }).format(row.custo as number)
                                  }
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-emerald-600">
                                  {new Intl.NumberFormat('pt-BR', { 
                                    style: 'currency', 
                                    currency: 'BRL' 
                                  }).format(row.liquido as number)}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        }
                        // Tabelas genéricas
                        return (
                          <TableRow key={index}>
                            {mockData.table.headers.map(header => (
                              <TableCell key={header}>
                                {row[header.toLowerCase().replace(/\s+/g, '')]}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {/* Total para tabela de modalidades */}
                  {reportType === 'revenue.byMethod' && mockData.table.totals && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Receita Bruta:</span>
                          <span className="font-medium">
                            {new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            }).format(mockData.table.totals.receita)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Custo Total:</span>
                          <span className="font-medium text-destructive">
                            {new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            }).format(mockData.table.totals.custo)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Receita Líquida:</span>
                        <span className="text-emerald-600">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(mockData.table.totals.liquido)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
                </>
              )}
            </div>
          </div>

          {/* Footer fixo/visível */}
          <div className="sticky bottom-0 shrink-0 border-t bg-background/80 backdrop-blur p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Select value={exportFormat} onValueChange={(value: 'csv' | 'xlsx' | 'pdf') => setExportFormat(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        CSV
                      </div>
                    </SelectItem>
                    <SelectItem value="xlsx">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        PDF
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleExport} className="gap-2" disabled={!drawerFilters}>
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
              
              <Button variant="outline" onClick={handleFullReport} className="gap-2" disabled={!drawerFilters}>
                <ExternalLink className="h-4 w-4" />
                Ver relatório completo
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}