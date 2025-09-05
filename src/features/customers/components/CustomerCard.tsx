import { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, Calendar, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type CustomerCardProps = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  since?: string; // ISO date para "Cliente desde"
  preferencesCount?: number;
  avatar?: { initials?: string };
  // badges opcionais
  risk?: boolean;
  highPotential?: boolean;
  className?: string;
  onClick?: () => void;
  // For header variant - disable hover effects
  variant?: "default" | "header";
};

export const CustomerCard = forwardRef<HTMLDivElement, CustomerCardProps>(
  (
    {
      id,
      name,
      phone,
      email,
      since,
      preferencesCount,
      avatar,
      risk,
      highPotential,
      className,
      onClick,
      variant = "default",
    },
    ref
  ) => {
    const navigate = useNavigate();

    const getInitials = (name: string) => {
      return (
        avatar?.initials ||
        name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      );
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("pt-BR");
    };

    const handleCardClick = () => {
      if (onClick) {
        onClick();
      } else {
        navigate(`/clientes/${id}`);
      }
    };

    const handleMenuClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    const isClickable = variant === "default";

    return (
      <Card
        ref={ref}
        className={cn(
          "transition-all group",
          isClickable && [
            "cursor-pointer",
            "hover:shadow-elegant",
            "hover:scale-[1.02]",
            "active:scale-[0.99]",
            "focus-visible:ring-2",
            "focus-visible:ring-offset-2",
          ],
          className
        )}
        onClick={isClickable ? handleCardClick : undefined}
        role={isClickable ? "button" : undefined}
        aria-label={isClickable ? `Ver perfil de ${name}` : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCardClick();
                }
              }
            : undefined
        }
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-soft text-primary font-semibold">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {name}
                </h3>
                {phone && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {phone}
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {email}
                  </div>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/clientes/${id}`);
                  }}
                >
                  Ver Perfil
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement edit
                  }}
                >
                  Editar Cliente
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement create appointment
                  }}
                >
                  Criar Agendamento
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement create sale
                  }}
                >
                  Criar Venda
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {since && (
                <>
                  <Calendar className="h-3 w-3" />
                  Cliente desde {formatDate(since)}
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {risk && (
                <Badge variant="destructive" className="text-xs">
                  Em risco
                </Badge>
              )}
              {highPotential && (
                <Badge variant="secondary" className="text-xs">
                  Alto potencial
                </Badge>
              )}
              {preferencesCount !== undefined && preferencesCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {preferencesCount} preferências
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

CustomerCard.displayName = "CustomerCard";

// Skeleton component for loading states
export const CustomerCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
};

CustomerCard.Skeleton = CustomerCardSkeleton;