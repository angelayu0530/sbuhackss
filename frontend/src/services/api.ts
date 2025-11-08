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
  sendMessage: async (message: string) => {
    const res = await fetch(`${API_BASE}/chat/gemini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
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
