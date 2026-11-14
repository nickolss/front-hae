import type { Ref } from "@/shared/api/types";
import type { DayOfWeek, Dimension, HaeStatus, HaeType, Modality } from "@/shared/domain/labels";

export interface ScheduleSlot {
  day: DayOfWeek;
  start: string;
  end: string;
}

export interface HaeSummary {
  id: string;
  title: string;
  type: HaeType;
  status: HaeStatus;
  weeklyHours: number;
  startDate: string;
  endDate: string;
  viewed: boolean;
  employeeId: string;
  employeeName: string;
  courseId: string;
  courseName: string;
  institutionId: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  uploadedAt: string;
}

export interface Closure {
  id: string;
  type: HaeType;
  role?: string;
  studentCount?: number;
  studentNames?: string;
  approvedStudents?: string;
  projectInfo?: string;
  studentInfo?: string;
  supportType?: string;
  description?: string;
  certificateStudents?: string;
  submittedAt: string;
  decision: "APPROVE" | "REJECT" | null;
  reviewer: Ref | null;
  reviewComment: string | null;
  decidedAt: string | null;
}

export interface Permissions {
  canEdit: boolean;
  canDelete: boolean;
  canReview: boolean;
  canRequestClosure: boolean;
  canReviewClosure: boolean;
  canManageAttachments: boolean;
}

export interface Hae {
  id: string;
  title: string;
  description: string;
  observations: string | null;
  type: HaeType;
  modality: Modality;
  dimension: Dimension;
  weeklyHours: number;
  startDate: string;
  endDate: string;
  schedule: ScheduleSlot[];
  studentRas: string[];
  status: HaeStatus;
  viewed: boolean;
  employee: Ref;
  course: Ref;
  institution: Ref;
  reviewer: Ref | null;
  reviewComment: string | null;
  attachments: Attachment[];
  closures: Closure[];
  permissions: Permissions;
  createdAt: string;
  updatedAt: string;
}

export interface HaeInput {
  employeeId?: string;
  courseId: string;
  title: string;
  description: string;
  observations?: string;
  type: HaeType;
  modality: Modality;
  dimension: Dimension;
  weeklyHours: number;
  startDate: string;
  endDate: string;
  schedule: ScheduleSlot[];
  studentRas: string[];
}

export interface ClosureInput {
  type: HaeType;
  role?: string;
  studentCount?: number;
  studentNames?: string;
  approvedStudents?: string;
  projectInfo?: string;
  studentInfo?: string;
  supportType?: string;
  description?: string;
  certificateStudents?: string;
}

export interface HaeFilters {
  institutionId?: string;
  courseId?: string;
  employeeId?: string;
  type?: HaeType;
  status?: HaeStatus;
  viewed?: boolean;
  semester?: string;
  q?: string;
  page?: number;
  size?: number;
}
