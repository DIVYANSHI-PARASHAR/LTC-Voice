// @ts-nocheck
/**
 * Custom React hooks for managing patient assessments
 * These hooks provide easy access to all assessment data from VAPI calls
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as typedSupabase } from '../client';
const supabase = typedSupabase as any;
// Using any-typed fallbacks until backend tables are available
type TablesInsert<T extends string = string> = any;
type TablesUpdate<T extends string = string> = any;

// Type aliases for easier use
export type VAPICall = any;
export type PatientAssessment = any;
export type LivingSituation = any;
export type ADLAssessment = any;
export type IADLAssessment = any;
export type HealthAssessment = any;
export type CognitionAssessment = any;
export type SupportNetwork = any;

/**
 * Fetch all VAPI calls for a specific patient
 */
export const useVAPICalls = (patientId: string) => {
  return useQuery({
    queryKey: ['vapi_calls', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vapi_calls')
        .select('*')
        .eq('patient_id', patientId)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data as VAPICall[];
    },
    enabled: !!patientId,
  });
};

/**
 * Fetch a specific VAPI call by ID
 */
export const useVAPICall = (callId: string) => {
  return useQuery({
    queryKey: ['vapi_call', callId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vapi_calls')
        .select('*')
        .eq('id', callId)
        .single();
      
      if (error) throw error;
      return data as VAPICall;
    },
    enabled: !!callId,
  });
};

/**
 * Create a new VAPI call record
 */
export const useCreateVAPICall = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (callData: TablesInsert<'vapi_calls'>) => {
      const { data, error } = await supabase
        .from('vapi_calls')
        .insert(callData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vapi_calls', data.patient_id] });
    },
  });
};

/**
 * Update an existing VAPI call
 */
export const useUpdateVAPICall = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'vapi_calls'> }) => {
      const { data, error } = await supabase
        .from('vapi_calls')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vapi_call', data.id] });
      queryClient.invalidateQueries({ queryKey: ['vapi_calls', data.patient_id] });
    },
  });
};

/**
 * Fetch all assessments for a patient
 */
export const usePatientAssessments = (patientId: string) => {
  return useQuery({
    queryKey: ['patient_assessments', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_assessments')
        .select('*')
        .eq('patient_id', patientId)
        .order('assessment_date', { ascending: false });
      
      if (error) throw error;
      return data as PatientAssessment[];
    },
    enabled: !!patientId,
  });
};

/**
 * Fetch a complete assessment with all related data
 */
export const useCompleteAssessment = (assessmentId: string) => {
  return useQuery({
    queryKey: ['complete_assessment', assessmentId],
    queryFn: async () => {
      // Fetch the main assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('patient_assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();
      
      if (assessmentError) throw assessmentError;

      // Fetch all related data in parallel
      const [
        { data: living },
        { data: adl },
        { data: iadl },
        { data: health },
        { data: cognition },
        { data: support },
      ] = await Promise.all([
        supabase.from('living_situation').select('*').eq('assessment_id', assessmentId).maybeSingle(),
        supabase.from('adl_assessment').select('*').eq('assessment_id', assessmentId).maybeSingle(),
        supabase.from('iadl_assessment').select('*').eq('assessment_id', assessmentId).maybeSingle(),
        supabase.from('health_assessment').select('*').eq('assessment_id', assessmentId).maybeSingle(),
        supabase.from('cognition_assessment').select('*').eq('assessment_id', assessmentId).maybeSingle(),
        supabase.from('support_network').select('*').eq('assessment_id', assessmentId).maybeSingle(),
      ]);

      return {
        assessment: assessment as PatientAssessment,
        livingSituation: living as LivingSituation | null,
        adlAssessment: adl as ADLAssessment | null,
        iadlAssessment: iadl as IADLAssessment | null,
        healthAssessment: health as HealthAssessment | null,
        cognitionAssessment: cognition as CognitionAssessment | null,
        supportNetwork: support as SupportNetwork | null,
      };
    },
    enabled: !!assessmentId,
  });
};

/**
 * Create a new patient assessment
 */
export const useCreateAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assessmentData: TablesInsert<'patient_assessments'>) => {
      const { data, error } = await supabase
        .from('patient_assessments')
        .insert(assessmentData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient_assessments', data.patient_id] });
    },
  });
};

/**
 * Create or update living situation data
 */
export const useSaveLivingSituation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TablesInsert<'living_situation'>) => {
      const { data: result, error } = await supabase
        .from('living_situation')
        .upsert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['complete_assessment', data.assessment_id] });
    },
  });
};

/**
 * Create or update ADL assessment data
 */
export const useSaveADLAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TablesInsert<'adl_assessment'>) => {
      const { data: result, error } = await supabase
        .from('adl_assessment')
        .upsert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['complete_assessment', data.assessment_id] });
    },
  });
};

/**
 * Create or update IADL assessment data
 */
export const useSaveIADLAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TablesInsert<'iadl_assessment'>) => {
      const { data: result, error } = await supabase
        .from('iadl_assessment')
        .upsert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['complete_assessment', data.assessment_id] });
    },
  });
};

/**
 * Create or update health assessment data
 */
export const useSaveHealthAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TablesInsert<'health_assessment'>) => {
      const { data: result, error } = await supabase
        .from('health_assessment')
        .upsert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['complete_assessment', data.assessment_id] });
    },
  });
};

/**
 * Create or update cognition assessment data
 */
export const useSaveCognitionAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TablesInsert<'cognition_assessment'>) => {
      const { data: result, error } = await supabase
        .from('cognition_assessment')
        .upsert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['complete_assessment', data.assessment_id] });
    },
  });
};

/**
 * Create or update support network data
 */
export const useSaveSupportNetwork = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TablesInsert<'support_network'>) => {
      const { data: result, error } = await supabase
        .from('support_network')
        .upsert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['complete_assessment', data.assessment_id] });
    },
  });
};

/**
 * Save a complete assessment with all sections at once
 */
export const useSaveCompleteAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      assessment: TablesInsert<'patient_assessments'>;
      livingSituation?: TablesInsert<'living_situation'>;
      adlAssessment?: TablesInsert<'adl_assessment'>;
      iadlAssessment?: TablesInsert<'iadl_assessment'>;
      healthAssessment?: TablesInsert<'health_assessment'>;
      cognitionAssessment?: TablesInsert<'cognition_assessment'>;
      supportNetwork?: TablesInsert<'support_network'>;
    }) => {
      // First, create the main assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('patient_assessments')
        .insert(data.assessment)
        .select()
        .single();
      
      if (assessmentError) throw assessmentError;

      // Then create all related records in parallel
      const promises = [];
      
      if (data.livingSituation) {
        promises.push(
          supabase.from('living_situation').insert({
            ...data.livingSituation,
            assessment_id: assessment.id,
          })
        );
      }
      
      if (data.adlAssessment) {
        promises.push(
          supabase.from('adl_assessment').insert({
            ...data.adlAssessment,
            assessment_id: assessment.id,
          })
        );
      }
      
      if (data.iadlAssessment) {
        promises.push(
          supabase.from('iadl_assessment').insert({
            ...data.iadlAssessment,
            assessment_id: assessment.id,
          })
        );
      }
      
      if (data.healthAssessment) {
        promises.push(
          supabase.from('health_assessment').insert({
            ...data.healthAssessment,
            assessment_id: assessment.id,
          })
        );
      }
      
      if (data.cognitionAssessment) {
        promises.push(
          supabase.from('cognition_assessment').insert({
            ...data.cognitionAssessment,
            assessment_id: assessment.id,
          })
        );
      }
      
      if (data.supportNetwork) {
        promises.push(
          supabase.from('support_network').insert({
            ...data.supportNetwork,
            assessment_id: assessment.id,
          })
        );
      }

      await Promise.all(promises);
      
      return assessment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient_assessments', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['complete_assessment', data.id] });
    },
  });
};

