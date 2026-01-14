-- Create calls table to track phone call status
CREATE TABLE public.calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id text UNIQUE NOT NULL,
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  patient_phone text NOT NULL,
  status text DEFAULT 'initiated' NOT NULL,
  initiated_at timestamp with time zone DEFAULT now() NOT NULL,
  completed_at timestamp with time zone,
  transcript_ready boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES public.calls(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  read boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for calls (authenticated users can view and manage all calls)
CREATE POLICY "Authenticated users can view calls"
  ON public.calls FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert calls"
  ON public.calls FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update calls"
  ON public.calls FOR UPDATE
  TO authenticated
  USING (true);

-- RLS policies for notifications (authenticated users can view and update all notifications)
CREATE POLICY "Authenticated users can view notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (true);

-- Create trigger for updated_at on calls
CREATE TRIGGER update_calls_updated_at
  BEFORE UPDATE ON public.calls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;