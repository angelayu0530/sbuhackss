const API_BASE = "http://localhost:5001";

export interface SignupData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PatientData {
  caretaker_id: number;
  name: string;
  age?: number;
  gender?: string;
  medical_summary?: string;
  emergency_contact?: string;
}

export interface TaskData {
  patient_id: number;
  caretaker_id: number;
  title: string;
  description?: string;
  due_at?: string;
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  active?: boolean;
}

export const authAPI = {
  signup: async (data: SignupData) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  login: async (data: LoginData) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getUser: async (uid: number, token: string) => {
    const res = await fetch(`${API_BASE}/auth/user/${uid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  updateUser: async (uid: number, data: Partial<SignupData>, token: string) => {
    const res = await fetch(`${API_BASE}/auth/user/${uid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

export const patientAPI = {
  create: async (data: PatientData, token: string) => {
    const res = await fetch(`${API_BASE}/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  get: async (pid: number, token: string) => {
    const res = await fetch(`${API_BASE}/patients/${pid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  getByCaretaker: async (caretakerId: number, token: string) => {
    const res = await fetch(`${API_BASE}/patients`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const patients = await res.json();
    return patients.find((p: PatientData) => p.caretaker_id === caretakerId);
  },

  update: async (pid: number, data: Partial<PatientData>, token: string) => {
    const res = await fetch(`${API_BASE}/patients/${pid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

export const tasksAPI = {
  create: async (data: TaskData, token: string) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  get: async (tid: number, token: string) => {
    const res = await fetch(`${API_BASE}/tasks/${tid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  list: async (token: string) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  update: async (tid: number, data: Partial<TaskData>, token: string) => {
    const res = await fetch(`${API_BASE}/tasks/${tid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  delete: async (tid: number, token: string) => {
    const res = await fetch(`${API_BASE}/tasks/${tid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};

export const chatAPI = {
  sendMessage: async (message: string, patientId?: number, doctorId?: number) => {
    const res = await fetch(`${API_BASE}/chat/gemini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        patientId,
        doctorId
      }),
    });
    return res.json();
  },

  clearHistory: async () => {
    const res = await fetch(`${API_BASE}/chat/gemini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearHistory: true }),
    });
    return res.json();
  },
};

export interface AppointmentData {
  patient_id: number;
  doctor_id: number;
  start_time: string;
  end_time: string;
  location?: string;
}

export interface Appointment extends AppointmentData {
  aid: number;
  active: boolean;
  created_at: string;
}

export const appointmentsAPI = {
  create: async (data: AppointmentData) => {
    const res = await fetch(`${API_BASE}/appointments/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Failed to create appointment: ${res.statusText}`);
    }
    return res.json();
  },

  list: async () => {
    const res = await fetch(`${API_BASE}/appointments/`);
    if (!res.ok) {
      throw new Error(`Failed to fetch appointments: ${res.statusText}`);
    }
    return res.json();
  },

  get: async (aid: number) => {
    const res = await fetch(`${API_BASE}/appointments/${aid}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch appointment: ${res.statusText}`);
    }
    return res.json();
  },

  update: async (aid: number, data: Partial<AppointmentData>) => {
    const res = await fetch(`${API_BASE}/appointments/${aid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Failed to update appointment: ${res.statusText}`);
    }
    return res.json();
  },

  delete: async (aid: number) => {
    const res = await fetch(`${API_BASE}/appointments/${aid}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error(`Failed to delete appointment: ${res.statusText}`);
    }
    return res.json();
  },
};

// Patient Display (Mobile App) API
export interface PatientDisplayConfig {
  id?: number;
  patient_id?: number;
  show_schedule?: boolean;
  show_navigation?: boolean;
  show_faq?: boolean;
  gps_tracking_enabled?: boolean;
  voice_reminders_enabled?: boolean;
  home_address?: string;
  caregiver_status?: string;
}

export interface NavigationLandmark {
  id?: number;
  patient_id?: number;
  step_number: number;
  title: string;
  description?: string;
  photo_url?: string;
}

export interface PatientFAQ {
  id?: number;
  patient_id?: number;
  question: string;
  answer_text: string;
  voice_recording_url?: string;
}

export interface EmergencyContact {
  id?: number;
  patient_id?: number;
  name: string;
  relationship?: string;
  phone: string;
  photo_url?: string;
  is_primary?: boolean;
}

export const patientDisplayAPI = {
  // Config
  getConfig: async (patientId: number, token: string): Promise<PatientDisplayConfig> => {
    const res = await fetch(`${API_BASE}/patient-display/config/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to get config: ${res.statusText}`);
    return res.json();
  },

  updateConfig: async (patientId: number, data: Partial<PatientDisplayConfig>, token: string) => {
    const res = await fetch(`${API_BASE}/patient-display/config/${patientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update config: ${res.statusText}`);
    return res.json();
  },

  // Landmarks
  getLandmarks: async (patientId: number, token: string): Promise<NavigationLandmark[]> => {
    const res = await fetch(`${API_BASE}/patient-display/landmarks/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to get landmarks: ${res.statusText}`);
    return res.json();
  },

  createLandmark: async (patientId: number, data: NavigationLandmark, token: string) => {
    const res = await fetch(`${API_BASE}/patient-display/landmarks/${patientId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create landmark: ${res.statusText}`);
    return res.json();
  },

  updateLandmark: async (landmarkId: number, data: Partial<NavigationLandmark>, token: string) => {
    const res = await fetch(`${API_BASE}/patient-display/landmarks/${landmarkId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update landmark: ${res.statusText}`);
    return res.json();
  },

  deleteLandmark: async (landmarkId: number, token: string) => {
    const res = await fetch(`${API_BASE}/patient-display/landmarks/${landmarkId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to delete landmark: ${res.statusText}`);
    return res.json();
  },

  // FAQs
  getFAQs: async (patientId: number, token: string): Promise<PatientFAQ[]> => {
    const res = await fetch(`${API_BASE}/patient-display/faqs/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to get FAQs: ${res.statusText}`);
    return res.json();
  },

  createFAQ: async (patientId: number, data: PatientFAQ, token: string) => {
    const res = await fetch(`${API_BASE}/patient-display/faqs/${patientId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create FAQ: ${res.statusText}`);
    return res.json();
  },

  updateFAQ: async (faqId: number, data: Partial<PatientFAQ>, token: string) => {
    const res = await fetch(`${API_BASE}/patient-display/faqs/${faqId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update FAQ: ${res.statusText}`);
    return res.json();
  },

  deleteFAQ: async (faqId: number, token: string) => {
    const res = await fetch(`${API_BASE}/patient-display/faqs/${faqId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to delete FAQ: ${res.statusText}`);
    return res.json();
  },

  // Contacts
  getContacts: async (patientId: number, token: string): Promise<EmergencyContact[]> => {
    const res = await fetch(`${API_BASE}/patient-display/contacts/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to get contacts: ${res.statusText}`);
    return res.json();
  },

  createContact: async (patientId: number, data: EmergencyContact, token: string) => {
    const res = await fetch(`${API_BASE}/patient-display/contacts/${patientId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create contact: ${res.statusText}`);
    return res.json();
  },

  updateContact: async (contactId: number, data: Partial<EmergencyContact>, token: string) => {
    const res = await fetch(`${API_BASE}/patient-display/contacts/${contactId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update contact: ${res.statusText}`);
    return res.json();
  },

  deleteContact: async (contactId: number, token: string) => {
    const res = await fetch(`${API_BASE}/patient-display/contacts/${contactId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to delete contact: ${res.statusText}`);
    return res.json();
  },

  // Urgent message
  sendUrgentMessage: async (patientId: number, message: string, token: string) => {
    const res = await fetch(`${API_BASE}/patient-display/urgent-message/${patientId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error(`Failed to send urgent message: ${res.statusText}`);
    return res.json();
  },
};
