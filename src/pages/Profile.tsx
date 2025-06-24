
import { ProgressDisplay } from '@/components/ProgressDisplay';
import { AchievementsList } from '@/components/AchievementsList';
import { User, ArrowLeft } from 'lucide-react';

interface ProfileProps {
  onBack: () => void;
}

export const Profile = ({ onBack }: ProfileProps) => {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Înapoi
            </button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <User className="h-8 w-8 text-cyan-400" />
              Profilul Meu
            </h1>
            <div></div>
          </div>
          
          <div className="text-center">
            <p className="text-blue-100">
              Progresul local - fără autentificare
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Progress Display */}
          <div className="lg:col-span-3">
            <ProgressDisplay />
          </div>

          {/* Achievements */}
          <div className="lg:col-span-3">
            <AchievementsList />
          </div>
        </div>
      </div>
    </div>
  );
};
