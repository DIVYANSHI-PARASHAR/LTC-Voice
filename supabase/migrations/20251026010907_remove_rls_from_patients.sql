-- Remove Row Level Security from patients table
-- This migration removes all RLS policies and disables RLS on the patients table

-- Drop all existing RLS policies for the patients table
DROP POLICY IF EXISTS "Authenticated users can view patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can create patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can update patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can delete patients" ON public.patients;

-- Disable Row Level Security on the patients table
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
