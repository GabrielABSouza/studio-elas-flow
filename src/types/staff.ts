export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'esteticista' | 'recepcionista' | 'assistente';
  specializations: string[];
  certifications: string[];
  commissionRate: number; // Percentage (0-100)
  isActive: boolean;
  profileImage?: string;
  birthDate?: string;
  hireDate: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
    state: string;
  };
  workSchedule: {
    monday: WorkDay;
    tuesday: WorkDay;
    wednesday: WorkDay;
    thursday: WorkDay;
    friday: WorkDay;
    saturday: WorkDay;
    sunday: WorkDay;
  };
  documents?: {
    cpf?: string;
    rg?: string;
    professionalLicense?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkDay {
  isWorking: boolean;
  startTime?: string; // "09:00"
  endTime?: string;   // "18:00"
  breakStart?: string; // "12:00"
  breakEnd?: string;   // "13:00"
}

export interface StaffPerformance {
  staffId: string;
  month: string; // "2024-01"
  servicesCompleted: number;
  totalRevenue: number;
  totalCommission: number;
  averageRating: number;
  clientsServed: number;
  noShowRate: number;
}