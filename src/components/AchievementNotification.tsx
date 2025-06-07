
import { useState, useEffect } from 'react';
import { Trophy, X } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
}

interface UserAchievement {
  id: string;
  achievement: Achievement;
}

interface AchievementNotificationProps {
  achievements: UserAchievement[];
  onClose: () => void;
}

export const AchievementNotification = ({ achievements, onClose }: AchievementNotificationProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievements.length > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        if (currentIndex < achievements.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [achievements, currentIndex, onClose]);

  if (!achievements.length || !isVisible) return null;

  const currentAchievement = achievements[currentIndex];

  return (
    <div className="fixed top-4 right-4 z-50 transition-all duration-300 transform">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-xl shadow-xl border border-yellow-400/50 max-w-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Realizare Deblocată!</h3>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentAchievement.achievement.icon}</span>
            <div>
              <h4 className="font-semibold text-lg">{currentAchievement.achievement.name}</h4>
              <p className="text-yellow-100 text-sm">{currentAchievement.achievement.description}</p>
            </div>
          </div>

          {currentAchievement.achievement.xp_reward > 0 && (
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <span className="font-bold">+{currentAchievement.achievement.xp_reward} XP</span>
            </div>
          )}
        </div>

        {achievements.length > 1 && (
          <div className="mt-4 flex justify-center">
            <div className="text-xs text-yellow-100">
              {currentIndex + 1} din {achievements.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
