
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { QuizLoader } from '@/components/QuizLoader';
import { Quiz } from '@/components/Quiz';
import { useQuizStorage } from '@/hooks/useQuizStorage';
import { useEmailAuth } from '@/components/auth/EmailAuthProvider';
import { useProgress } from '@/hooks/useProgress';
import { ProgressDisplay } from '@/components/ProgressDisplay';
import { AchievementNotification } from '@/components/AchievementNotification';
import { Button } from '@/components/ui/button';
import { Trophy, User, Plus } from 'lucide-react';

export interface Question {
  id: string;
  text: string;
  variants: string[];
  correctAnswer: number;
  explanation: string;
  passage?: string;
}

export interface QuizData {
  id?: string;
  title: string;
  questions: Question[];
}

interface QuizSession {
  id: string;
  title: string;
  is_completed: boolean;
  score?: number;
  created_at: string;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  earned_at: string;
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    xp_reward: number;
  };
}

export default function Index() {
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAchievements, setNewAchievements] = useState<UserAchievement[]>([]);
  const navigate = useNavigate();
  const { session } = useEmailAuth();
  const { getUserQuizSessions } = useQuizStorage();
  const { progress, loadProgress } = useProgress();

  // Track daily login for streak system
  useEffect(() => {
    if (session) {
      console.log('User logged in, tracking daily activity for streak');
      loadProgress(); // This will handle daily login tracking
    }
  }, [session, loadProgress]);

  useEffect(() => {
    loadAvailableQuizzes();
  }, [session]);

  const loadAvailableQuizzes = async () => {
    setLoading(true);
    try {
      const quizzes = await getUserQuizSessions();
      console.log('Loaded quizzes:', quizzes);
      setAvailableQuizzes(quizzes);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizLoad = (quizData: QuizData, sessionId?: string) => {
    console.log('Quiz loaded:', quizData.title);
    setCurrentQuiz(quizData);
    setSessionId(sessionId || null);
  };

  const handleQuizComplete = (achievements: UserAchievement[] = []) => {
    setCurrentQuiz(null);
    setSessionId(null);
    loadAvailableQuizzes();
    // Reload progress to show updated XP and achievements
    loadProgress();
    
    // Show achievement notifications if any
    if (achievements.length > 0) {
      setNewAchievements(achievements);
    }
  };

  const handleAchievementClose = () => {
    setNewAchievements([]);
  };

  const startQuiz = async (quiz: QuizSession) => {
    console.log('Starting quiz:', quiz.title);
    // Load the full quiz data here - this would need to be implemented
    // For now, we'll show a message that this needs to be implemented
    alert('Quiz loading functionality needs to be implemented');
  };

  const handleShowProfile = () => {
    navigate('/profile');
  };

  if (currentQuiz) {
    return (
      <>
        <Quiz
          quizData={currentQuiz}
          sessionId={sessionId || undefined}
          onComplete={handleQuizComplete}
        />
        {newAchievements.length > 0 && (
          <AchievementNotification
            achievements={newAchievements}
            onClose={handleAchievementClose}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with User Info */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Quiz Academy
            </h1>
            <p className="text-blue-200">
              Îmbunătățește-ți cunoștințele și câștigă XP!
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Button
                  onClick={() => navigate('/profile')}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </Button>
                <Button
                  onClick={() => navigate('/profile')}
                  variant="outline"
                  className="bg-yellow-500/20 border-yellow-400/30 text-yellow-300 hover:bg-yellow-500/30"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Realizări
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
              >
                Conectează-te
              </Button>
            )}
          </div>
        </div>

        {/* Progress Display - Show if user is logged in */}
        {session && (
          <div className="mb-8">
            <ProgressDisplay />
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quiz Creator */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Creează Quiz Nou</h2>
              <p className="text-blue-200">
                Generează quiz-uri personalizate din fișierele tale PDF
              </p>
            </div>
            
            <QuizLoader onQuizLoad={handleQuizLoad} onShowProfile={handleShowProfile} />
          </div>

          {/* Available Quizzes */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Quiz-uri Disponibile</h2>
              <p className="text-blue-200">
                Continuă quiz-urile în curs sau începe unele noi
              </p>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-blue-200 mt-4">Se încarcă quiz-urile...</p>
              </div>
            ) : availableQuizzes.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {availableQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{quiz.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            quiz.is_completed 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {quiz.is_completed ? 'Completat' : 'În progres'}
                          </span>
                          {quiz.score && (
                            <span className="text-blue-200">
                              Scor: {quiz.score.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => startQuiz(quiz)}
                        size="sm"
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                      >
                        {quiz.is_completed ? 'Reîncercare' : 'Continuă'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-blue-200">
                  {session 
                    ? 'Nu ai încă niciun quiz. Creează primul tău quiz mai sus!' 
                    : 'Conectează-te pentru a vedea quiz-urile tale salvate.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Summary for Logged-in Users */}
        {session && progress && (
          <div className="mt-8 grid md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
              <div className="text-2xl font-bold text-cyan-400">{progress.total_xp}</div>
              <div className="text-sm text-blue-200">XP Total</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
              <div className="text-2xl font-bold text-yellow-400">{progress.current_level}</div>
              <div className="text-sm text-blue-200">Nivel</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
              <div className="text-2xl font-bold text-red-400">{progress.current_streak}</div>
              <div className="text-sm text-blue-200">Streak Curent</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
              <div className="text-2xl font-bold text-green-400">{progress.longest_streak}</div>
              <div className="text-sm text-blue-200">Cel Mai Lung</div>
            </div>
          </div>
        )}

        {/* Call to Action for Non-logged Users */}
        {!session && (
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-3xl p-8 border border-cyan-400/30">
              <h3 className="text-2xl font-bold text-white mb-4">
                Conectează-te pentru a-ți salva progresul!
              </h3>
              <p className="text-blue-200 mb-6">
                Câștigă XP, deblochează realizări și urmărește-ți progresul în timp.
              </p>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 text-lg hover:from-cyan-600 hover:to-blue-700"
              >
                Începe Acum
              </Button>
            </div>
          </div>
        )}

        {/* Achievement Notifications */}
        {newAchievements.length > 0 && (
          <AchievementNotification
            achievements={newAchievements}
            onClose={handleAchievementClose}
          />
        )}
      </div>
    </div>
  );
}
