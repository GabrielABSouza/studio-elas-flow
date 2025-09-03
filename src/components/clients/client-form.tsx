import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Client } from "@/types/client";

interface ClientFormProps {
  client?: Client | null;
  onSave: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & { anamnesisForm?: File | null, photo?: File | null }) => void;
  onCancel: () => void;
}

const commonPreferences = [
  "Limpeza de Pele",
  "Peeling",
  "Hidratação Facial",
  "Massagem Relaxante",
  "Depilação",
  "Design de Sobrancelhas",
  "Extensão de Cílios",
  "Microagulhamento",
  "Radiofrequência",
  "Drenagem Linfática"
];

export function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    birthDate: client?.birthDate || "",
    address: {
      street: client?.address?.street || "",
      city: client?.address?.city || "",
      zipCode: client?.address?.zipCode || "",
      state: client?.address?.state || "",
    },
    preferences: client?.preferences || [],
    notes: client?.notes || "",
    anamnesisForm: null as File | null,
    photo: null as File | null,
  });

  const [newPreference, setNewPreference] = useState("");
  const anamnesisInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addPreference = (preference: string) => {
    if (preference && !formData.preferences.includes(preference)) {
      setFormData(prev => ({
        ...prev,
        preferences: [...prev.preferences, preference]
      }));
    }
    setNewPreference("");
  };

  const removePreference = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.filter(p => p !== preference)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      console.log(`Selected file for ${name}:`, files[0].name);
    }
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
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="street">Rua/Avenida</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, street: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                value={formData.address.zipCode}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, zipCode: e.target.value }
                }))}
                placeholder="00000-000"
              />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.address.city}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, city: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.address.state}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, state: e.target.value }
                }))}
                placeholder="SP"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências de Tratamentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected preferences */}
          {formData.preferences.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.preferences.map((preference) => (
                <Badge key={preference} variant="secondary" className="gap-1 pr-1">
                  {preference}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removePreference(preference)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* Common preferences */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Preferências Comuns:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {commonPreferences
                .filter(pref => !formData.preferences.includes(pref))
                .map((preference) => (
                <Button
                  key={preference}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addPreference(preference)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {preference}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom preference input */}
          <div className="flex gap-2">
            <Input
              placeholder="Adicionar preferência personalizada..."
              value={newPreference}
              onChange={(e) => setNewPreference(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPreference(newPreference);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addPreference(newPreference)}
              disabled={!newPreference}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anexos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => anamnesisInputRef.current?.click()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Ficha de anamnese
            </Button>
            {formData.anamnesisForm && <span className="text-sm text-muted-foreground">{formData.anamnesisForm.name}</span>}
          </div>
          <div className="flex items-center gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => photoInputRef.current?.click()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Foto
            </Button>
            {formData.photo && <span className="text-sm text-muted-foreground">{formData.photo.name}</span>}
          </div>

          <input
            type="file"
            name="anamnesisForm"
            ref={anamnesisInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx"
          />
          <input
            type="file"
            name="photo"
            ref={photoInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Adicione observações importantes sobre a cliente..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {client ? "Atualizar Cliente" : "Salvar Cliente"}
        </Button>
      </div>
    </form>
  );
}