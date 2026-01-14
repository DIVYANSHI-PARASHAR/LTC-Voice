-- Fix calls table: Drop restrictive policy and create permissive one
DROP POLICY IF EXISTS "Allow inserts for all users" ON calls;

CREATE POLICY "Allow public inserts"
ON calls
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);

-- Fix notifications table: Drop restrictive policy and create permissive one
DROP POLICY IF EXISTS "Allow inserts for all users" ON notifications;

CREATE POLICY "Allow public inserts"
ON notifications
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);