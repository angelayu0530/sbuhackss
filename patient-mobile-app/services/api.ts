const API_BASE = 'http://172.25.240.65:5001'; // Replace with your computer's IP (add :5001)
const PATIENT_ID = 1; // Hardcoded for demo - in production, get from auth

export interface ScheduleItem {
    id: number;
    start_time: string;
    end_time: string;
    location?: string;
}

export interface Landmark {
    id: number;
    step_number: number;
    title: string;
    description?: string;
    photo_url?: string;
}

export interface FAQ {
    id: number;
    question: string;
    answer_text: string;
    voice_recording_url?: string;
}

export interface Contact {
    id: number;
    name: string;
    relationship?: string;
    phone: string;
    photo_url?: string;
    is_primary?: boolean;
}

const api = {
    getHomeData: async () => {
        const res = await fetch(`${API_BASE}/patient-display/mobile/${PATIENT_ID}/home`);
        return res.json();
    },

    getSchedule: async (): Promise<ScheduleItem[]> => {
        const res = await fetch(`${API_BASE}/patient-display/mobile/${PATIENT_ID}/schedule`);
        return res.json();
    },

    getLandmarks: async (): Promise<Landmark[]> => {
        const res = await fetch(`${API_BASE}/patient-display/mobile/${PATIENT_ID}/navigation`);
        return res.json();
    },

    getFAQs: async (): Promise<FAQ[]> => {
        const res = await fetch(`${API_BASE}/patient-display/mobile/${PATIENT_ID}/faqs`);
        return res.json();
    },

    getContacts: async (): Promise<Contact[]> => {
        const res = await fetch(`${API_BASE}/patient-display/mobile/${PATIENT_ID}/contacts`);
        return res.json();
    },
};

export default api;