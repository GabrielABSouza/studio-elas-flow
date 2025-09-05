import type { 
  BusinessHours, 
  Closure, 
  ClosureScope, 
  CreateClosureRequest, 
  UpdateClosureRequest,
  DEFAULT_BUSINESS_HOURS 
} from '../types/operation';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage (in memory for development)
let currentBusinessHours: BusinessHours = {
  ...DEFAULT_BUSINESS_HOURS,
};

let mockClosures: Closure[] = [
  {
    id: '1',
    scope: 'global',
    title: 'Ano Novo',
    range: { from: '2024-01-01', to: '2024-01-01' },
    note: 'Feriado nacional',
  },
  {
    id: '2',
    scope: 'global',
    title: 'Carnaval',
    range: { from: '2024-02-12', to: '2024-02-14' },
    note: 'Feriado municipal',
  },
  {
    id: '3',
    scope: 'professional',
    title: 'Férias Ana Silva',
    range: { from: '2024-07-01', to: '2024-07-15' },
    professionalId: '1',
    note: 'Férias de verão',
  },
];

// Business Hours API
export async function getBusinessHours(): Promise<BusinessHours> {
  await delay(300);
  return { ...currentBusinessHours };
}

export async function saveBusinessHours(businessHours: BusinessHours): Promise<BusinessHours> {
  await delay(500);
  currentBusinessHours = { ...businessHours };
  return { ...currentBusinessHours };
}

// Closures API
export async function getClosures(scope?: ClosureScope): Promise<Closure[]> {
  await delay(300);
  if (scope) {
    return mockClosures.filter(closure => closure.scope === scope);
  }
  return [...mockClosures];
}

export async function createClosure(data: CreateClosureRequest): Promise<Closure> {
  await delay(500);
  const newClosure: Closure = {
    id: crypto.randomUUID(),
    ...data,
  };
  mockClosures.push(newClosure);
  return newClosure;
}

export async function updateClosure(data: UpdateClosureRequest): Promise<Closure> {
  await delay(500);
  const index = mockClosures.findIndex(closure => closure.id === data.id);
  if (index === -1) {
    throw new Error('Closure not found');
  }
  
  const updatedClosure: Closure = {
    ...mockClosures[index],
    title: data.title,
    range: data.range,
    professionalId: data.professionalId,
    note: data.note,
  };
  
  mockClosures[index] = updatedClosure;
  return updatedClosure;
}

export async function deleteClosure(id: string): Promise<void> {
  await delay(300);
  const index = mockClosures.findIndex(closure => closure.id === id);
  if (index === -1) {
    throw new Error('Closure not found');
  }
  mockClosures.splice(index, 1);
}