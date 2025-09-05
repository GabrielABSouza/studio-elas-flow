import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, StarOff, GripVertical, DollarSign } from 'lucide-react';
import { type ReportType, type FavoriteReport } from '../hooks/useFavorites';

interface ReportFilters {
  from: Date;
  to: Date;
  status?: string[];
  professionalId?: string;
}

interface FavoritesHubProps {
  filters: ReportFilters;
  onOpenReport: (reportType: ReportType) => void;
  favorites: FavoriteReport[];
  removeFavorite: (reportType: ReportType) => void;
  reorderFavorites: (sourceId: string, targetId: string) => void;
}

export function FavoritesHub({ filters, onOpenReport, favorites, removeFavorite, reorderFavorites }: FavoritesHubProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) return;
    
    reorderFavorites(draggedItem, targetId);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleRemoveFavorite = (reportType: ReportType, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFavorite(reportType);
  };

  if (!favorites || favorites.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Meus Favoritos</h2>
        <Card className="border-dashed border-2 border-primary/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Star className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">Nenhum relatório favoritado</p>
            <p className="text-sm text-muted-foreground">
              Clique na estrela dentro de qualquer relatório para adicionar aos favoritos
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Meus Favoritos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {favorites
          .sort((a, b) => a.order - b.order)
          .map((favorite) => {
            // Fallback para icon quebrado
            const Icon = favorite.icon || DollarSign;
            
            return (
              <Card
                key={favorite.id}
                draggable
                onDragStart={(e) => handleDragStart(e, favorite.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, favorite.id)}
                onDragEnd={handleDragEnd}
                className={`border-primary/10 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] focus-within:ring-2 focus-within:ring-primary/20 relative group ${
                  draggedItem === favorite.id ? 'opacity-50' : ''
                }`}
                onClick={() => onOpenReport(favorite.reportType)}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onOpenReport(favorite.reportType)}
              >
                {/* Drag Handle */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                </div>

                {/* Remove from Favorites */}
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => handleRemoveFavorite(favorite.reportType, e)}
                  >
                    <StarOff className="h-3 w-3" />
                    <span className="sr-only">Remover dos favoritos</span>
                  </Button>
                </div>

                <CardHeader className="flex flex-row items-center space-y-0 pb-2 pr-12">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium">{favorite.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{favorite.value}</span>
                      {favorite.badge && (
                        <Badge variant={favorite.badge.variant} className="text-xs">
                          {favorite.badge.text}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {favorite.period}
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}