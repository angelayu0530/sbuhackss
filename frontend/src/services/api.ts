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
