
export type ProjectStatus = 'À Démarrer' | 'En Cours' | 'En Révision' | 'Terminé';
export type TaskPriority = 'Basse' | 'Moyenne' | 'Haute';
export type View = 'dashboard' | 'clients' | 'projects' | 'tasks' | 'calendar' | 'clientDetail' | 'notes' | 'settings';
export type ModalType = 'hub' | 'newClient' | 'newProject' | 'newTask' | 'newVideo' | 'newEvent' | null;


export interface FreelancerProfile {
  name: string;
  title: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  proId?: string; // e.g. SIRET
  portfolioUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  tags: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  status: ProjectStatus;
  deadline: string;
  estimatedRevenue: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string;
  priority: TaskPriority;
  projectId?: string;
  clientId?: string;
}

export interface Note {
  id:string;
  clientId?: string; // Optional for global notes
  content: string;
  createdAt: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
}

export interface NoteLink {
  id: string;
  from: string; // note id
  to: string; // note id
}

export interface DocumentFile {
  id: string;
  clientId: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'other';
  uploadedAt: string;
  url?: string;
  thumbnailUrl?: string;
}

export type TemplateTask = {
  text: string;
  priority: TaskPriority;
  dueDayOffset: number; // Days relative to project deadline (e.g., -7 is 7 days before)
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // keyof ICONS
  defaultName: string;
  defaultRevenue: number;
  tasks: TemplateTask[];
}
