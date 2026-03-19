import type {
  Profile,
  Assessment,
  Prescription,
  DietPlan,
  ExercisePlan,
  HabitTracking,
  DoctorStatus,
  UserRole,
} from '@/types';

const API_URL = '/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const text = await response.text();
  if (!response.ok) {
    let errorMessage = 'API call failed';
    if (text) {
      try {
        const errorJson = JSON.parse(text);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        errorMessage = text;
      }
    }
    throw new Error(errorMessage);
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  profiles: {
    async getCurrent() {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return null;
      const user = JSON.parse(storedUser);
      return await this.getById(user.id);
    },

    async update(id: string, updates: Partial<Profile>) {
      return await fetchAPI(`/data/profiles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    async getById(id: string) {
      try {
        return await fetchAPI(`/data/profiles/${id}`);
      } catch (e) {
        return null;
      }
    },

    async updateRole(userId: string, role: UserRole) {
      return await fetchAPI(`/data/profiles/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
    },

    async list(limit = 50) {
      return await fetchAPI(`/data/profiles?limit=${limit}`);
    },
  },

  doctorProfiles: {
    async create(doctorData: any) {
      return await fetchAPI('/data/doctors', {
        method: 'POST',
        body: JSON.stringify(doctorData),
      });
    },

    async getById(id: string) {
      return await fetchAPI(`/data/doctors/${id}`);
    },

    async listPending(limit = 50) {
      return await fetchAPI(`/data/doctors?status=pending&limit=${limit}`);
    },

    async listApproved(limit = 50) {
      return await fetchAPI(`/data/doctors?status=approved&limit=${limit}`);
    },

    async updateStatus(id: string, status: DoctorStatus, approvedBy: string) {
      return await fetchAPI(`/data/doctors/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
        }),
      });
    },
  },

  assessments: {
    async create(assessmentData: Partial<Assessment>) {
      return await fetchAPI('/data/assessments', {
        method: 'POST',
        body: JSON.stringify(assessmentData),
      });
    },

    async getById(id: string) {
      return await fetchAPI(`/data/assessments/${id}`);
    },

    async listByUser(userId: string, limit = 50) {
      return await fetchAPI(`/data/assessments?user_id=${userId}&limit=${limit}`);
    },

    async listAll(limit = 50) {
      return await fetchAPI(`/data/assessments?limit=${limit}`);
    },

    async update(id: string, updates: Partial<Assessment>) {
      return await fetchAPI(`/data/assessments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
  },

  prescriptions: {
    async create(prescriptionData: Partial<Prescription>) {
      return await fetchAPI('/data/prescriptions', {
        method: 'POST',
        body: JSON.stringify(prescriptionData),
      });
    },

    async getById(id: string) {
      return await fetchAPI(`/data/prescriptions/${id}`);
    },

    async listByUser(userId: string, limit = 50) {
      return await fetchAPI(`/data/prescriptions?user_id=${userId}&limit=${limit}`);
    },

    async listByDoctor(doctorId: string, limit = 50) {
      return await fetchAPI(`/data/prescriptions?doctor_id=${doctorId}&limit=${limit}`);
    },

    async update(id: string, updates: Partial<Prescription>) {
      return await fetchAPI(`/data/prescriptions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
  },

  dietPlans: {
    async create(dietPlanData: Partial<DietPlan>) {
      return await fetchAPI('/data/diet_plans', {
        method: 'POST',
        body: JSON.stringify(dietPlanData),
      });
    },

    async getActiveByUser(userId: string) {
      const results = await fetchAPI(`/data/diet_plans?user_id=${userId}&is_active=true&limit=1`);
      return results[0] || null;
    },

    async listByUser(userId: string, limit = 50) {
      return await fetchAPI(`/data/diet_plans?user_id=${userId}&limit=${limit}`);
    },

    async update(id: string, updates: Partial<DietPlan>) {
      return await fetchAPI(`/data/diet_plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
  },

  exercisePlans: {
    async create(exercisePlanData: Partial<ExercisePlan>) {
      return await fetchAPI('/data/exercise_plans', {
        method: 'POST',
        body: JSON.stringify(exercisePlanData),
      });
    },

    async getActiveByUser(userId: string) {
      const results = await fetchAPI(`/data/exercise_plans?user_id=${userId}&is_active=true&limit=1`);
      return results[0] || null;
    },

    async listByUser(userId: string, limit = 50) {
      return await fetchAPI(`/data/exercise_plans?user_id=${userId}&limit=${limit}`);
    },

    async update(id: string, updates: Partial<ExercisePlan>) {
      return await fetchAPI(`/data/exercise_plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
  },

  habitTracking: {
    async create(habitData: Partial<HabitTracking>) {
      return await fetchAPI('/data/habit_tracking', {
        method: 'POST',
        body: JSON.stringify(habitData),
      });
    },

    async listByUser(userId: string, limit = 100) {
      return await fetchAPI(`/data/habit_tracking?user_id=${userId}&limit=${limit}`);
    },

    async getRecentByType(userId: string, habitType: string) {
      // Basic filtering, 'days' logic should ideally be on server but we filter here for simplicity if needed
      return await fetchAPI(`/data/habit_tracking?user_id=${userId}&habit_type=${habitType}`);
    },
  },

  chatMessages: {
    async create(messageData: { user_id: string; message: string }) {
      return await fetchAPI('/data/chat_messages', {
        method: 'POST',
        body: JSON.stringify(messageData),
      });
    },

    async updateResponse(id: string, response: string) {
      return await fetchAPI(`/data/chat_messages/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ response }),
      });
    },

    async escalate(id: string, doctorId: string) {
      return await fetchAPI(`/data/chat_messages/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_escalated: true, escalated_to: doctorId }),
      });
    },

    async listByUser(userId: string, limit = 100) {
      return await fetchAPI(`/data/chat_messages?user_id=${userId}&limit=${limit}`);
    },

    async listEscalated(doctorId: string, limit = 50) {
      return await fetchAPI(`/data/chat_messages?escalated_to=${doctorId}&is_escalated=true&limit=${limit}`);
    },
  },
};
