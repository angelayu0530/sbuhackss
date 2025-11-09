import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import type { User, Patient } from "../lib/types";
import { patientAPI } from "../services/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewSignup, setIsNewSignup] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    const savedPatient = localStorage.getItem("patient");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    if (savedPatient) {
      setPatient(JSON.parse(savedPatient));
    }
    setIsLoading(false);
  }, []);

  const fetchPatientData = async (uid: number, authToken: string) => {
    try {
      const patientData = await patientAPI.getByCaretaker(uid, authToken);
      if (patientData) {
        setPatient(patientData);
        localStorage.setItem("patient", JSON.stringify(patientData));
      }
    } catch (error) {
      console.error("Failed to fetch patient data:", error);
    }
  };

  const login = (newUser: User, newToken: string) => {
      setUser(newUser);
    setToken(newToken);
    setIsNewSignup(false);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", newToken);
    fetchPatientData(newUser.uid, newToken);
  };  const signup = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    setIsNewSignup(true);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setPatient(null);
    setIsNewSignup(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("patient");
  };

  const updatePatient = (newPatient: Patient) => {
    setPatient(newPatient);
    setIsNewSignup(false);
    localStorage.setItem("patient", JSON.stringify(newPatient));
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patient,
        token,
        isNewSignup,
        login,
        signup,
        logout,
        setPatient: updatePatient,
        updateUser,
        updatePatient,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
