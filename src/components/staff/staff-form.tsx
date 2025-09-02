import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Staff, WorkDay } from "@/types/staff";

// Mock data for demonstration
const allSpecializations = [
  "Limpeza de Pele",
  "Peeling",
  "Hidratação Facial",
  "Massagem Relaxante",
  "Depilação",
  "Design de Sobrancelhas",
  "Extensão de Cílios",
  "Microagulhamento",
  "Radiofrequência",
  "Drenagem Linfática",
  "Harmonização Facial",
  "Preenchimento Labial",
  "Botox"
];

const weekDays = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};


interface StaffFormProps {
  staff?: Staff | null;
  onSave: (staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function StaffForm({ staff, onSave, onCancel }: StaffFormProps) {
  const [formData, setFormData] = useState<Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>>({
    name: staff?.name || "",
    email: staff?.email || "",
    phone: staff?.phone || "",
    role: staff?.role || "esteticista",
    specializations: staff?.specializations || [],
    certifications: staff?.certifications || [],
    commissionRate: staff?.commissionRate || 0,
    isActive: staff?.isActive !== undefined ? staff.isActive : true,
    hireDate: staff?.hireDate || new Date().toISOString().split('T')[0],
    workSchedule: staff?.workSchedule || {
      monday: { isWorking: true, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
      tuesday: { isWorking: true, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
      wednesday: { isWorking: true, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
      thursday: { isWorking: true, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
      friday: { isWorking: true, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
      saturday: { isWorking: false },
      sunday: { isWorking: false },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleSpecializationToggle = (spec: string) => {
    setFormData(prev => {
      const specializations = prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec];
      return { ...prev, specializations };
    });
  };

  const handleWorkDayChange = (day: keyof Staff['workSchedule'], field: keyof WorkDay, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      workSchedule: {
        ...prev.workSchedule,
        [day]: {
          ...prev.workSchedule[day],
          [field]: value,
        },
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} required />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as Staff['role'] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="esteticista">Esteticista</SelectItem>
                  <SelectItem value="recepcionista">Recepcionista</SelectItem>
                  <SelectItem value="assistente">Assistente</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Especializações</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {allSpecializations.map(spec => (
            <Button
              key={spec}
              type="button"
              variant={formData.specializations.includes(spec) ? "default" : "outline"}
              onClick={() => handleSpecializationToggle(spec)}
            >
              {formData.specializations.includes(spec) && <Plus className="h-4 w-4 mr-2 rotate-45" />}
              {spec}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horário de Trabalho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(weekDays).map(([dayKey, dayName]) => {
            const dayData = formData.workSchedule[dayKey as keyof typeof weekDays];
            return (
              <div key={dayKey} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-2 rounded-lg border">
                <div className="md:col-span-2 flex items-center gap-2">
                  <Checkbox 
                    id={`isWorking-${dayKey}`}
                    checked={dayData.isWorking}
                    onCheckedChange={(checked) => handleWorkDayChange(dayKey as keyof Staff['workSchedule'], 'isWorking', !!checked)}
                  />
                  <Label htmlFor={`isWorking-${dayKey}`} className="font-semibold">{dayName}</Label>
                </div>
                <div className="md:col-span-10 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor={`startTime-${dayKey}`} className="text-xs">Início</Label>
                    <Input id={`startTime-${dayKey}`} type="time" value={dayData.startTime || ''} onChange={(e) => handleWorkDayChange(dayKey as keyof Staff['workSchedule'], 'startTime', e.target.value)} disabled={!dayData.isWorking} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`endTime-${dayKey}`} className="text-xs">Fim</Label>
                    <Input id={`endTime-${dayKey}`} type="time" value={dayData.endTime || ''} onChange={(e) => handleWorkDayChange(dayKey as keyof Staff['workSchedule'], 'endTime', e.target.value)} disabled={!dayData.isWorking} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`breakStart-${dayKey}`} className="text-xs">Início Pausa</Label>
                    <Input id={`breakStart-${dayKey}`} type="time" value={dayData.breakStart || ''} onChange={(e) => handleWorkDayChange(dayKey as keyof Staff['workSchedule'], 'breakStart', e.target.value)} disabled={!dayData.isWorking} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`breakEnd-${dayKey}`} className="text-xs">Fim Pausa</Label>
                    <Input id={`breakEnd-${dayKey}`} type="time" value={dayData.breakEnd || ''} onChange={(e) => handleWorkDayChange(dayKey as keyof Staff['workSchedule'], 'breakEnd', e.target.value)} disabled={!dayData.isWorking} />
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {staff ? "Atualizar Funcionário" : "Salvar Funcionário"}
        </Button>
      </div>
    </form>
  );
}
