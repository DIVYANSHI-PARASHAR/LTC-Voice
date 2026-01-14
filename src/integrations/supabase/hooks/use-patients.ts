/**
 * React Query hooks for Supabase patients table operations
 * Provides CRUD operations with automatic caching and refetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Patient = Tables<'patients'>;
type PatientInsert = TablesInsert<'patients'>;
type PatientUpdate = TablesUpdate<'patients'>;

/**
 * Fetch all patients
 */
export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Patient[];
    },
  });
}

/**
 * Fetch a single patient by ID
 */
export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: async () => {
      if (!id) throw new Error('Patient ID is required');

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Patient;
    },
    enabled: !!id,
  });
}

/**
 * Fetch patients by status
 */
export function usePatientsByStatus(status: string) {
  return useQuery({
    queryKey: ['patients', 'status', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Patient[];
    },
    enabled: !!status,
  });
}

/**
 * Create a new patient
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: PatientInsert) => {
      const { data, error } = await supabase
        .from('patients')
        .insert(patient)
        .select()
        .single();

      if (error) throw error;
      return data as Patient;
    },
    onSuccess: () => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

/**
 * Update an existing patient
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PatientUpdate }) => {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Patient;
    },
    onSuccess: (data) => {
      // Invalidate patients list and specific patient
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', data.id] });
    },
  });
}

/**
 * Delete a patient
 */
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      // Invalidate patients list
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

/**
 * Search patients by name
 */
export function useSearchPatients(searchTerm: string) {
  return useQuery({
    queryKey: ['patients', 'search', searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Patient[];
    },
    enabled: searchTerm.length > 0,
  });
}

/**
 * Subscribe to real-time patient changes
 */
export function useRealtimePatients() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['patients', 'realtime'],
    queryFn: async () => {
      // Set up realtime subscription
      const channel = supabase
        .channel('patients-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'patients',
          },
          (payload) => {
            console.log('Patient change received:', payload);
            // Invalidate queries to refetch data
            queryClient.invalidateQueries({ queryKey: ['patients'] });
          }
        )
        .subscribe();

      return channel;
    },
    staleTime: Infinity, // Keep subscription active
  });
}
