import { createContext } from "react";
import type { User, Patient } from "../lib/types";

export interface AuthContextType {
  user: User | null;
  patient: Patient | null;
  token: string | null;
  isNewSignup: boolean;
  login: (user: User, token: string) => void;
  signup: (user: User, token: string) => void;
  logout: () => void;
  setPatient: (patient: Patient) => void;
  updateUser: (user: User) => void;
  updatePatient: (patient: Patient) => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
