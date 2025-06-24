
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  // Since we removed authentication, we'll use a mock progress state
  useEffect(() => {
    console.log('useProgress effect - initializing mock progress data');
    
    // Set mock progress data
    const mockProgress: UserProgress = {
      id: 'mock-id',
      email_session_id: 'mock-session',
      total_xp: 0,
      current_level: 1,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setProgress(mockProgress);
    setAchievements([]);
    setUserAchievements([]);
    setLoading(false);
  }, []);

  const calculateLevel = (xp: number): number => {
    // Level formula: level = floor(sqrt(xp / 100)) + 1
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  const getXpForLevel = (level: number): number => {
    // XP needed for level: (level - 1)^2 * 100
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

    // Update local state (without database since there's no auth)
    setProgress(prev => prev ? {
      ...prev,
      total_xp: newXP,
      current_level: newLevel,
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_activity_date: today,
      updated_at: new Date().toISOString()
    } : null);

    return [];
  };

  const loadProgress = async () => {
    // Mock function for compatibility
    console.log('loadProgress called - using mock data');
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
