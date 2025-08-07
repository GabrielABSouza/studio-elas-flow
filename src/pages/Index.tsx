import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Calendar, BarChart3, Sparkles, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const quickActions = [
    {
      title: "Gerenciar Clientes",
      description: "Cadastro, histórico e acompanhamento de clientes",
      icon: Users,
      href: "/clients",
      color: "text-pink-600"
    },
    {
      title: "Gerenciar Equipe",
      description: "Funcionários, especializações e desempenho",
      icon: UserCheck,
      href: "/staff",
      color: "text-purple-600"
    },
    {
      title: "Agenda",
      description: "Agendamentos e disponibilidade",
      icon: Calendar,
      href: "/schedule",
      color: "text-blue-600"
    },
    {
      title: "Relatórios",
      description: "Análises e métricas do negócio",
      icon: BarChart3,
      href: "/reports",
      color: "text-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Studio Elas
              </h1>
              <p className="text-muted-foreground">Sistema de Gestão</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Bem-vinda ao seu sistema de gestão
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Gerencie sua clínica de estética com elegância e eficiência. 
            Controle clientes, equipe, agendamentos e muito mais em um só lugar.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className="h-full transition-all duration-200 hover:shadow-elegant hover:-translate-y-1 border-primary/10 hover:border-primary/20">
                <CardHeader className="text-center pb-4">
                  <action.icon className={`h-12 w-12 mx-auto mb-4 ${action.color}`} />
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {action.description}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Stats Preview */}
        <div className="grid gap-4 md:grid-cols-3 mb-12">
          <Card className="text-center border-primary/20 shadow-soft">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">127</div>
              <p className="text-sm text-muted-foreground">Clientes Ativas</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-primary/20 shadow-soft">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">8</div>
              <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-primary/20 shadow-soft">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">5</div>
              <p className="text-sm text-muted-foreground">Equipe Ativa</p>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card className="bg-gradient-soft/20 border-primary/20">
          <CardContent className="pt-6 text-center">
            <Heart className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Transformando vidas com beleza</h3>
            <p className="text-muted-foreground">
              No Studio Elas, cada cliente é única e especial. 
              Nosso sistema foi desenvolvido para cuidar de cada detalhe da sua jornada de beleza.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
