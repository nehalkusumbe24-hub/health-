export type UserRole = 'user' | 'doctor' | 'admin';
export type DoctorStatus = 'pending' | 'approved' | 'rejected';
export type DoshaType = 'vata' | 'pitta' | 'kapha';
export type AssessmentStatus = 'pending' | 'completed' | 'reviewed';

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  weight: number | null;
  height: number | null;
  lifestyle_info: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DoctorProfile {
  id: string;
  registration_number: string;
  credentials_url: string | null;
  specialization: string | null;
  experience_years: number | null;
  status: DoctorStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  profile?: Profile;
}

export interface Assessment {
  id: string;
  user_id: string;
  symptoms: any[];
  daily_habits: Record<string, any>;
  physical_attributes: Record<string, any>;
  mental_patterns: Record<string, any>;
  dosha_results: Record<string, any>;
  primary_dosha: DoshaType | null;
  secondary_dosha: DoshaType | null;
  imbalance_severity: string | null;
  health_conditions: string[] | null;
  status: AssessmentStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
  reviewer?: DoctorProfile;
}

export interface Prescription {
  id: string;
  assessment_id: string;
  doctor_id: string;
  user_id: string;
  herbal_medicines: any[];
  panchakarma_recommendations: string[] | null;
  lifestyle_adjustments: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  assessment?: Assessment;
  doctor?: DoctorProfile;
  user?: Profile;
}

export interface DietPlan {
  id: string;
  user_id: string;
  assessment_id: string | null;
  created_by: string | null;
  title: string;
  description: string | null;
  primary_dosha: DoshaType | null;
  daily_menu: Record<string, any>;
  weekly_menu: Record<string, any>;
  food_restrictions: string[] | null;
  seasonal_recommendations: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: Profile;
  creator?: DoctorProfile;
}

export interface ExercisePlan {
  id: string;
  user_id: string;
  assessment_id: string | null;
  created_by: string | null;
  title: string;
  description: string | null;
  yoga_poses: any[];
  pranayama_exercises: any[];
  daily_routine: Record<string, any>;
  duration_minutes: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: Profile;
  creator?: DoctorProfile;
}

export interface HabitTracking {
  id: string;
  user_id: string;
  habit_type: string;
  habit_name: string;
  completed_at: string;
  notes: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string | null;
  is_escalated: boolean;
  escalated_to: string | null;
  created_at: string;
  user?: Profile;
}
