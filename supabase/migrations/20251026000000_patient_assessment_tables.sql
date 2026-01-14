-- =====================================================
-- Patient Assessment Tables for VAPI Call Data
-- =====================================================
-- This migration creates tables to store structured information
-- collected during VAPI voice assistant patient assessment calls

-- =====================================================
-- 1. VAPI Calls Table
-- =====================================================
-- Stores metadata about each VAPI call
CREATE TABLE public.vapi_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  vapi_call_id TEXT UNIQUE, -- The actual call ID from VAPI
  call_type TEXT DEFAULT 'outboundPhoneCall', -- inboundPhoneCall, outboundPhoneCall, webCall
  call_status TEXT, -- queued, ringing, in-progress, forwarding, ended
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  recording_url TEXT,
  stereo_recording_url TEXT,
  transcript TEXT,
  summary TEXT,
  ended_reason TEXT,
  cost NUMERIC(10, 4),
  patient_confirmed BOOLEAN DEFAULT false,
  patient_willing_to_continue BOOLEAN DEFAULT false,
  assessment_completed BOOLEAN DEFAULT false,
  metadata JSONB, -- Store any additional VAPI metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 2. Patient Assessments Table
-- =====================================================
-- Main assessment record linking to the call
CREATE TABLE public.patient_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  vapi_call_id UUID REFERENCES public.vapi_calls(id) ON DELETE CASCADE,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assessed_by TEXT, -- Could be 'VAPI Assistant', nurse name, etc.
  patient_confirmed_name BOOLEAN DEFAULT false,
  patient_consent_given BOOLEAN DEFAULT false,
  assessment_complete BOOLEAN DEFAULT false,
  verbal_summary TEXT, -- Store the verbal summary given at end of call
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. Living Situation Table
-- =====================================================
CREATE TABLE public.living_situation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.patient_assessments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  lives_alone BOOLEAN,
  lives_with TEXT, -- 'family', 'spouse', 'children', 'roommate', etc.
  lives_with_details TEXT, -- Additional details about who they live with
  housing_type TEXT, -- 'house', 'apartment', 'assisted living', 'nursing home', etc.
  has_stairs_to_enter BOOLEAN,
  stairs_inside_home BOOLEAN,
  has_elevator BOOLEAN,
  wheelchair_accessible BOOLEAN,
  home_safety_concerns TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 4. ADL Assessment (Activities of Daily Living)
-- =====================================================
CREATE TABLE public.adl_assessment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.patient_assessments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Bathing
  bathing_independent BOOLEAN,
  bathing_level TEXT, -- 'independent', 'requires assistance', 'dependent', 'unable'
  bathing_notes TEXT,
  
  -- Dressing
  dressing_independent BOOLEAN,
  dressing_level TEXT,
  dressing_notes TEXT,
  
  -- Toileting
  toileting_independent BOOLEAN,
  toileting_level TEXT,
  toileting_incontinence BOOLEAN,
  toileting_notes TEXT,
  
  -- Eating
  eating_independent BOOLEAN,
  eating_level TEXT,
  eating_special_diet TEXT,
  eating_notes TEXT,
  
  -- Transferring (bed/chair)
  transferring_independent BOOLEAN,
  transferring_level TEXT,
  transferring_notes TEXT,
  
  -- Mobility/Walking
  mobility_independent BOOLEAN,
  mobility_level TEXT,
  uses_assistive_device BOOLEAN,
  assistive_devices TEXT[], -- array: 'cane', 'walker', 'wheelchair', 'crutches'
  mobility_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 5. IADL Assessment (Instrumental Activities of Daily Living)
-- =====================================================
CREATE TABLE public.iadl_assessment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.patient_assessments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Meal Preparation
  meal_prep_independent BOOLEAN,
  meal_prep_level TEXT,
  meal_prep_notes TEXT,
  
  -- Laundry
  laundry_independent BOOLEAN,
  laundry_level TEXT,
  laundry_notes TEXT,
  
  -- Shopping
  shopping_independent BOOLEAN,
  shopping_level TEXT,
  shopping_notes TEXT,
  
  -- Managing Money
  money_management_independent BOOLEAN,
  money_management_level TEXT,
  money_management_notes TEXT,
  
  -- Medication Management
  medication_management_independent BOOLEAN,
  medication_management_level TEXT,
  forgets_medications BOOLEAN,
  medication_reminders_needed BOOLEAN,
  medication_notes TEXT,
  
  -- Phone Use
  phone_use_independent BOOLEAN,
  phone_use_notes TEXT,
  
  -- Housekeeping
  housekeeping_independent BOOLEAN,
  housekeeping_level TEXT,
  housekeeping_notes TEXT,
  
  -- Transportation
  transportation_independent BOOLEAN,
  transportation_method TEXT, -- 'drives', 'public transit', 'family', 'ride service'
  transportation_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 6. Health Assessment
-- =====================================================
CREATE TABLE public.health_assessment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.patient_assessments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Chronic Conditions
  has_chronic_conditions BOOLEAN,
  chronic_conditions TEXT[], -- array of conditions
  chronic_conditions_details TEXT,
  
  -- Breathing
  has_breathing_issues BOOLEAN,
  breathing_details TEXT,
  uses_oxygen BOOLEAN,
  
  -- Pain
  has_pain BOOLEAN,
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  pain_location TEXT,
  pain_frequency TEXT, -- 'constant', 'intermittent', 'occasional'
  pain_details TEXT,
  
  -- Dizziness/Balance
  has_dizziness BOOLEAN,
  dizziness_frequency TEXT,
  has_balance_issues BOOLEAN,
  fall_risk BOOLEAN,
  recent_falls BOOLEAN,
  falls_details TEXT,
  
  -- Wounds/Skin Issues
  has_wounds BOOLEAN,
  wound_location TEXT,
  wound_type TEXT, -- 'pressure ulcer', 'surgical', 'diabetic ulcer', etc.
  wound_care_needed BOOLEAN,
  wound_details TEXT,
  
  -- Vision/Hearing
  vision_impairment BOOLEAN,
  vision_details TEXT,
  hearing_impairment BOOLEAN,
  uses_hearing_aid BOOLEAN,
  hearing_details TEXT,
  
  -- Sleep
  sleep_issues BOOLEAN,
  sleep_details TEXT,
  
  -- Nutrition
  nutrition_concerns BOOLEAN,
  nutrition_details TEXT,
  weight_loss BOOLEAN,
  weight_gain BOOLEAN,
  
  -- Additional Health Concerns
  additional_health_concerns TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 7. Cognition Assessment
-- =====================================================
CREATE TABLE public.cognition_assessment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.patient_assessments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Memory
  has_memory_issues BOOLEAN,
  memory_issue_type TEXT, -- 'short-term', 'long-term', 'both'
  memory_details TEXT,
  forgets_recent_events BOOLEAN,
  forgets_appointments BOOLEAN,
  
  -- Orientation
  oriented_to_person BOOLEAN,
  oriented_to_place BOOLEAN,
  oriented_to_time BOOLEAN,
  orientation_details TEXT,
  
  -- Decision Making
  decision_making_capacity TEXT, -- 'independent', 'needs support', 'impaired'
  decision_making_details TEXT,
  
  -- Communication
  communication_ability TEXT, -- 'clear', 'some difficulty', 'significant difficulty'
  communication_details TEXT,
  
  -- Confusion/Delirium
  experiences_confusion BOOLEAN,
  confusion_frequency TEXT,
  confusion_details TEXT,
  
  -- Diagnosis
  dementia_diagnosis BOOLEAN,
  dementia_type TEXT, -- 'Alzheimer's', 'Vascular', 'Lewy Body', etc.
  cognitive_impairment_level TEXT, -- 'mild', 'moderate', 'severe'
  
  -- Safety
  wandering_risk BOOLEAN,
  safety_concerns TEXT,
  
  additional_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 8. Support Network
-- =====================================================
CREATE TABLE public.support_network (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.patient_assessments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  has_formal_caregiver BOOLEAN,
  formal_caregiver_type TEXT, -- 'home health aide', 'nurse', 'therapist', etc.
  formal_caregiver_frequency TEXT, -- 'daily', 'weekly', 'as needed'
  formal_caregiver_details TEXT,
  
  has_informal_caregiver BOOLEAN,
  informal_caregiver_name TEXT,
  informal_caregiver_relationship TEXT, -- 'spouse', 'child', 'friend', 'neighbor'
  informal_caregiver_phone TEXT,
  informal_caregiver_availability TEXT,
  informal_caregiver_details TEXT,
  
  has_emergency_contact BOOLEAN,
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  
  receives_meals_on_wheels BOOLEAN,
  receives_transportation_services BOOLEAN,
  receives_other_services BOOLEAN,
  other_services_details TEXT,
  
  caregiver_burden_concerns BOOLEAN,
  caregiver_burden_details TEXT,
  
  support_needs TEXT,
  additional_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- Create Indexes for Better Query Performance
-- =====================================================
CREATE INDEX idx_vapi_calls_patient_id ON public.vapi_calls(patient_id);
CREATE INDEX idx_vapi_calls_vapi_call_id ON public.vapi_calls(vapi_call_id);
CREATE INDEX idx_vapi_calls_started_at ON public.vapi_calls(started_at);
CREATE INDEX idx_patient_assessments_patient_id ON public.patient_assessments(patient_id);
CREATE INDEX idx_patient_assessments_vapi_call_id ON public.patient_assessments(vapi_call_id);
CREATE INDEX idx_patient_assessments_assessment_date ON public.patient_assessments(assessment_date);
CREATE INDEX idx_living_situation_patient_id ON public.living_situation(patient_id);
CREATE INDEX idx_adl_assessment_patient_id ON public.adl_assessment(patient_id);
CREATE INDEX idx_iadl_assessment_patient_id ON public.iadl_assessment(patient_id);
CREATE INDEX idx_health_assessment_patient_id ON public.health_assessment(patient_id);
CREATE INDEX idx_cognition_assessment_patient_id ON public.cognition_assessment(patient_id);
CREATE INDEX idx_support_network_patient_id ON public.support_network(patient_id);

-- =====================================================
-- Enable Row Level Security on All Tables
-- =====================================================
ALTER TABLE public.vapi_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.living_situation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adl_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iadl_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognition_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_network ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Create RLS Policies for All Tables
-- =====================================================

-- VAPI Calls Policies
CREATE POLICY "Authenticated users can view vapi_calls" 
ON public.vapi_calls FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create vapi_calls" 
ON public.vapi_calls FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update vapi_calls" 
ON public.vapi_calls FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete vapi_calls" 
ON public.vapi_calls FOR DELETE TO authenticated USING (true);

-- Patient Assessments Policies
CREATE POLICY "Authenticated users can view patient_assessments" 
ON public.patient_assessments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create patient_assessments" 
ON public.patient_assessments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update patient_assessments" 
ON public.patient_assessments FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete patient_assessments" 
ON public.patient_assessments FOR DELETE TO authenticated USING (true);

-- Living Situation Policies
CREATE POLICY "Authenticated users can view living_situation" 
ON public.living_situation FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create living_situation" 
ON public.living_situation FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update living_situation" 
ON public.living_situation FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete living_situation" 
ON public.living_situation FOR DELETE TO authenticated USING (true);

-- ADL Assessment Policies
CREATE POLICY "Authenticated users can view adl_assessment" 
ON public.adl_assessment FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create adl_assessment" 
ON public.adl_assessment FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update adl_assessment" 
ON public.adl_assessment FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete adl_assessment" 
ON public.adl_assessment FOR DELETE TO authenticated USING (true);

-- IADL Assessment Policies
CREATE POLICY "Authenticated users can view iadl_assessment" 
ON public.iadl_assessment FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create iadl_assessment" 
ON public.iadl_assessment FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update iadl_assessment" 
ON public.iadl_assessment FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete iadl_assessment" 
ON public.iadl_assessment FOR DELETE TO authenticated USING (true);

-- Health Assessment Policies
CREATE POLICY "Authenticated users can view health_assessment" 
ON public.health_assessment FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create health_assessment" 
ON public.health_assessment FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update health_assessment" 
ON public.health_assessment FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete health_assessment" 
ON public.health_assessment FOR DELETE TO authenticated USING (true);

-- Cognition Assessment Policies
CREATE POLICY "Authenticated users can view cognition_assessment" 
ON public.cognition_assessment FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create cognition_assessment" 
ON public.cognition_assessment FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update cognition_assessment" 
ON public.cognition_assessment FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete cognition_assessment" 
ON public.cognition_assessment FOR DELETE TO authenticated USING (true);

-- Support Network Policies
CREATE POLICY "Authenticated users can view support_network" 
ON public.support_network FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create support_network" 
ON public.support_network FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update support_network" 
ON public.support_network FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete support_network" 
ON public.support_network FOR DELETE TO authenticated USING (true);

-- =====================================================
-- Create Triggers for Automatic Timestamp Updates
-- =====================================================
CREATE TRIGGER update_vapi_calls_updated_at
BEFORE UPDATE ON public.vapi_calls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_assessments_updated_at
BEFORE UPDATE ON public.patient_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_living_situation_updated_at
BEFORE UPDATE ON public.living_situation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_adl_assessment_updated_at
BEFORE UPDATE ON public.adl_assessment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_iadl_assessment_updated_at
BEFORE UPDATE ON public.iadl_assessment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_assessment_updated_at
BEFORE UPDATE ON public.health_assessment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cognition_assessment_updated_at
BEFORE UPDATE ON public.cognition_assessment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_network_updated_at
BEFORE UPDATE ON public.support_network
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

