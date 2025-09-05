import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Phone, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerCard, CustomerCardSkeleton } from "../components/CustomerCard";
import { useCustomer, useCustomerAppointments } from "../hooks";

interface AppointmentData {
  id: string;
  customerId: string;
  date: string;
  status: 'completed' | 'confirmed' | 'to_confirm';
  procedures: string[];
  professional: string;
  total: number;
}

const AppointmentCard = ({ appointment }: { appointment: AppointmentData }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Executado</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmado</Badge>;
      case 'to_confirm':
        return <Badge className="bg-amber-100 text-amber-800">A Confirmar</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-medium text-card-foreground">
              {new Date(appointment.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(appointment.date).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
        
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Procedimentos</p>
            <p className="font-medium">{appointment.procedures.join(', ')}</p>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-muted-foreground">Profissional</p>
              <p className="font-medium">{appointment.professional}</p>
            </div>
            <p className="font-semibold text-primary">
              R$ {appointment.total.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { 
    data: customer, 
    isLoading: isCustomerLoading, 
    error: customerError,
    refetch: refetchCustomer 
  } = useCustomer(id!);

  const { 
    data: appointments = [], 
    isLoading: isAppointmentsLoading 
  } = useCustomerAppointments(id!);

  if (customerError) {
    return (
      <div className="min-h-screen bg-gradient-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Cliente não encontrado
            </h3>
            <p className="text-muted-foreground mb-6">
              O cliente solicitado não existe ou foi removido do sistema.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={() => refetchCustomer()}>
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Customer Card Header */}
        <div className="mb-8">
          {isCustomerLoading ? (
            <CustomerCardSkeleton className="max-w-4xl" />
          ) : customer ? (
            <CustomerCard
              id={customer.id}
              name={customer.name}
              phone={customer.phone}
              email={customer.email}
              since={customer.createdAt}
              preferencesCount={customer.preferences?.length}
              variant="header"
              className="max-w-4xl"
            />
          ) : null}
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="resumo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Customer Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Informações de Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isCustomerLoading ? (
                    <>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </>
                  ) : customer ? (
                    <>
                      {customer.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                      {customer.birthDate && (
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(customer.birthDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p>{customer.address.street}</p>
                            <p className="text-sm text-muted-foreground">
                              {customer.address.city}, {customer.address.state} - {customer.address.zipCode}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : null}
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Preferências de Tratamento</CardTitle>
                </CardHeader>
                <CardContent>
                  {isCustomerLoading ? (
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-6 w-24 rounded-full" />
                      ))}
                    </div>
                  ) : customer?.preferences && customer.preferences.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {customer.preferences.map((preference, index) => (
                        <Badge key={index} variant="secondary">
                          {preference}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Nenhuma preferência registrada
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {customer?.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{customer.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {isAppointmentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.slice(0, 3).map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum agendamento encontrado
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agendamentos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {isAppointmentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">
                    Nenhum agendamento encontrado para esta cliente
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}