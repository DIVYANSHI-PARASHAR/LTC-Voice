/**
 * Supabase Utility Functions
 * Helper functions for common Supabase operations
 */

import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Patient = Tables<'patients'>;

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string; path: string }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) throw error;
}

/**
 * Get authenticated user
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

/**
 * Batch create patients
 */
export async function batchCreatePatients(
  patients: Omit<Patient, 'id' | 'created_at' | 'updated_at'>[]
): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .insert(patients)
    .select();

  if (error) throw error;
  return data as Patient[];
}

/**
 * Get patient statistics
 */
export async function getPatientStats() {
  const { data, error } = await supabase
    .from('patients')
    .select('status');

  if (error) throw error;

  const stats = data.reduce(
    (acc, patient) => {
      const status = patient.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      acc.total += 1;
      return acc;
    },
    { total: 0 } as Record<string, number>
  );

  return stats;
}

/**
 * Get recent patients (last 7 days)
 */
export async function getRecentPatients(): Promise<Patient[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Patient[];
}

/**
 * Get patients by date range
 */
export async function getPatientsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .gte('referral_date', startDate.toISOString())
    .lte('referral_date', endDate.toISOString())
    .order('referral_date', { ascending: false });

  if (error) throw error;
  return data as Patient[];
}

/**
 * Count patients by status
 */
export async function countPatientsByStatus(status: string): Promise<number> {
  const { count, error } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('status', status);

  if (error) throw error;
  return count || 0;
}

/**
 * Check if patient exists by case ID
 */
export async function patientExistsByCaseId(caseId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('patients')
    .select('id')
    .eq('case_id', caseId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Invoke a Supabase Edge Function
 */
export async function invokeEdgeFunction<T = unknown>(
  functionName: string,
  payload?: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });

  if (error) throw error;
  return data as T;
}

/**
 * Subscribe to table changes with a callback
 */
export function subscribeToTable(
  table: string,
  callback: (payload: any) => void,
  filter?: { column: string; value: string }
) {
  const channel = supabase.channel(`${table}-changes`);

  let subscription = channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table,
      ...(filter && { filter: `${filter.column}=eq.${filter.value}` }),
    },
    callback
  );

  subscription.subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Execute a raw SQL query (requires appropriate RLS policies)
 * Note: This requires a database function named 'execute_sql' to be created
 */
export async function executeRawQuery<T = unknown>(query: string): Promise<T[]> {
  // This function is disabled as it requires a custom RPC function
  // To enable it, create the execute_sql function in your database
  throw new Error('executeRawQuery requires a custom database function. See utils.ts for details.');
}

/**
 * Bulk update patients
 */
export async function bulkUpdatePatients(
  updates: { id: string; updates: Partial<Patient> }[]
): Promise<Patient[]> {
  const promises = updates.map(({ id, updates }) =>
    supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  );

  const results = await Promise.all(promises);

  // Check for errors
  results.forEach((result) => {
    if (result.error) throw result.error;
  });

  return results.map((result) => result.data) as Patient[];
}
