/**
 * Supabase Integration Module
 * Centralized exports for all Supabase functionality
 */

// Client and types
export { supabase } from './client';
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './types';

// Hooks
export {
  usePatients,
  usePatient,
  usePatientsByStatus,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
  useSearchPatients,
  useRealtimePatients,
} from './hooks/use-patients';

// Utilities
export {
  uploadFile,
  deleteFile,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  resetPassword,
  batchCreatePatients,
  getPatientStats,
  getRecentPatients,
  getPatientsByDateRange,
  countPatientsByStatus,
  patientExistsByCaseId,
  invokeEdgeFunction,
  subscribeToTable,
  executeRawQuery,
  bulkUpdatePatients,
} from './utils';
