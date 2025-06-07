
import { useEmailAuth } from './auth/EmailAuthProvider';
import { EmailLoginForm } from './auth/EmailLoginForm';
import { LogOut, User } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { session, loading, signOut } = useEmailAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="text-lg">Se încarcă...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <EmailLoginForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header with user info and logout */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20 flex items-center gap-3 shadow-lg">
          <div className="flex items-center gap-2 text-white">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{session.email}</span>
          </div>
          <button
            onClick={signOut}
            className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            title="Deconectează-te"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Main content with top margin to prevent overlap */}
      <div className="pt-20">
        {children}
      </div>
    </div>
  );
};
