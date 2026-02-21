import { EmployeeDetails } from "./employee";

export interface Hae {
  id: string;
  nameEmployee: string;
  course: string;
  projectTitle: string;
  weeklyHours: number;
  projectType: string;
  dayOfWeek: string[];
  timeRange: string;
  projectDescription: string;
  observations: string;
  status: "PENDENTE" | "APROVADO" | "REPROVADO" | "COMPLETO";
  coordenatorId: string;
  coordenatorName?: string;
  startDate: string;
  endDate: string;
  comprovanteDoc: string[];
  modality: "ONLINE" | "HIBRIDO" | "PRESENCIAL";
  employee: EmployeeDetails;
  students: string[];
  weeklySchedule: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  viewed: boolean;
}

export interface HaeResponseDTO {
  id: string;
  projectTitle: string;
  course: string;
  projectDescription: string;
  comprovanteDoc: string[];
  status: "PENDENTE" | "APROVADO" | "REPROVADO" | "COMPLETO" | string;
  professorName: string;
  viewed: boolean;
  startDate: string;
  endDate: string;
}

export interface HaeDetailDTO {
  id: string;
  projectTitle: string;
  professorName: string;
  comprovanteDoc: string[];
  status: "PENDENTE" | "APROVADO" | "REPROVADO" | "COMPLETO" | string;
  course: string;
  projectType: string;
  modality: string;
  dimensao: string;
  weeklyHours: number;
  startDate: string;
  endDate: string;
  weeklySchedule: { [key: string]: string };
  projectDescription: string;
  observations: string;
  students: string[];
  viewed: boolean;
  coordenatorName: string;
  dayOfWeek: string[];
  updatedAt: string;
  
  // Closure information fields
  tccRole?: string;
  tccStudentCount?: number;
  tccStudentNames?: string;
  tccApprovedStudents?: string;
  tccProjectInfo?: string;
  estagioStudentInfo?: string;
  estagioApprovedStudents?: string;
  apoioType?: string;
  apoioGeralDescription?: string;
  apoioApprovedStudents?: string;
  apoioCertificateStudents?: string;
}

export interface HaeClosureRecordDTO {
  id: string;
  coordenadorId: string;
  coordenadorName: string | null;
  approvedAt: string;
  
  // Campos de informações de fechamento
  tccRole?: string;
  tccStudentCount?: number;
  tccStudentNames?: string;
  tccApprovedStudents?: string;
  tccProjectInfo?: string;
  estagioStudentInfo?: string;
  estagioApprovedStudents?: string;
  apoioType?: string;
  apoioGeralDescription?: string;
  apoioApprovedStudents?: string;
  apoioCertificateStudents?: string;
}