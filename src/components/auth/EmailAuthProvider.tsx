
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailSession {
  id: string;
  email: string;
  session_token: string;
  created_at: string;
  last_active: string;
  is_active: boolean;
}

interface EmailAuthContextType {
  session: EmailSession | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateActivity: () => Promise<void>;
}

const EmailAuthContext = createContext<EmailAuthContextType>({
  session: null,
  loading: true,
  signInWithEmail: async () => {},
  signOut: async () => {},
  updateActivity: async () => {},
});

export const useEmailAuth = () => {
  const context = useContext(EmailAuthContext);
  if (!context) {
    throw new Error('useEmailAuth must be used within an EmailAuthProvider');
  }
  return context;
};

export const EmailAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<EmailSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedToken = localStorage.getItem('email_session_token');
    if (storedToken) {
      validateSession(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const validateSession = async (token: string) => {
    try {
      const { data, error } = await supabase
        .from('email_sessions')
        .select('*')
        .eq('session_token', token)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Session validation error:', error);
        localStorage.removeItem('email_session_token');
        setSession(null);
      } else {
        setSession(data);
        // Update last_active timestamp
        await updateSessionActivity(data.id);
      }
    } catch (err) {
      console.error('Error validating session:', err);
      localStorage.removeItem('email_session_token');
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionActivity = async (sessionId: string) => {
    try {
      await supabase
        .from('email_sessions')
        .update({ last_active: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (err) {
      console.error('Error updating session activity:', err);
    }
  };

  const signInWithEmail = async (email: string) => {
    try {
      // First, check if a session already exists for this email
      const { data: existingSession } = await supabase
        .from('email_sessions')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      let sessionData;

      if (existingSession) {
        // Update existing session
        const { data, error } = await supabase
          .from('email_sessions')
          .update({ 
            last_active: new Date().toISOString(),
            session_token: crypto.randomUUID()
          })
          .eq('id', existingSession.id)
          .select()
          .single();

        if (error) throw error;
        sessionData = data;
      } else {
        // Create new session
        const { data, error } = await supabase
          .from('email_sessions')
          .insert({
            email,
            session_token: crypto.randomUUID(),
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;
        sessionData = data;
      }

      // Store session token in localStorage
      localStorage.setItem('email_session_token', sessionData.session_token);
      setSession(sessionData);
    } catch (err: any) {
      console.error('Sign in error:', err);
      throw new Error(err.message || 'Failed to sign in');
    }
  };

  const signOut = async () => {
    if (session) {
      try {
        await supabase
          .from('email_sessions')
          .update({ is_active: false })
          .eq('id', session.id);
      } catch (err) {
        console.error('Error during sign out:', err);
      }
    }

    localStorage.removeItem('email_session_token');
    setSession(null);
  };

  const updateActivity = async () => {
    if (session) {
      await updateSessionActivity(session.id);
    }
  };

  const value = {
    session,
    loading,
    signInWithEmail,
    signOut,
    updateActivity,
  };

  return (
    <EmailAuthContext.Provider value={value}>
      {children}
    </EmailAuthContext.Provider>
  );
};
