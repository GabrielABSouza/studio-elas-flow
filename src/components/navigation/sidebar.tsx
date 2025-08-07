import { Users, Calendar, CreditCard, Settings, BarChart3, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";

const navigation = [
  {
    name: "Clientes",
    href: "/",
    icon: Users,
    current: true,
  },
  {
    name: "Agendamentos",
    href: "/appointments",
    icon: Calendar,
    current: false,
  },
  {
    name: "Relatórios",
    href: "/reports",
    icon: BarChart3,
    current: false,
  },
  {
    name: "Financeiro",
    href: "/financial",
    icon: CreditCard,
    current: false,
  },
  {
    name: "Configurações",
    href: "/settings",
    icon: Settings,
    current: false,
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Studio Elas
            </h1>
            <p className="text-xs text-muted-foreground">Gestão de Clientes</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11 px-3",
                  isActive && "bg-accent text-accent-foreground shadow-soft"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}