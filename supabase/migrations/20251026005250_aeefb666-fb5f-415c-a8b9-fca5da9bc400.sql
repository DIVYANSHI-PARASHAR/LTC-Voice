-- Fix calls table RLS policy to allow public inserts
DROP POLICY IF EXISTS "Authenticated users can insert calls" ON calls;

CREATE POLICY "Allow inserts for all users"
ON calls FOR INSERT
TO public
WITH CHECK (true);

-- Fix notifications table RLS policy to allow public inserts
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;

CREATE POLICY "Allow inserts for all users"
ON notifications FOR INSERT
TO public
WITH CHECK (true);