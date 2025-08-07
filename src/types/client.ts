export interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  birthDate?: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
    state: string;
  };
  preferences?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Anamnesis {
  id: string;
  clientId: string;
  healthConditions?: string[];
  allergies?: string[];
  medications?: string[];
  skinType?: 'oleosa' | 'seca' | 'mista' | 'normal' | 'sensivel';
  previousTreatments?: string[];
  contraindications?: string[];
  goals?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcedureRecord {
  id: string;
  clientId: string;
  serviceName: string;
  date: string;
  staffMember: string;
  notes?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  satisfaction?: number; // 1-5 rating
  nextAppointment?: string;
  createdAt: string;
}