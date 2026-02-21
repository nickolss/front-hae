export interface WeeklyScheduleEntry {
  timeRange: string;
}

export type WeeklySchedule = {
  [day: string]: WeeklyScheduleEntry;
};

export interface HaeDataType {
  employeeId: string;
  course: string;
  projectTitle: string;
  modality: string;
  dimensao: string;
  weeklyHours: number;
  projectType: string;
  dayOfWeek: string[];
  weeklySchedule: WeeklySchedule;
  timeRange: string;
  projectDescription: string;
  observations: string;
  startDate: string;
  endDate: string;
  studentRAs: string[];
  institutionId: string;
  institutionCode: number | string;
}

export type FormErrors = Partial<Record<keyof HaeDataType, string>>;

export interface StepProps {
  formData: HaeDataType;
  setFormData: <K extends keyof HaeDataType>(
    field: K,
    value: HaeDataType[K]
  ) => void;
  errors: FormErrors;
  isEditMode: boolean;
  isCompleted: boolean;
}

export interface StepOneProps extends StepProps {
  onNext: () => void;
}

export interface StepTwoProps extends StepProps {
  onNext: () => void;
  onBack: () => void;
}

export interface StepThreeProps extends StepProps {
  onBack: () => void;
  onSubmit: () => Promise<void>;
  onOpenConfirmDialog: () => void;
  isSubmitting: boolean;
}
