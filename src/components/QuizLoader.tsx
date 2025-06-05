
import { useState, useEffect } from 'react';
import { Brain, Plus, PlayCircle, Clock, CheckCircle, Upload } from 'lucide-react';
import { QuizData } from '@/pages/Index';
import { parseQuizJSON } from '@/utils/csvParser';
import { useQuizStorage } from '@/hooks/useQuizStorage';

interface QuizLoaderProps {
  onQuizLoad: (data: QuizData, sessionId?: string) => void;
}

interface QuizSession {
  id: string;
  title: string;
  total_questions: number;
  current_question_index: number;
  is_completed: boolean;
  score?: number;
  created_at: string;
  updated_at: string;
}

export const QuizLoader = ({ onQuizLoad }: QuizLoaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const { getUserQuizSessions, loadQuizSession, saveQuizSession, loading: storageLoading } = useQuizStorage();

  const quizTitle = "Medmentor, ajutorul tau AI pentru admitere";

  useEffect(() => {
    loadUserSessions();
  }, []);

  const loadUserSessions = async () => {
    const userSessions = await getUserQuizSessions();
    setSessions(userSessions);
  };

  const handleCreateFromStorage = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const storedQuestions = localStorage.getItem('quizQuestions');
      
      if (storedQuestions) {
        try {
          const questionData = JSON.parse(storedQuestions);
          const quizData = parseQuizJSON(questionData, quizTitle);
          
          // Save to server
          saveQuizSession(quizData).then((sessionId) => {
            console.log('Quiz saved to server with session ID:', sessionId);
            onQuizLoad(quizData, sessionId);
            loadUserSessions(); // Refresh the sessions list
          }).catch((error) => {
            console.error('Error saving quiz to server:', error);
            // Fallback to local storage
            onQuizLoad(quizData);
          });
        } catch (error) {
          console.error('Error parsing stored questions:', error);
          const emptyQuiz: QuizData = {
            id: `quiz-${Date.now()}`,
            title: quizTitle,
            questions: []
          };
          onQuizLoad(emptyQuiz);
        }
      } else {
        const emptyQuiz: QuizData = {
          id: `quiz-${Date.now()}`,
          title: quizTitle,
          questions: []
        };
        console.log('No stored questions found, creating empty quiz');
        onQuizLoad(emptyQuiz);
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      alert('Vă rugăm să selectați un fișier JSON valid.');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const questionData = JSON.parse(content);
        const quizData = parseQuizJSON(questionData, `Quiz din ${file.name}`);
        
        // Save to server
        saveQuizSession(quizData).then((sessionId) => {
          console.log('Quiz saved to server with session ID:', sessionId);
          onQuizLoad(quizData, sessionId);
          loadUserSessions(); // Refresh the sessions list
        }).catch((error) => {
          console.error('Error saving quiz to server:', error);
          // Fallback to local storage
          onQuizLoad(quizData);
        });
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Eroare la parsarea fișierului JSON. Vă rugăm să verificați formatul.');
      } finally {
        setIsLoading(false);
        // Reset the input
        event.target.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const handleLoadSession = async (session: QuizSession) => {
    setIsLoading(true);
    try {
      const quizData = await loadQuizSession(session.id);
      if (quizData) {
        onQuizLoad(quizData, session.id);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasStoredQuestions = () => {
    const stored = localStorage.getItem('quizQuestions');
    return stored && JSON.parse(stored).length > 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionIcon = (session: QuizSession) => {
    if (session.is_completed) {
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    }
    if (session.current_question_index > 0) {
      return <Clock className="h-5 w-5 text-yellow-400" />;
    }
    return <PlayCircle className="h-5 w-5 text-blue-400" />;
  };

  const getSessionStatus = (session: QuizSession) => {
    if (session.is_completed) {
      return `Finalizat - ${session.score ? Math.round(session.score) + '%' : 'N/A'}`;
    }
    if (session.current_question_index > 0) {
      return `În progres - ${session.current_question_index + 1}/${session.total_questions}`;
    }
    return 'Nou';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 rounded-2xl">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            {quizTitle}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Bun venit! Accesează quiz-urile salvate sau creează unul nou.
          </p>
        </div>

        {/* Quiz Sessions List - Now prominently displayed at top */}
        {sessions.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Quiz-uri Disponibile</h2>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                  onClick={() => handleLoadSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getSessionIcon(session)}
                      <div>
                        <h4 className="text-white font-semibold text-lg">{session.title}</h4>
                        <p className="text-blue-200 text-sm">
                          {getSessionStatus(session)} • {formatDate(session.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-300 font-medium">
                        {session.total_questions} întrebări
                      </p>
                      {session.is_completed && session.score && (
                        <p className="text-green-300 text-sm">
                          Scor: {Math.round(session.score)}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create New Quiz Section - Now less prominent at bottom */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-6">
          <div className="text-center">
            <button
              onClick={() => setShowCreateOptions(!showCreateOptions)}
              className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <Plus className="h-5 w-5" />
              Creează Quiz Nou
            </button>
            
            {showCreateOptions && (
              <div className="mt-6 space-y-4">
                {hasStoredQuestions() && (
                  <button
                    onClick={handleCreateFromStorage}
                    disabled={isLoading || storageLoading}
                    className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading || storageLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Se creează quiz-ul...
                      </div>
                    ) : (
                      'Folosește Quiz-ul Implicit'
                    )}
                  </button>
                )}
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading || storageLoading}
                  />
                  <button
                    disabled={isLoading || storageLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    Încarcă Fișier JSON
                  </button>
                </div>
                
                <p className="text-blue-200 text-sm">
                  Selectează un fișier JSON cu întrebări pentru a crea un quiz personalizat
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">Despre Platformă:</h3>
          <div className="text-blue-100 space-y-2">
            <p>• Quiz-uri personalizate pentru admiterea la medicină</p>
            <p>• Progresul este salvat automat în cloud</p>
            <p>• Accesează quiz-urile de pe orice dispozitiv</p>
            <p>• Explicații detaliate pentru fiecare răspuns</p>
            <p>• Fragmente relevante din cărțile de referință</p>
          </div>
        </div>
      </div>
    </div>
  );
};
