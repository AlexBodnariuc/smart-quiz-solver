
import { useState, useEffect } from 'react';

interface UserProgress {
  id: string;
  email_session_id: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  condition_type: string;
  condition_value: number;
  created_at: string;
}

interface UserAchievement {
  id: string;
  email_session_id: string;
  achievement_id: string;
  earned_at: string;
  achievement: Achievement;
}

export const useProgress = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useProgress effect - initializing progress data');
    loadLocalProgress();
  }, []);

  const loadLocalProgress = () => {
    // Load from localStorage or create default
    const stored = localStorage.getItem('userProgress');
    if (stored) {
      try {
        const parsedProgress = JSON.parse(stored);
        setProgress(parsedProgress);
        console.log('Loaded progress from localStorage:', parsedProgress);
      } catch (error) {
        console.error('Error parsing stored progress:', error);
        createDefaultProgress();
      }
    } else {
      createDefaultProgress();
    }
  };

  const createDefaultProgress = () => {
    const defaultProgress: UserProgress = {
      id: 'local-progress',
      email_session_id: 'local-session',
      total_xp: 0,
      current_level: 1,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setProgress(defaultProgress);
    localStorage.setItem('userProgress', JSON.stringify(defaultProgress));
    console.log('Created default progress:', defaultProgress);
  };

  const saveProgressToLocal = (newProgress: UserProgress) => {
    localStorage.setItem('userProgress', JSON.stringify(newProgress));
    console.log('Saved progress to localStorage:', newProgress);
  };

  const calculateLevel = (xp: number): number => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  const getXpForLevel = (level: number): number => {
    return Math.pow(level - 1, 2) * 100;
  };

  const getXpForNextLevel = (currentLevel: number): number => {
    return getXpForLevel(currentLevel + 1);
  };

  const addXP = async (xpAmount: number, quizScore?: number): Promise<UserAchievement[]> => {
    if (!progress) {
      console.log('Cannot add XP - no progress data');
      return [];
    }

    console.log('Adding XP:', xpAmount, 'Current XP:', progress.total_xp);

    const newXP = progress.total_xp + xpAmount;
    const newLevel = calculateLevel(newXP);
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate streak
    let newStreak = progress.current_streak;
    let newLongestStreak = progress.longest_streak;

    if (progress.last_activity_date) {
      const lastActivity = new Date(progress.last_activity_date);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (progress.last_activity_date === today) {
        // Same day - no streak change
      } else if (lastActivity.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        // Consecutive day - increment streak
        newStreak += 1;
        newLongestStreak = Math.max(newLongestStreak, newStreak);
      } else {
        // Streak broken - reset to 1
        newStreak = 1;
      }
    } else {
      // First activity - start streak
      newStreak = 1;
      newLongestStreak = Math.max(newLongestStreak, 1);
    }

    console.log('Updated progress - New XP:', newXP, 'New Level:', newLevel);

    const updatedProgress: UserProgress = {
      ...progress,
      total_xp: newXP,
      current_level: newLevel,
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_activity_date: today,
      updated_at: new Date().toISOString()
    };

    setProgress(updatedProgress);
    saveProgressToLocal(updatedProgress);

    // Check for achievements (mock for now)
    const newAchievements: UserAchievement[] = [];
    
    // Level up achievement
    if (newLevel > progress.current_level) {
      console.log(`Level up! From ${progress.current_level} to ${newLevel}`);
      // Could add achievement notification here
    }

    // Streak achievements
    if (newStreak > 0 && newStreak % 5 === 0) {
      console.log(`Streak milestone: ${newStreak} days`);
      // Could add streak achievement here
    }

    return newAchievements;
  };

  const loadProgress = async () => {
    console.log('loadProgress called - reloading from localStorage');
    loadLocalProgress();
  };

  return {
    progress,
    achievements,
    userAchievements,
    loading,
    error,
    addXP,
    calculateLevel,
    getXpForLevel,
    getXpForNextLevel,
    loadProgress
  };
};
