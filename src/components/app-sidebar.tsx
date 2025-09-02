import { BarChart3, Users, UserCheck, Calendar, Settings, Home } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
    description: "Configurações do sistema"
  }
];

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
                  <span className="text-muted-foreground">Equipe Online</span>
                  <span className="font-medium text-secondary">4/5</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}