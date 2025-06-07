
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz } from '@/components/Quiz';
import { useQuizStorage } from '@/hooks/useQuizStorage';
import { useEmailAuth } from '@/components/auth/EmailAuthProvider';
import { Button } from '@/components/ui/button';
import { User, Trophy, PlayCircle, CheckCircle, Clock } from 'lucide-react';

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

export default function Index() {
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useEmailAuth();
  const { getUserQuizSessions, loadQuizSession } = useQuizStorage();

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

  const handleQuizComplete = () => {
    setCurrentQuiz(null);
    setSessionId(null);
    loadAvailableQuizzes();
  };

  const startQuiz = async (quiz: QuizSession) => {
    console.log('Starting quiz:', quiz.title);
    setLoading(true);
    try {
      const quizData = await loadQuizSession(quiz.id);
      if (quizData) {
        setCurrentQuiz(quizData);
        setSessionId(quiz.id);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      alert('Eroare la încărcarea quiz-ului');
    } finally {
      setLoading(false);
    }
  };

  const getSessionIcon = (quiz: QuizSession) => {
    if (quiz.is_completed) {
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    }
    return <PlayCircle className="h-5 w-5 text-blue-400" />;
  };

  const getSessionStatus = (quiz: QuizSession) => {
    if (quiz.is_completed) {
      return `Finalizat - ${quiz.score ? Math.round(quiz.score) + '%' : 'N/A'}`;
    }
    return 'Disponibil';
  };

  // Filter to show only the first 6 generated subject quizzes
  const subjectQuizzes = availableQuizzes
    .filter(session => session.title.startsWith('Subiect'))
    .slice(0, 6);

  if (currentQuiz) {
    return (
      <Quiz
        quizData={currentQuiz}
        sessionId={sessionId || undefined}
        onComplete={handleQuizComplete}
      />
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
              Îmbunătățește-ți cunoștințele prin quiz-uri interactive!
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {session ? (
              <Button
                onClick={() => navigate('/profile')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <User className="h-4 w-4 mr-2" />
                Profil
              </Button>
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

        {/* Generated Subject Quizzes */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-8">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Teste de Admitere</h2>
            <p className="text-blue-200">
              6 teste complete pentru pregătirea admiterii la medicină
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-blue-200 mt-4">Se încarcă testele...</p>
            </div>
          ) : subjectQuizzes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjectQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                  onClick={() => startQuiz(quiz)}
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      {getSessionIcon(quiz)}
                    </div>
                    <h4 className="text-white font-bold text-xl mb-2">{quiz.title}</h4>
                    <p className="text-purple-200 text-lg font-medium mb-2">
                      50 întrebări
                    </p>
                    <p className="text-blue-200 text-sm mb-4">
                      {getSessionStatus(quiz)}
                    </p>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    >
                      {quiz.is_completed ? 'Reîncercare' : 'Începe Testul'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-blue-200">
                {session 
                  ? 'Nu există teste generate încă. Contactează administratorul pentru a genera testele.' 
                  : 'Conectează-te pentru a accesa testele de admitere.'}
              </p>
            </div>
          )}
        </div>

        {/* About Platform Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            De ce să alegi Quiz Academy?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Teste Complete</h4>
              <p className="text-blue-200 text-sm">
                6 teste cu câte 50 de întrebări fiecare, special create pentru admiterea la medicină
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Explicații Detaliate</h4>
              <p className="text-blue-200 text-sm">
                Fiecare întrebare vine cu explicații complete și referințe din manualele de specialitate
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Progres Salvat</h4>
              <p className="text-blue-200 text-sm">
                Progresul tău este salvat automat și poți accesa testele de pe orice dispozitiv
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Simulare Reală</h4>
              <p className="text-blue-200 text-sm">
                Testele simulează condițiile reale de examen pentru o pregătire optimă
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Evaluare Precisă</h4>
              <p className="text-blue-200 text-sm">
                Sistem de scoring precis care îți arată punctele forte și cele ce necesită îmbunătățire
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Acces Nelimitat</h4>
              <p className="text-blue-200 text-sm">
                Poți relua testele oricând pentru a-ți consolida cunoștințele și a obține scoruri mai bune
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action for Non-logged Users */}
        {!session && (
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-3xl p-8 border border-cyan-400/30">
              <h3 className="text-2xl font-bold text-white mb-4">
                Începe pregătirea pentru admiterea la medicină!
              </h3>
              <p className="text-blue-200 mb-6">
                Conectează-te pentru a accesa testele complete și a-ți urmări progresul.
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
      </div>
    </div>
  );
}
