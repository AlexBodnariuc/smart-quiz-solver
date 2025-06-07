
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { EmailAuthProvider } from '@/components/auth/EmailAuthProvider';
import { AuthWrapper } from '@/components/AuthWrapper';
import Index from '@/pages/Index';
import { Profile } from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EmailAuthProvider>
        <Router>
          <AuthWrapper>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile onBack={() => window.history.back()} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthWrapper>
        </Router>
      </EmailAuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
