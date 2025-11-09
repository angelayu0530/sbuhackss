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

    // Patient Alert Functions
    sendCallCaregiverAlert: async (caregiverName: string, caregiverPhone: string) => {
        const res = await fetch(`${API_BASE}/patient-alerts/call-caregiver`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patient_id: PATIENT_ID,
                caregiver_name: caregiverName,
                caregiver_phone: caregiverPhone,
            }),
        });
        return res.json();
    },

    sendEmergencyAlert: async () => {
        const res = await fetch(`${API_BASE}/patient-alerts/emergency-call`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patient_id: PATIENT_ID,
            }),
        });
        return res.json();
    },

    sendNavigationHelpAlert: async (location: {
        latitude?: number;
        longitude?: number;
        address?: string;
    }) => {
        const res = await fetch(`${API_BASE}/patient-alerts/navigation-help`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patient_id: PATIENT_ID,
                location,
            }),
        });
        return res.json();
    },
};

export default api;