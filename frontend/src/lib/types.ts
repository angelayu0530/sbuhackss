import { Dayjs } from "dayjs";

export type Lang = "en" | "zh" | "es";

export type CalendarEvent = {
  id: string;
  title: string;
  start: Dayjs; // inclusive
  end: Dayjs;   // exclusive
};

export type Task = { id: string; label: string; time: string; done: boolean };

export type User = {
  uid: number;
  email: string;
  name: string;
  phone?: string;
};

export type Patient = {
  pid?: number;
  caretaker_id: number;
  name: string;
  age?: number;
  gender?: string;
  medical_summary?: string;
  emergency_contact?: string;
  allergies?: string;
  meds?: string;
  notes?: string;
};

export type Doctor = {
  name: string;
  phone: string;
  next: string;
  specialty: string;
  location: string;
};

// Hours shown in week view
export const HOURS_START = 6;   // 6 AM
export const HOURS_END = 22;    // 10 PM

export const hoursArray = (start = HOURS_START, end = HOURS_END) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

export const minutesFromDayStart = (d: Dayjs) => d.hour() * 60 + d.minute();
