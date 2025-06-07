
import { Trophy, Star, Flame, TrendingUp } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';

export const ProgressDisplay = () => {
  const { progress, loading, error } = useProgress();

  console.log('ProgressDisplay - Progress data:', progress);
  console.log('ProgressDisplay - Loading:', loading);
  console.log('ProgressDisplay - Error:', error);

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-6 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <div className="text-red-300 text-sm">
          Eroare la încărcarea progresului: {error}
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <div className="text-yellow-300 text-sm">
          Progresul nu este disponibil. Conectează-te pentru a salva progresul.
        </div>
      </div>
    );
  }

  const xpForCurrentLevel = Math.pow(progress.current_level - 1, 2) * 100;
  const xpForNextLevel = Math.pow(progress.current_level, 2) * 100;
  const xpProgress = progress.total_xp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = Math.max(0, Math.min(100, (xpProgress / xpNeeded) * 100));

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Level */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Star className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">{progress.current_level}</div>
          <div className="text-sm text-blue-200">Nivel</div>
        </div>

        {/* Total XP */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{progress.total_xp}</div>
          <div className="text-sm text-blue-200">XP Total</div>
        </div>

        {/* Current Streak */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Flame className="h-6 w-6 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">{progress.current_streak}</div>
          <div className="text-sm text-blue-200">Streak Curent</div>
        </div>

        {/* Longest Streak */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-6 w-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{progress.longest_streak}</div>
          <div className="text-sm text-blue-200">Cel Mai Lung</div>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-200">Progres către Nivelul {progress.current_level + 1}</span>
          <span className="text-white font-medium">
            {xpProgress} / {xpNeeded} XP
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
