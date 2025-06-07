
import { useProgress } from '@/hooks/useProgress';
import { Trophy, Lock } from 'lucide-react';

export const AchievementsList = () => {
  const { achievements, userAchievements, loading } = useProgress();

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-white/20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const earnedAchievementIds = userAchievements.map(ua => ua.achievement_id);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Trophy className="h-6 w-6 text-yellow-400" />
        Realizări
      </h3>

      <div className="space-y-4">
        {achievements.map((achievement) => {
          const isEarned = earnedAchievementIds.includes(achievement.id);
          
          return (
            <div
              key={achievement.id}
              className={`
                rounded-xl p-4 border transition-all duration-300
                ${isEarned 
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50' 
                  : 'bg-white/5 border-white/20'
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  text-3xl p-2 rounded-lg
                  ${isEarned ? 'bg-yellow-400/20' : 'bg-white/10'}
                `}>
                  {isEarned ? achievement.icon : <Lock className="h-6 w-6 text-gray-400" />}
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-semibold text-lg ${isEarned ? 'text-yellow-200' : 'text-gray-300'}`}>
                    {achievement.name}
                  </h4>
                  <p className={`text-sm ${isEarned ? 'text-yellow-100' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>
                </div>

                <div className="text-right">
                  {achievement.xp_reward > 0 && (
                    <div className={`
                      text-sm font-medium
                      ${isEarned ? 'text-yellow-200' : 'text-gray-400'}
                    `}>
                      +{achievement.xp_reward} XP
                    </div>
                  )}
                  {isEarned && (
                    <div className="text-xs text-yellow-300 mt-1">
                      ✓ Deblocat
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
