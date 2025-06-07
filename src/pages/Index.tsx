
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz } from '@/components/Quiz';
import { useQuizStorage } from '@/hooks/useQuizStorage';
import { useEmailAuth } from '@/components/auth/EmailAuthProvider';
import { Button } from '@/components/ui/button';
import { User, Trophy, PlayCircle, CheckCircle, Clock, Plus, Upload, Shuffle } from 'lucide-react';
import { parseQuizJSON } from '@/utils/csvParser';

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
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const navigate = useNavigate();
  const { session } = useEmailAuth();
  const { getUserQuizSessions, loadQuizSession, saveQuizSession, getAllQuestionsFromDatabase, deleteSubjectQuizzes } = useQuizStorage();

  const quizTitle = "Medmentor, ajutorul tau AI pentru admitere";

  useEffect(() => {
    loadAvailableQuizzes();
    loadAllQuestionsFromDatabase();
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

  const loadAllQuestionsFromDatabase = async () => {
    try {
      const questionsFromDatabase = await getAllQuestionsFromDatabase();
      setAllQuestions(questionsFromDatabase);
    } catch (error) {
      console.error('Error loading questions from database:', error);
      
      // Fallback to localStorage if database fails
      const storedQuestions = localStorage.getItem('quizQuestions');
      if (storedQuestions) {
        try {
          const questionData = JSON.parse(storedQuestions);
          const quizData = parseQuizJSON(questionData, quizTitle);
          setAllQuestions(quizData.questions);
        } catch (parseError) {
          console.error('Error parsing localStorage questions:', parseError);
        }
      }
    }
  };

  // Enhanced quiz generation algorithm using the ENTIRE question corpus
  const generateDiverseQuizzes = async (count: number = 6) => {
    setIsGenerating(true);
    
    try {
      if (allQuestions.length === 0) {
        alert('Nu există întrebări disponibile pentru a genera quiz-uri.');
        return;
      }

      // Filter out questions with no variants
      const validQuestions = allQuestions.filter(
        question => question.variants && question.variants.length > 0
      );

      if (validQuestions.length < 150) {
        alert(`Nu există suficiente întrebări valide. Sunt disponibile ${validQuestions.length}, dar sunt necesare cel puțin 150 pentru a genera 6 teste.`);
        return;
      }

      console.log(`Generating ${count} diverse quizzes from ${validQuestions.length} total available questions`);

      // Delete existing subject quizzes first (if any)
      await deleteSubjectQuizzes();

      // Create a master pool of all unique questions
      const masterQuestionPool = [...validQuestions];
      console.log(`Master question pool contains ${masterQuestionPool.length} questions`);
      
      // Generate exactly 6 quizzes with maximum diversity possible
      for (let i = 0; i < count; i++) {
        // Create a deep shuffle of the entire pool for each quiz
        const shuffledPool = [...masterQuestionPool]
          .sort(() => Math.random() - 0.5)
          .sort(() => Math.random() - 0.5); // Double shuffle for better randomization
        
        // Take exactly 50 questions using different starting points for each quiz
        const quizQuestions: Question[] = [];
        const questionsNeeded = Math.min(50, shuffledPool.length);
        
        // Use different starting points and step sizes for each quiz to maximize diversity
        const startOffset = i * Math.floor(shuffledPool.length / count);
        const stepSize = Math.max(1, Math.floor(shuffledPool.length / questionsNeeded));
        
        for (let j = 0; j < questionsNeeded; j++) {
          const index = (startOffset + j * stepSize) % shuffledPool.length;
          if (shuffledPool[index] && !quizQuestions.find(q => q.text === shuffledPool[index].text)) {
            quizQuestions.push(shuffledPool[index]);
          }
        }
        
        // If we don't have enough unique questions, fill with random questions from the pool
        while (quizQuestions.length < questionsNeeded) {
          const randomQuestion = shuffledPool[Math.floor(Math.random() * shuffledPool.length)];
          if (!quizQuestions.find(q => q.text === randomQuestion.text)) {
            quizQuestions.push(randomQuestion);
          } else {
            // If we've exhausted unique questions, allow some overlap
            quizQuestions.push(randomQuestion);
          }
          
          // Safety break to prevent infinite loop
          if (quizQuestions.length >= questionsNeeded) break;
        }

        // Final shuffle of the selected questions
        const finalQuestions = quizQuestions.sort(() => Math.random() - 0.5);
        
        const subjectNumber = i + 1;
        
        const quizData: QuizData = {
          id: `quiz-subiect-${subjectNumber}-${Date.now()}`,
          title: `Subiect ${subjectNumber}`,
          questions: finalQuestions
        };

        try {
          await saveQuizSession(quizData);
          console.log(`Generated Subiect ${subjectNumber} with ${finalQuestions.length} questions`);
        } catch (error) {
          console.error(`Error generating Subiect ${subjectNumber}:`, error);
        }
      }

      // Refresh the sessions list
      await loadAvailableQuizzes();
      
      alert(`S-au generat ${count} quiz-uri noi cu câte ${Math.min(50, validQuestions.length)} de întrebări!`);
    } catch (error) {
      console.error('Error generating quizzes:', error);
      alert('Eroare la generarea quiz-urilor.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateFromStorage = () => {
    setLoading(true);
    
    setTimeout(() => {
      const storedQuestions = localStorage.getItem('quizQuestions');
      
      if (storedQuestions) {
        try {
          const questionData = JSON.parse(storedQuestions);
          const quizData = parseQuizJSON(questionData, quizTitle);
          
          // Save to server
          saveQuizSession(quizData).then((sessionId) => {
            console.log('Quiz saved to server with session ID:', sessionId);
            setCurrentQuiz(quizData);
            setSessionId(sessionId);
            loadAvailableQuizzes(); // Refresh the sessions list
          }).catch((error) => {
            console.error('Error saving quiz to server:', error);
            // Fallback to local storage
            setCurrentQuiz(quizData);
          });
        } catch (error) {
          console.error('Error parsing stored questions:', error);
          const emptyQuiz: QuizData = {
            id: `quiz-${Date.now()}`,
            title: quizTitle,
            questions: []
          };
          setCurrentQuiz(emptyQuiz);
        }
      } else {
        const emptyQuiz: QuizData = {
          id: `quiz-${Date.now()}`,
          title: quizTitle,
          questions: []
        };
        console.log('No stored questions found, creating empty quiz');
        setCurrentQuiz(emptyQuiz);
      }
      
      setLoading(false);
    }, 1000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      alert('Vă rugăm să selectați un fișier JSON valid.');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const questionData = JSON.parse(content);
        const quizData = parseQuizJSON(questionData, `Quiz din ${file.name}`);
        
        console.log(`Uploading ${quizData.questions.length} questions from ${file.name}`);
        
        // Save to server
        const sessionId = await saveQuizSession(quizData);
        console.log('Quiz saved to server with session ID:', sessionId);
        
        // Refresh sessions and reload all questions
        await loadAvailableQuizzes();
        await loadAllQuestionsFromDatabase();
        
        alert(`S-au încărcat ${quizData.questions.length} întrebări din fișierul ${file.name}!`);
        
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Eroare la parsarea fișierului JSON. Vă rugăm să verificați formatul.');
      } finally {
        setLoading(false);
        // Reset the input
        event.target.value = '';
      }
    };
    
    reader.readAsText(file);
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

        {/* Show available tests if any exist */}
        {subjectQuizzes.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-8">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Teste de Admitere</h2>
              <p className="text-blue-200">
                {subjectQuizzes.length} teste complete pentru pregătirea admiterii la medicină
              </p>
            </div>

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
          </div>
        )}

        {/* No tests available - show creation options */}
        {subjectQuizzes.length === 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-8">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Bine ai venit!</h2>
              <p className="text-blue-200">
                {session 
                  ? 'Nu există teste disponibile încă. Creează primele tale teste pentru a începe!' 
                  : 'Conectează-te pentru a accesa și crea teste de admitere.'}
              </p>
            </div>

            {session && (
              <div className="space-y-6">
                {/* Generate Tests Button - Show if we have enough questions */}
                {allQuestions.length >= 150 && (
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-4">Generează Teste Automat</h3>
                      <p className="text-green-100 text-sm mb-6">
                        Generează 6 teste diverse cu câte 50 de întrebări din baza de date existentă!
                      </p>
                      <Button
                        onClick={() => generateDiverseQuizzes(6)}
                        disabled={isGenerating || loading}
                        className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 text-lg hover:from-green-600 hover:to-blue-700 transform hover:scale-105"
                      >
                        <Shuffle className="h-5 w-5 mr-2" />
                        {isGenerating ? 'Se generează...' : 'Generează 6 Teste Acum!'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Load New Questions Section */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-4">Încarcă Întrebări Noi</h3>
                    <Button
                      onClick={() => setShowCreateOptions(!showCreateOptions)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 mb-4"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      {showCreateOptions ? 'Ascunde Opțiuni' : 'Adaugă Întrebări'}
                    </Button>
                    
                    {showCreateOptions && (
                      <div className="space-y-4">
                        <div className="relative">
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={loading}
                          />
                          <Button
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                          >
                            <Upload className="h-5 w-5 mr-2" />
                            Încarcă Fișier JSON cu Întrebări
                          </Button>
                        </div>

                        <Button
                          onClick={handleCreateFromStorage}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 disabled:opacity-50"
                        >
                          {loading ? 'Se încarcă...' : 'Creează din localStorage'}
                        </Button>
                        
                        <p className="text-blue-200 text-sm">
                          Selectează un fișier JSON cu întrebări noi sau creează un quiz din datele salvate local
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
                Teste cu câte 50 de întrebări fiecare, special create pentru admiterea la medicină
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
