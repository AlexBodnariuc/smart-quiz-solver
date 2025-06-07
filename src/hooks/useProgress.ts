import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEmailAuth } from '@/components/auth/EmailAuthProvider';

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
  const { session } = useEmailAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('useProgress - Session:', session);

  const getCurrentEmailSessionId = async (): Promise<string | null> => {
    const token = localStorage.getItem('email_session_token');
    if (!token) {
      console.log('No email session token found');
      return null;
    }

    console.log('Getting email session for token:', token);

    const { data, error } = await supabase
      .from('email_sessions')
      .select('id')
      .eq('session_token', token)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error getting email session:', error);
      return null;
    }
    
    console.log('Email session data:', data);
    return data?.id || null;
  };

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

  const trackDailyLogin = async (emailSessionId: string): Promise<number> => {
    const today = new Date().toISOString().split('T')[0];
    
    console.log('Tracking daily login for:', emailSessionId, 'Date:', today);

    // Get current progress
    const { data: currentProgress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('email_session_id', emailSessionId)
      .single();

    if (progressError) {
      console.error('Error getting current progress for login tracking:', progressError);
      return 0;
    }

    // Check if user already logged in today
    if (currentProgress.last_activity_date === today) {
      console.log('User already logged in today, no additional XP');
      return 0;
    }

    // Calculate new streak and XP
    let newStreak = currentProgress.current_streak;
    let newLongestStreak = currentProgress.longest_streak;
    let dailyLoginXP = 10; // Base daily login XP

    if (currentProgress.last_activity_date) {
      const lastActivity = new Date(currentProgress.last_activity_date);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActivity.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        // Consecutive day - increment streak
        newStreak += 1;
        newLongestStreak = Math.max(newLongestStreak, newStreak);
        // Bonus XP for maintaining streak
        dailyLoginXP += Math.min(newStreak * 2, 50); // Up to 50 bonus XP
      } else {
        // Streak broken - reset to 1
        newStreak = 1;
      }
    } else {
      // First activity - start streak
      newStreak = 1;
      newLongestStreak = Math.max(newLongestStreak, 1);
    }

    const newXP = currentProgress.total_xp + dailyLoginXP;
    const newLevel = calculateLevel(newXP);

    // Update progress
    const { error: updateError } = await supabase
      .from('user_progress')
      .update({
        total_xp: newXP,
        current_level: newLevel,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('email_session_id', emailSessionId);

    if (updateError) {
      console.error('Error updating progress for daily login:', updateError);
      return 0;
    }

    console.log(`Daily login tracked: +${dailyLoginXP} XP, Streak: ${newStreak}, Total XP: ${newXP}`);

    // Update local state
    setProgress(prev => prev ? {
      ...prev,
      total_xp: newXP,
      current_level: newLevel,
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_activity_date: today,
      updated_at: new Date().toISOString()
    } : null);

    return dailyLoginXP;
  };

  const loadProgress = async () => {
    if (!session) {
      console.log('No session, clearing progress data');
      setProgress(null);
      setUserAchievements([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const emailSessionId = await getCurrentEmailSessionId();
      if (!emailSessionId) {
        console.log('No email session found, cannot load progress');
        setProgress(null);
        setUserAchievements([]);
        setLoading(false);
        return;
      }

      console.log('Loading progress for email session:', emailSessionId);

      // Load user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('email_session_id', emailSessionId)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }

      if (!progressData) {
        console.log('Creating initial progress entry');
        // Create initial progress entry
        const { data: newProgress, error: createError } = await supabase
          .from('user_progress')
          .insert({
            email_session_id: emailSessionId,
            total_xp: 0,
            current_level: 1,
            current_streak: 0,
            longest_streak: 0,
            last_activity_date: null
          })
          .select()
          .single();

        if (createError) throw createError;
        console.log('Created new progress:', newProgress);
        setProgress(newProgress);
        
        // Track daily login for new user
        await trackDailyLogin(emailSessionId);
      } else {
        console.log('Loaded existing progress:', progressData);
        setProgress(progressData);
        
        // Track daily login
        await trackDailyLogin(emailSessionId);
      }

      // Load all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('condition_value');

      if (achievementsError) throw achievementsError;
      console.log('Loaded achievements:', achievementsData);
      setAchievements(achievementsData || []);

      // Load user achievements
      const { data: userAchievementsData, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('email_session_id', emailSessionId);

      if (userAchievementsError) throw userAchievementsError;
      console.log('Loaded user achievements:', userAchievementsData);
      setUserAchievements(userAchievementsData || []);

    } catch (err: any) {
      console.error('Error loading progress:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addXP = async (xpAmount: number, quizScore?: number): Promise<UserAchievement[]> => {
    if (!session || !progress) {
      console.log('Cannot add XP - no session or progress');
      return [];
    }

    const emailSessionId = await getCurrentEmailSessionId();
    if (!emailSessionId) {
      console.log('Cannot add XP - no email session');
      return [];
    }

    console.log('Adding XP:', xpAmount, 'Current XP:', progress.total_xp);

    const newXP = progress.total_xp + xpAmount;
    const newLevel = calculateLevel(newXP);
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate streak (quiz completion can also maintain streak)
    let newStreak = progress.current_streak;
    let newLongestStreak = progress.longest_streak;

    if (progress.last_activity_date) {
      const lastActivity = new Date(progress.last_activity_date);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (progress.last_activity_date === today) {
        // Same day - no streak change but activity tracked
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

    // Update progress
    const { error: updateError } = await supabase
      .from('user_progress')
      .update({
        total_xp: newXP,
        current_level: newLevel,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('email_session_id', emailSessionId);

    if (updateError) {
      console.error('Error updating progress:', updateError);
      return [];
    }

    console.log('Updated progress - New XP:', newXP, 'New Level:', newLevel);

    // Update local state
    setProgress(prev => prev ? {
      ...prev,
      total_xp: newXP,
      current_level: newLevel,
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_activity_date: today,
      updated_at: new Date().toISOString()
    } : null);

    // Check for new achievements
    const newAchievements = await checkAndAwardAchievements(emailSessionId, newXP, newLevel, newStreak, quizScore);
    
    return newAchievements;
  };

  const checkAndAwardAchievements = async (
    emailSessionId: string, 
    totalXP: number, 
    currentLevel: number, 
    currentStreak: number,
    quizScore?: number
  ): Promise<UserAchievement[]> => {
    const newAchievements: UserAchievement[] = [];
    const earnedAchievementIds = userAchievements.map(ua => ua.achievement_id);

    console.log('Checking achievements for:', { totalXP, currentLevel, currentStreak, quizScore });

    // Get total completed quizzes
    const { data: completedQuizzes, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('id')
      .eq('email_session_id', emailSessionId)
      .eq('is_completed', true);

    if (quizError) {
      console.error('Error getting completed quizzes:', quizError);
      return [];
    }

    const totalQuizzes = completedQuizzes?.length || 0;
    console.log('Total completed quizzes:', totalQuizzes);

    for (const achievement of achievements) {
      if (earnedAchievementIds.includes(achievement.id)) continue;

      let shouldAward = false;

      switch (achievement.condition_type) {
        case 'total_quizzes':
          shouldAward = totalQuizzes >= achievement.condition_value;
          break;
        case 'perfect_score':
          shouldAward = quizScore === achievement.condition_value;
          break;
        case 'streak':
          shouldAward = currentStreak >= achievement.condition_value;
          break;
        case 'level_reached':
          shouldAward = currentLevel >= achievement.condition_value;
          break;
      }

      console.log('Achievement check:', achievement.name, 'should award:', shouldAward);

      if (shouldAward) {
        const { data: newAchievement, error: achievementError } = await supabase
          .from('user_achievements')
          .insert({
            email_session_id: emailSessionId,
            achievement_id: achievement.id
          })
          .select(`
            *,
            achievement:achievements(*)
          `)
          .single();

        if (!achievementError && newAchievement) {
          console.log('Awarded achievement:', newAchievement);
          newAchievements.push(newAchievement);
          
          // Award XP bonus for achievement
          if (achievement.xp_reward > 0) {
            await supabase
              .from('user_progress')
              .update({
                total_xp: totalXP + achievement.xp_reward,
                updated_at: new Date().toISOString()
              })
              .eq('email_session_id', emailSessionId);

            // Update local state with bonus XP
            setProgress(prev => prev ? {
              ...prev,
              total_xp: prev.total_xp + achievement.xp_reward,
              updated_at: new Date().toISOString()
            } : null);
          }
        } else {
          console.error('Error awarding achievement:', achievementError);
        }
      }
    }

    if (newAchievements.length > 0) {
      setUserAchievements(prev => [...prev, ...newAchievements]);
    }

    return newAchievements;
  };

  useEffect(() => {
    console.log('useProgress effect - session changed:', session);
    if (session) {
      loadProgress();
    } else {
      setProgress(null);
      setUserAchievements([]);
      setAchievements([]);
    }
  }, [session]);

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
