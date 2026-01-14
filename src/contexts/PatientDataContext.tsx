import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface CallResults {
  structuredData?: any;
  transcript?: any;
  recordingUrl?: string;
  cost?: number;
}

interface PatientData {
  callResults: CallResults | null;
  status: string;
}

interface PatientDataContextType {
  getPatientData: (patientId: string) => PatientData | null;
  setPatientCallResults: (patientId: string, results: CallResults) => void;
  setPatientStatus: (patientId: string, status: string) => void;
}

const PatientDataContext = createContext<PatientDataContextType | undefined>(undefined);

export function PatientDataProvider({ children }: { children: ReactNode }) {
  // Store patient data keyed by patient ID
  const [patientDataMap, setPatientDataMap] = useState<Record<string, PatientData>>({});

  const getPatientData = useCallback((patientId: string) => {
    return patientDataMap[patientId] || null;
  }, [patientDataMap]);

  const setPatientCallResults = useCallback((patientId: string, results: CallResults) => {
    setPatientDataMap(prev => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        callResults: results,
      }
    }));
  }, []);

  const setPatientStatus = useCallback((patientId: string, status: string) => {
    setPatientDataMap(prev => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        status,
      }
    }));
  }, []);

  return (
    <PatientDataContext.Provider value={{ getPatientData, setPatientCallResults, setPatientStatus }}>
      {children}
    </PatientDataContext.Provider>
  );
}

export function usePatientData() {
  const context = useContext(PatientDataContext);
  if (context === undefined) {
    throw new Error('usePatientData must be used within a PatientDataProvider');
  }
  return context;
}
