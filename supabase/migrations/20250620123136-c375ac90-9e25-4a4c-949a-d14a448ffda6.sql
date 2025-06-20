
-- Add a trigger to automatically create user progress when a new email session is created
CREATE OR REPLACE FUNCTION public.handle_new_email_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create user progress entry for the new email session
  INSERT INTO public.user_progress (email_session_id, total_xp, current_level, current_streak, longest_streak)
  VALUES (NEW.id, 0, 1, 0, 0)
  ON CONFLICT (email_session_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new email sessions
CREATE TRIGGER on_email_session_created
  AFTER INSERT ON public.email_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_email_session();

-- Add password hash column to email_sessions table for secure password storage
ALTER TABLE public.email_sessions 
ADD COLUMN IF NOT EXISTS password_hash text;

-- Add email verification status
ALTER TABLE public.email_sessions 
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- Add password reset token support
ALTER TABLE public.email_sessions 
ADD COLUMN IF NOT EXISTS reset_token text,
ADD COLUMN IF NOT EXISTS reset_token_expires_at timestamp with time zone;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_sessions_email ON public.email_sessions(email);
CREATE INDEX IF NOT EXISTS idx_email_sessions_reset_token ON public.email_sessions(reset_token);

-- Enable RLS on email_sessions table
ALTER TABLE public.email_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_sessions
CREATE POLICY "Users can view their own email sessions" 
  ON public.email_sessions 
  FOR SELECT 
  USING (session_token = current_setting('request.headers', true)::json->>'authorization' OR id::text = current_setting('app.current_session_id', true));

CREATE POLICY "Users can update their own email sessions" 
  ON public.email_sessions 
  FOR UPDATE 
  USING (session_token = current_setting('request.headers', true)::json->>'authorization' OR id::text = current_setting('app.current_session_id', true));

-- Create a secure function to verify passwords
CREATE OR REPLACE FUNCTION public.verify_email_password(input_email text, input_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  session_record public.email_sessions;
  new_token text;
BEGIN
  -- Find the session by email
  SELECT * INTO session_record
  FROM public.email_sessions
  WHERE email = input_email AND is_active = true
  LIMIT 1;
  
  -- Check if session exists and password matches
  IF session_record.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid email or password');
  END IF;
  
  -- Verify password using crypt function
  IF NOT (session_record.password_hash = crypt(input_password, session_record.password_hash)) THEN
    RETURN json_build_object('success', false, 'error', 'Invalid email or password');
  END IF;
  
  -- Generate new session token
  new_token := gen_random_uuid()::text;
  
  -- Update session with new token and last_active
  UPDATE public.email_sessions
  SET session_token = new_token, last_active = now()
  WHERE id = session_record.id;
  
  -- Return success with session data
  RETURN json_build_object(
    'success', true,
    'session', json_build_object(
      'id', session_record.id,
      'email', session_record.email,
      'session_token', new_token,
      'email_verified', session_record.email_verified
    )
  );
END;
$$;

-- Create a secure function to create new user accounts
CREATE OR REPLACE FUNCTION public.create_email_account(input_email text, input_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  existing_session public.email_sessions;
  new_session_id uuid;
  new_token text;
  password_hash text;
BEGIN
  -- Check if email already exists
  SELECT * INTO existing_session
  FROM public.email_sessions
  WHERE email = input_email
  LIMIT 1;
  
  IF existing_session.id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Email already registered');
  END IF;
  
  -- Hash the password
  password_hash := crypt(input_password, gen_salt('bf'));
  new_token := gen_random_uuid()::text;
  
  -- Create new session
  INSERT INTO public.email_sessions (email, password_hash, session_token, email_verified, is_active)
  VALUES (input_email, password_hash, new_token, true, true)
  RETURNING id INTO new_session_id;
  
  -- Return success with session data
  RETURN json_build_object(
    'success', true,
    'session', json_build_object(
      'id', new_session_id,
      'email', input_email,
      'session_token', new_token,
      'email_verified', true
    )
  );
END;
$$;

-- Enable the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;
