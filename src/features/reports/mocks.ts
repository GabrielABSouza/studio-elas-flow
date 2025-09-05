// Deterministic mock data for reports
export interface Professional {
  id: string;
  name: string;
  commission: number;
  revenue: number;
}

export const mockProfessionals: Professional[] = [
  { id: 'p1', name: 'Dr. Ana Paula', commission: 4280, revenue: 15400 },
  { id: 'p2', name: 'Juliana Santos', commission: 3120, revenue: 12150 },
  { id: 'p3', name: 'Maria F. Costa', commission: 1980, revenue: 8420 },
  { id: 'p4', name: 'Carla Oliveira', commission: 1650, revenue: 6800 },
  { id: 'p5', name: 'Patricia Lima', commission: 1240, revenue: 5200 },
];

export const getTotalRevenue = () => 
  mockProfessionals.reduce((sum, prof) => sum + prof.revenue, 0);

export const getTotalCommission = () => 
  mockProfessionals.reduce((sum, prof) => sum + prof.commission, 0);

export const getTop3ByRevenue = () => 
  [...mockProfessionals].sort((a, b) => b.revenue - a.revenue).slice(0, 3);

export const getTop3ByCommission = () => 
  [...mockProfessionals].sort((a, b) => b.commission - a.commission).slice(0, 3);

// Format currency in BRL
export const formatBRL = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

// Format currency in BRL (short version)
export const formatBRLShort = (value: number): string => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}K`;
  }
  return formatBRL(value);
};

// Calculate percentage of total
export const calculatePercentage = (value: number, total: number): number =>
  total > 0 ? (value / total) * 100 : 0;