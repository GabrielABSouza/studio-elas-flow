import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ComingSoonTileProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  className?: string;
}

export function ComingSoonTile({ 
  icon: Icon, 
  title, 
  subtitle, 
  className 
}: ComingSoonTileProps) {
  return (
    <div
      aria-disabled
      tabIndex={-1}
      className={cn(
        "rounded-xl border bg-muted/30 text-muted-foreground",
        "p-6 flex flex-col select-none pointer-events-none cursor-default",
        "min-h-[140px] justify-between", // Match report card height
        className
      )}
    >
      {/* Header with icon and title/badge */}
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          <Badge variant="outline" className="text-xs px-2 py-0.5 h-5">
            Em breve
          </Badge>
        </div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Content area */}
      <div className="space-y-3">
        {/* Placeholder for where value would be */}
        <div className="h-8 flex items-center">
          <div className="text-muted-foreground/60 text-sm">●●●●●</div>
        </div>
        
        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}