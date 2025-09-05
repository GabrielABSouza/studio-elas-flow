import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { DollarSign, Users, Target, TrendingUp } from 'lucide-react';

export type ReportType = 'revenue.total' | 'revenue.byMethod' | 'revenue.byPro' | 'commission.total' | 'commission.byPro' | 'commission.forecast';

export interface FavoriteReport {
  id: string;
  reportType: ReportType;
  title: string;
  period: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: { text: string; variant: 'default' | 'secondary' };
  order: number;
  createdAt: string;
}

interface ReportFilters {
  from: Date;
  to: Date;
  status?: string[];
  professionalId?: string;
}

const reportMetadata = {
  'revenue.total': {
    title: 'Faturamento Total',
    icon: DollarSign,
  },
  'revenue.byMethod': {
    title: 'Faturamento por Modalidade',
    icon: Target,
  },
  'revenue.byPro': {
    title: 'Faturamento por Profissional',
    icon: Users,
  },
  'commission.total': {
    title: 'Comissão Total',
    icon: DollarSign,
    badge: { text: 'realizado', variant: 'secondary' as const },
  },
  'commission.byPro': {
    title: 'Comissão por Profissional',
    icon: Users,
    badge: { text: 'realizado', variant: 'secondary' as const },
  },
  'commission.forecast': {
    title: 'Projeção - Próxima Semana',
    icon: TrendingUp,
  },
};

const STORAGE_KEY = 'report-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setFavorites(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Save to localStorage whenever favorites change
  const saveFavorites = useCallback((newFavorites: FavoriteReport[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
      toast.error('Erro ao salvar favoritos');
    }
  }, []);

  // Check if a report is favorited
  const isFavorited = useCallback((reportType: ReportType): boolean => {
    return favorites.some(fav => fav.reportType === reportType);
  }, [favorites]);

  // Generate mock data for a report type
  const generateMockData = useCallback((reportType: ReportType, filters: ReportFilters) => {
    const periodDays = Math.floor((filters.to.getTime() - filters.from.getTime()) / (1000 * 60 * 60 * 24));
    
    const mockValues = {
      'revenue.total': `R$ ${(Math.random() * 50000 + 20000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`,
      'revenue.byMethod': 'PIX: 65%',
      'revenue.byPro': 'Ana: R$ 15.2K',
      'commission.total': `R$ ${(Math.random() * 8000 + 4000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`,
      'commission.byPro': 'Ana: R$ 2.28K',
      'commission.forecast': `R$ ${(Math.random() * 4000 + 2000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`,
    };

    const periodText = periodDays === 1 ? 'hoje' : 
                     periodDays <= 7 ? '7 dias' :
                     periodDays <= 30 ? '30 dias' : 
                     `${periodDays} dias`;

    return {
      value: mockValues[reportType],
      period: reportType === 'commission.forecast' ? 'próxima semana' : periodText,
    };
  }, []);

  // Toggle favorite with optimistic updates
  const toggleFavorite = useCallback((reportType: ReportType, filters: ReportFilters) => {
    const isCurrentlyFavorited = isFavorited(reportType);
    
    if (isCurrentlyFavorited) {
      // Remove from favorites
      const newFavorites = favorites.filter(fav => fav.reportType !== reportType);
      saveFavorites(newFavorites);
      toast.success('Removido dos favoritos');
    } else {
      // Add to favorites
      const metadata = reportMetadata[reportType];
      const mockData = generateMockData(reportType, filters);
      
      const newFavorite: FavoriteReport = {
        id: `fav-${reportType}-${Date.now()}`,
        reportType,
        title: metadata.title,
        period: mockData.period,
        value: mockData.value,
        icon: metadata.icon,
        badge: metadata.badge,
        order: favorites.length + 1,
        createdAt: new Date().toISOString(),
      };

      const newFavorites = [newFavorite, ...favorites].map((fav, index) => ({
        ...fav,
        order: index + 1,
      }));
      
      saveFavorites(newFavorites);
      toast.success('Adicionado aos favoritos');
    }
  }, [favorites, isFavorited, saveFavorites, generateMockData]);

  // Remove favorite
  const removeFavorite = useCallback((reportType: ReportType) => {
    const newFavorites = favorites
      .filter(fav => fav.reportType !== reportType)
      .map((fav, index) => ({ ...fav, order: index + 1 }));
    
    saveFavorites(newFavorites);
    toast.success('Removido dos favoritos');
  }, [favorites, saveFavorites]);

  // Reorder favorites
  const reorderFavorites = useCallback((draggedId: string, targetId: string) => {
    const draggedIndex = favorites.findIndex(fav => fav.id === draggedId);
    const targetIndex = favorites.findIndex(fav => fav.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
      return;
    }

    const newFavorites = [...favorites];
    const [draggedFav] = newFavorites.splice(draggedIndex, 1);
    newFavorites.splice(targetIndex, 0, draggedFav);
    
    // Update order property
    const reorderedFavorites = newFavorites.map((fav, index) => ({
      ...fav,
      order: index + 1,
    }));

    saveFavorites(reorderedFavorites);
  }, [favorites, saveFavorites]);

  return {
    favorites: favorites.sort((a, b) => a.order - b.order),
    isLoading,
    isFavorited,
    toggleFavorite,
    removeFavorite,
    reorderFavorites,
  };
}