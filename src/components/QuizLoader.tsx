
import { useState, useEffect } from 'react';
import { Brain, Plus, PlayCircle, Clock, CheckCircle, Upload, Shuffle, RefreshCw, Trash2 } from 'lucide-react';
import { QuizData, Question } from '@/pages/Index';
import { parseQuizJSON } from '@/utils/csvParser';
import { useQuizStorage } from '@/hooks/useQuizStorage';

interface QuizLoaderProps {
  onQuizLoad: (data: QuizData, sessionId?: string) => void;
  onShowProfile: () => void;
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

export const QuizLoader = ({ onQuizLoad, onShowProfile }: QuizLoaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeduplicating, setIsDeduplicating] = useState(false);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [totalQuestionCount, setTotalQuestionCount] = useState(0);
  const { 
    getUserQuizSessions, 
    loadQuizSession, 
    saveQuizSession, 
    getAllQuestionsFromDatabase,
    getTotalQuestionCount,
    deleteSubjectQuizzes,
    deduplicateQuestions,
    loading: storageLoading 
  } = useQuizStorage();

  const quizTitle = "Medmentor, ajutorul tau AI pentru admitere";

  useEffect(() => {
    loadUserSessions();
    loadAllQuestionsFromDatabase();
    loadTotalQuestionCount();
  }, []);

  const loadUserSessions = async () => {
    console.log('Loading user sessions...');
    const userSessions = await getUserQuizSessions();
    console.log('Sessions loaded:', userSessions.length);
    setSessions(userSessions);
  };

  const loadTotalQuestionCount = async () => {
    const count = await getTotalQuestionCount();
    console.log('Total question count:', count);
    setTotalQuestionCount(count);
  };

  const loadAllQuestionsFromDatabase = async () => {
    console.log('Loading ALL questions from database...');
    
    try {
      const questionsFromDatabase = await getAllQuestionsFromDatabase();
      console.log(`Loaded ${questionsFromDatabase.length} unique questions from database`);
      setAllQuestions(questionsFromDatabase);

      // If no questions in database, try localStorage as fallback
      if (questionsFromDatabase.length === 0) {
        console.log('No questions in database, checking localStorage...');
        const storedQuestions = localStorage.getItem('quizQuestions');
        if (storedQuestions) {
          try {
            const questionData = JSON.parse(storedQuestions);
            const quizData = parseQuizJSON(questionData, quizTitle);
            setAllQuestions(quizData.questions);
            console.log(`Fallback: Loaded ${quizData.questions.length} questions from localStorage`);
          } catch (parseError) {
            console.error('Error parsing localStorage questions:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Error loading questions from database:', error);
    }
  };

  const generateDiverseQuizzes = async (count: number = 6, questionsToUse?: Question[]) => {
    setIsGenerating(true);
    
    try {
      const questionsSource = questionsToUse || allQuestions;
      
      if (questionsSource.length === 0) {
        alert('Nu există întrebări disponibile pentru a genera quiz-uri. Vă rugăm să încărcați un fișier JSON cu întrebări.');
        return;
      }

      const validQuestions = questionsSource.filter(
        question => question.variants && question.variants.length > 0
      );

      const questionsPerQuiz = Math.min(50, Math.floor(validQuestions.length / count));
      
      if (questionsPerQuiz < 10) {
        alert(`Nu există suficiente întrebări valide. Sunt disponibile ${validQuestions.length}, dar sunt necesare cel puțin ${count * 10} pentru a genera ${count} teste cu câte 10 întrebări.`);
        return;
      }

      console.log(`Generating ${count} diverse quizzes from ${validQuestions.length} total available questions`);

      // Delete existing subject quizzes first
      await deleteSubjectQuizzes();

      for (let i = 0; i < count; i++) {
        // Shuffle and select questions for this quiz
        const shuffledQuestions = [...validQuestions].sort(() => Math.random() - 0.5);
        const startIndex = i * questionsPerQuiz;
        const quizQuestions = shuffledQuestions.slice(startIndex, startIndex + questionsPerQuiz);
        
        const subjectNumber = i + 1;
        
        const quizData: QuizData = {
          id: `quiz-subiect-${subjectNumber}-${Date.now()}`,
          title: `Subiect ${subjectNumber}`,
          questions: quizQuestions
        };

        try {
          await saveQuizSession(quizData);
          console.log(`Generated Subiect ${subjectNumber} with ${quizQuestions.length} questions`);
        } catch (error) {
          console.error(`Error generating Subiect ${subjectNumber}:`, error);
        }
      }

      await loadUserSessions();
      await loadTotalQuestionCount();
      
      alert(`S-au generat ${count} quiz-uri noi cu câte ${questionsPerQuiz} întrebări!`);
    } catch (error) {
      console.error('Error generating quizzes:', error);
      alert('Eroare la generarea quiz-urilor.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeduplication = async () => {
    setIsDeduplicating(true);
    try {
      await deduplicateQuestions();
      await loadAllQuestionsFromDatabase();
      await loadTotalQuestionCount();
      await loadUserSessions();
      alert('Deduplicarea a fost finalizată cu succes!');
    } catch (error) {
      console.error('Error during deduplication:', error);
      alert('Eroare la deduplicarea întrebărilor.');
    } finally {
      setIsDeduplicating(false);
    }
  };

  const handleCreateFromStorage = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const storedQuestions = localStorage.getItem('quizQuestions');
      
      if (storedQuestions) {
        try {
          const questionData = JSON.parse(storedQuestions);
          const quizData = parseQuizJSON(questionData, quizTitle);
          
          saveQuizSession(quizData).then((sessionId) => {
            console.log('Quiz saved to server with session ID:', sessionId);
            onQuizLoad(quizData, sessionId);
            loadUserSessions();
          }).catch((error) => {
            console.error('Error saving quiz to server:', error);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      alert('Vă rugăm să selectați un fișier JSON valid.');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const questionData = JSON.parse(content);
        const quizData = parseQuizJSON(questionData, `Quiz din ${file.name}`);
        
        console.log(`Uploading ${quizData.questions.length} questions from ${file.name}`);
        
        const sessionId = await saveQuizSession(quizData);
        console.log('Quiz saved to server with session ID:', sessionId);
        
        await loadUserSessions();
        await loadAllQuestionsFromDatabase();
        await loadTotalQuestionCount();
        
        alert(`S-au încărcat ${quizData.questions.length} întrebări din fișierul ${file.name}!`);
        
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Eroare la parsarea fișierului JSON. Vă rugăm să verificați formatul.');
      } finally {
        setIsLoading(false);
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

  const subjectQuizzes = sessions
    .filter(session => session.title.startsWith('Subiect'))
    .slice(0, 6);
  const uploadedQuizzes = sessions.filter(session => !session.title.startsWith('Subiect'));

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
            Platforma ta pentru pregătirea admiterii la medicină
          </p>
        </div>

        {/* Loading States */}
        {isGenerating && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/30 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <h2 className="text-2xl font-bold text-white">Se generează testele...</h2>
              </div>
              <p className="text-purple-100">
                Creez teste diverse din întrebările disponibile
              </p>
            </div>
          </div>
        )}

        {isDeduplicating && (
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-6 border border-orange-400/30 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <h2 className="text-2xl font-bold text-white">Se deduplică întrebările...</h2>
              </div>
              <p className="text-orange-100">
                Eliminarea duplicatelor din baza de date pentru optimizare
              </p>
            </div>
          </div>
        )}

        {/* Database Status */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Status Bază de Date</h3>
            <p className="text-blue-100">
              {allQuestions.length > 0 
                ? `${allQuestions.length} întrebări unice disponibile în baza de date`
                : 'Nu există întrebări în baza de date - încărcați un fișier JSON pentru a începe'
              }
            </p>
            {totalQuestionCount > 0 && (
              <p className="text-cyan-300 text-sm mt-2">
                Total {totalQuestionCount} întrebări (inclusiv duplicate)
              </p>
            )}
          </div>
        </div>

        {/* Generate Tests Button - Show if we have questions */}
        {allQuestions.length >= 30 && (
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-8 border border-green-400/30 mb-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Generează Teste</h2>
              <p className="text-green-100 text-lg mb-6">
                Generează teste diverse din întrebările disponibile!
              </p>
              <button
                onClick={() => generateDiverseQuizzes(6)}
                disabled={isGenerating || storageLoading || isDeduplicating}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                <Shuffle className="h-6 w-6" />
                {isGenerating ? 'Se generează...' : 'Generează Teste Acum!'}
              </button>
            </div>
          </div>
        )}

        {/* Generated Subject Quizzes */}
        {subjectQuizzes.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Teste Generate ({subjectQuizzes.length} teste)</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjectQuizzes.map((session) => (
                <div
                  key={session.id}
                  className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-xl p-6 hover:bg-purple-500/30 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                  onClick={() => handleLoadSession(session)}
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      {getSessionIcon(session)}
                    </div>
                    <h4 className="text-white font-bold text-xl mb-2">{session.title}</h4>
                    <p className="text-purple-200 text-lg font-medium mb-2">
                      {session.total_questions} întrebări
                    </p>
                    <p className="text-blue-200 text-sm">
                      {getSessionStatus(session)}
                    </p>
                    {session.is_completed && session.score && (
                      <p className="text-green-300 text-sm mt-2">
                        Scor: {Math.round(session.score)}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Control Buttons */}
            <div className="text-center mt-8 space-y-4">
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => generateDiverseQuizzes(6)}
                  disabled={isGenerating || storageLoading || isDeduplicating}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  <RefreshCw className="h-5 w-5" />
                  {isGenerating ? 'Se regenerează...' : 'Regenerează Testele'}
                </button>
                
                <button
                  onClick={handleDeduplication}
                  disabled={isGenerating || storageLoading || isDeduplicating}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  <Trash2 className="h-5 w-5" />
                  {isDeduplicating ? 'Se deduplică...' : 'Deduplică DB'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Custom Quizzes */}
        {uploadedQuizzes.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Quiz-uri Încărcate</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {uploadedQuizzes.map((session) => (
                <div
                  key={session.id}
                  className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl p-6 hover:bg-blue-500/30 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                  onClick={() => handleLoadSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">{session.title}</h4>
                      <p className="text-blue-200 text-sm mb-2">
                        {session.total_questions} întrebări
                      </p>
                      <p className="text-cyan-200 text-xs">
                        {getSessionStatus(session)}
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      {getSessionIcon(session)}
                      <p className="text-xs text-blue-300 mt-1">
                        {formatDate(session.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Load New Questions Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Încarcă Întrebări Noi</h3>
            <button
              onClick={() => setShowCreateOptions(!showCreateOptions)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 border border-cyan-400/30"
            >
              <Plus className="h-5 w-5" />
              {showCreateOptions ? 'Ascunde Opțiuni' : 'Adaugă Întrebări'}
            </button>
            
            {showCreateOptions && (
              <div className="mt-6 space-y-4">
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
                    Încarcă Fișier JSON cu Întrebări
                  </button>
                </div>
                
                <p className="text-blue-200 text-sm">
                  Selectează un fișier JSON cu întrebări noi pentru a le adăuga la baza de date
                </p>

                {allQuestions.length === 0 && (
                  <button
                    onClick={handleCreateFromStorage}
                    disabled={isLoading || storageLoading}
                    className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="h-5 w-5" />
                    Încearcă cu Datele din LocalStorage
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Profile Button */}
        <div className="text-center">
          <button
            onClick={onShowProfile}
            className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            Vezi Profilul
          </button>
        </div>
      </div>
    </div>
  );
};
