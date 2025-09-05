import { BarChart3, Users, UserCheck, Calendar, Settings, Home, ChevronDown, Scissors, Grid3x3, CreditCard, Package, CalendarClock, Shield } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    description: "Visão geral do sistema"
  },
  {
    title: "Clientes",
    url: "/clients",
    icon: Users,
    description: "Gerenciar clientes"
  },
  {
    title: "Equipe",
    url: "/staff",
    icon: UserCheck,
    description: "Gerenciar funcionários"
  },
  {
    title: "Agenda",
    url: "/schedule",
    icon: Calendar,
    description: "Agendamentos"
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: BarChart3,
    description: "Análises e métricas"
  }
];

const settingsItems = [
  { 
    to: '/config/procedimentos', 
    label: 'Procedimentos', 
    icon: Scissors 
  },
  { 
    to: '/config/matriz', 
    label: 'Matriz', 
    icon: Grid3x3 
  },
  { 
    to: '/config/combos', 
    label: 'Combos', 
    icon: Package 
  },
  { 
    to: '/config/operacao', 
    label: 'Operação', 
    icon: CalendarClock 
  },
  { 
    to: '/config/permissoes', 
    label: 'Permissões', 
    icon: Shield
  },
  { 
    to: '/config/pagamentos', 
    label: 'Recebimentos', 
    icon: CreditCard, 
    disabled: true, 
    soon: true 
  },
];

function SettingsNavGroup() {
  const location = useLocation();
  const { state } = useSidebar();
  const isConfigActive = location.pathname.startsWith('/config');
  
  // Open only on first mount if already in /config/*
  const [open, setOpen] = useState(() => isConfigActive);

  // If leaving /config, ensure it closes
  React.useEffect(() => {
    if (!isConfigActive) {
      setOpen(false);
    }
  }, [isConfigActive]);

  const toggleOpen = () => setOpen(prev => !prev);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen();
    }
  };

  const getSettingsNavClasses = () => {
    const baseClasses = "group transition-all duration-200 hover:bg-gradient-soft/30 rounded-lg w-full text-left";
    if (isConfigActive) {
      return `${baseClasses} bg-gradient-primary text-primary-foreground shadow-elegant`;
    }
    return `${baseClasses} text-muted-foreground hover:text-foreground`;
  };

  const getSubNavClasses = (path: string) => {
    const baseClasses = "group transition-all duration-200 hover:bg-gradient-soft/20 rounded-md text-sm";
    const isActive = location.pathname === path;
    if (isActive) {
      return `${baseClasses} bg-gradient-soft/40 text-foreground font-medium`;
    }
    return `${baseClasses} text-muted-foreground hover:text-foreground`;
  };

  return (
    <div>
      <button
        className={getSettingsNavClasses()}
        aria-expanded={open}
        aria-controls="settings-subnav"
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-3">
            <Settings className={`h-5 w-5 ${
              isConfigActive 
                ? "text-primary-foreground" 
                : "text-muted-foreground group-hover:text-foreground"
            }`} />
            {state !== "collapsed" && (
              <span className="font-medium text-sm">Configurações</span>
            )}
          </div>
          {state !== "collapsed" && (
            <ChevronDown className={cn(
              'h-4 w-4 transition-transform duration-200',
              open && 'rotate-180',
              isConfigActive 
                ? "text-primary-foreground" 
                : "text-muted-foreground group-hover:text-foreground"
            )} />
          )}
        </div>
      </button>

      {state !== "collapsed" && (
        <ul 
          id="settings-subnav" 
          className={cn('mt-1 pl-6 space-y-1 overflow-hidden transition-all duration-200', 
            !open && 'hidden'
          )}
        >
          {settingsItems.map(item => {
            const Icon = (item.icon ?? CreditCard) as React.ComponentType<{ className?: string }>;
            
            return (
              <li key={item.label}>
                {item.disabled ? (
                  <div
                    aria-disabled
                    tabIndex={-1}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground/70 pointer-events-none select-none"
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                    {item.soon && (
                      <span className="ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] leading-none">
                        Em breve
                      </span>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-md',
                        isActive ? 'text-foreground font-medium bg-accent/40' : 'text-muted-foreground hover:bg-accent/30'
                      )
                    }
                    end
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                    {item.soon && (
                      <span className="ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] leading-none">
                        Em breve
                      </span>
                    )}
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "group transition-all duration-200 hover:bg-gradient-soft/30 rounded-lg";
    if (isActive(path)) {
      return `${baseClasses} bg-gradient-primary text-primary-foreground shadow-elegant`;
    }
    return `${baseClasses} text-muted-foreground hover:text-foreground`;
  };

  return (
    <Sidebar className="border-r border-border/50 bg-gradient-background">
      <SidebarContent className="px-3 py-6">
        {/* Studio Elas Brand */}
        <div className="px-3 pb-6 mb-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
              <span className="text-lg font-bold text-white">SE</span>
            </div>
            {state !== "collapsed" && (
              <div>
                <h1 className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
                  Studio Elas
                </h1>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 mb-2">
            Navegação Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink
                      to={item.url}
                      className={getNavClasses(item.url)}
                    >
                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <item.icon className={`h-5 w-5 ${
                          isActive(item.url) 
                            ? "text-primary-foreground" 
                            : "text-muted-foreground group-hover:text-foreground"
                        }`} />
                        {state !== "collapsed" && (
                          <div className="flex-1">
                            <span className="font-medium text-sm">
                              {item.title}
                            </span>
                          </div>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Settings expandable group */}
              <SidebarMenuItem>
                <SettingsNavGroup />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats - Only shown when expanded */}
        {state !== "collapsed" && (
          <div className="mt-8 px-3">
            <div className="rounded-lg bg-gradient-soft/20 p-4 border border-primary/10">
              <h3 className="font-semibold text-sm mb-3 text-card-foreground">
                Status Rápido
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Clientes Ativas</span>
                  <span className="font-medium text-primary">127</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Agendamentos Hoje</span>
                  <span className="font-medium text-primary">8</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Equipe Ativa</span>
                  <span className="font-medium text-primary">4/5</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}