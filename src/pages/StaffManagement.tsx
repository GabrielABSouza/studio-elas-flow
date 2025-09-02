import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StaffDashboard } from "@/components/staff/staff-dashboard";
import { StaffForm } from "@/components/staff/staff-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Staff } from "@/types/staff";
import { Plus, Users, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data para demonstração
const mockStaff: Staff[] = [
  {
    id: "1",
    name: "Dr. Ana Paula Silva",
    email: "ana.silva@studioelas.com",
    phone: "(11) 99999-1234",
    role: "esteticista",
    specializations: ["Harmonização Facial", "Preenchimento Labial", "Botox"],
    certifications: ["CRF 12345", "Especialização em Dermatologia Estética"],
    commissionRate: 40,
    isActive: true,
    hireDate: "2023-01-15",
    workSchedule: {
      monday: { isWorking: true, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
      tuesday: { isWorking: true, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
      wednesday: { isWorking: true, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
      thursday: { isWorking: true, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
      friday: { isWorking: true, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
      saturday: { isWorking: true, startTime: "08:00", endTime: "14:00" },
      sunday: { isWorking: false }
    },
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    name: "Maria Fernanda Costa",
    email: "maria.costa@studioelas.com",
    phone: "(11) 98888-5678",
    role: "recepcionista",
    specializations: ["Atendimento ao Cliente", "Agendamento"],
    certifications: ["Curso de Atendimento ao Cliente"],
    commissionRate: 5,
    isActive: true,
    hireDate: "2023-03-01",
    workSchedule: {
      monday: { isWorking: true, startTime: "07:00", endTime: "16:00", breakStart: "11:30", breakEnd: "12:30" },
      tuesday: { isWorking: true, startTime: "07:00", endTime: "16:00", breakStart: "11:30", breakEnd: "12:30" },
      wednesday: { isWorking: true, startTime: "07:00", endTime: "16:00", breakStart: "11:30", breakEnd: "12:30" },
      thursday: { isWorking: true, startTime: "07:00", endTime: "16:00", breakStart: "11:30", breakEnd: "12:30" },
      friday: { isWorking: true, startTime: "07:00", endTime: "16:00", breakStart: "11:30", breakEnd: "12:30" },
      saturday: { isWorking: true, startTime: "08:00", endTime: "14:00" },
      sunday: { isWorking: false }
    },
    createdAt: "2023-03-01T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "3",
    name: "Juliana Santos",
    email: "juliana.santos@studioelas.com",
    phone: "(11) 97777-9012",
    role: "esteticista",
    specializations: ["Limpeza de Pele", "Microagulhamento", "Peeling"],
    certifications: ["Técnico em Estética", "Curso de Microagulhamento"],
    commissionRate: 35,
    isActive: true,
    hireDate: "2023-06-15",
    workSchedule: {
      monday: { isWorking: false },
      tuesday: { isWorking: true, startTime: "13:00", endTime: "21:00", breakStart: "17:00", breakEnd: "18:00" },
      wednesday: { isWorking: true, startTime: "13:00", endTime: "21:00", breakStart: "17:00", breakEnd: "18:00" },
      thursday: { isWorking: true, startTime: "13:00", endTime: "21:00", breakStart: "17:00", breakEnd: "18:00" },
      friday: { isWorking: true, startTime: "13:00", endTime: "21:00", breakStart: "17:00", breakEnd: "18:00" },
      saturday: { isWorking: true, startTime: "08:00", endTime: "16:00", breakStart: "12:00", breakEnd: "13:00" },
      sunday: { isWorking: true, startTime: "08:00", endTime: "14:00" }
    },
    createdAt: "2023-06-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  }
];

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const { toast } = useToast();

  const handleNewStaff = () => {
    setEditingStaff(null);
    setIsFormOpen(true);
  };

  const handleSaveStaff = (staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingStaff) {
      // Update existing staff
      const updatedStaff: Staff = {
        ...editingStaff,
        ...staffData,
        updatedAt: new Date().toISOString()
      };
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? updatedStaff : s));
      toast({
        title: "Funcionário atualizado!",
        description: "Os dados do funcionário foram atualizados com sucesso.",
      });
    } else {
      // Create new staff
      const newStaff: Staff = {
        ...staffData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setStaff(prev => [newStaff, ...prev]);
      toast({
        title: "Funcionário cadastrado!",
        description: "Novo funcionário foi adicionado ao sistema.",
      });
    }
    
    setIsFormOpen(false);
    setEditingStaff(null);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingStaff(null);
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <PageHeader
        title="Gerenciamento de Equipe"
        description="Gerencie sua equipe, especializações e desempenho"
      >
        {!isFormOpen && (
          <Button onClick={handleNewStaff} className="gap-2 shadow-elegant">
            <Plus className="h-4 w-4" />
            Novo Funcionário
          </Button>
        )}
      </PageHeader>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2">
              <Users className="h-4 w-4" />
              Equipe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <StaffDashboard staff={staff} />
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lista de Funcionários</h3>
              <p className="text-muted-foreground mb-6">
                Componente em desenvolvimento para listagem e gerenciamento detalhado da equipe
              </p>
              <Button onClick={handleNewStaff} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Funcionário
              </Button>
            </div>
          </TabsContent>

        </Tabs>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStaff ? "Editar Funcionário" : "Novo Funcionário"}
              </DialogTitle>
            </DialogHeader>
            <StaffForm
              staff={editingStaff}
              onSave={handleSaveStaff}
              onCancel={handleCancelForm}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}