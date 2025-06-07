
import { useState, useEffect } from 'react';
import { QuizData, Question } from '@/pages/Index';
import { QuestionCard } from './QuestionCard';
import { QuizResults } from './QuizResults';
import { InlineAIChat } from './InlineAIChat';
import { ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { ProcessedChunk } from '@/utils/csvParser';
import { useQuizStorage } from '@/hooks/useQuizStorage';

interface QuizProps {
  quizData: QuizData;
  sessionId?: string;
  onComplete: () => void;
}

export interface Answer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  skipped?: boolean;
}

export const Quiz = ({ quizData, sessionId, onComplete }: QuizProps) => {
  // Filter out questions with no variants or empty variants
  const validQuestions = quizData.questions.filter(
    question => question.variants && question.variants.length > 0
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { saveQuizProgress, completeQuizSession } = useQuizStorage();

  const currentQuestion = validQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === validQuestions.length - 1;
  const hasAnswered = answers.some(a => a.questionId === currentQuestion.id);

  // Auto-save progress when answers change
  useEffect(() => {
    if (sessionId && answers.length > 0) {
      saveQuizProgress(sessionId, currentQuestionIndex, answers).catch((error) => {
        console.error('Error saving progress:', error);
      });
    }
  }, [answers, currentQuestionIndex, sessionId]);

  const handleAnswer = (selectedAnswer: number) => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      skipped: false
    };

    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== currentQuestion.id);
      return [...filtered, newAnswer];
    });
  };

  const handleSkip = () => {
    const skipAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer: -1, // Use -1 to indicate skipped
      isCorrect: false,
      skipped: true
    };

    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== currentQuestion.id);
      return [...filtered, skipAnswer];
    });

    // Automatically move to next question after skipping
    if (isLastQuestion) {
      handleComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleComplete = async () => {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalQuestions = validQuestions.length;
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    console.log('Quiz completed:', {
      correctAnswers,
      totalQuestions,
      score,
      sessionId
    });

    // Complete the quiz in database
    if (sessionId) {
      try {
        await completeQuizSession(sessionId, answers, score);
      } catch (error) {
        console.error('Error completing quiz session:', error);
      }
    }

    setShowResults(true);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      await handleComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const getSelectedAnswer = () => {
    return answers.find(a => a.questionId === currentQuestion.id)?.selectedAnswer;
  };

  // Show error if no valid questions
  if (validQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <h1 className="text-4xl font-bold text-white mb-4">Nu există întrebări valide</h1>
            <p className="text-red-300 text-lg mb-8">
              Acest quiz nu conține întrebări cu variante de răspuns valide.
            </p>
            <button
              onClick={onComplete}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
            >
              Întoarce-te la Lista de Quiz-uri
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return <QuizResults quizData={{...quizData, questions: validQuestions}} answers={answers} onRestart={onComplete} />;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">{quizData.title}</h1>
            <div className="text-blue-100">
              Întrebarea {currentQuestionIndex + 1} din {validQuestions.length}
              {sessionId && (
                <div className="text-xs text-cyan-300 mt-1">
                  ☁️ Progresul este salvat automat
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / validQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-2">
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={getSelectedAnswer()}
              onAnswer={handleAnswer}
              hasAnswered={hasAnswered}
              questionNumber={currentQuestionIndex + 1}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/30"
              >
                <ChevronLeft className="h-5 w-5" />
                Înapoi
              </button>

              <div className="flex items-center gap-3">
                {/* Skip Button */}
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500/20 text-yellow-300 rounded-xl font-semibold hover:bg-yellow-500/30 transition-all duration-300 border border-yellow-400/30"
                >
                  <SkipForward className="h-5 w-5" />
                  Sari
                </button>

                <button
                  onClick={handleNext}
                  disabled={!hasAnswered}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isLastQuestion ? 'Finalizează' : 'Următoarea'}
                  {!isLastQuestion && <ChevronRight className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* AI Chat Component */}
            <InlineAIChat question={currentQuestion} hasAnswered={hasAnswered} />
          </div>

          {/* Sidebar - Only Question Overview */}
          <div className="space-y-6">
            {/* Question Overview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4">Progres Quiz</h3>
              <div className="grid grid-cols-5 gap-2">
                {validQuestions.map((question, index) => {
                  const answer = answers.find(a => a.questionId === question.id);
                  const isCurrent = index === currentQuestionIndex;
                  
                  let bgColor = 'bg-white/20 text-blue-100'; // default - not answered
                  
                  if (answer) {
                    if (answer.skipped) {
                      bgColor = 'bg-yellow-500 text-white'; // skipped
                    } else if (answer.isCorrect) {
                      bgColor = 'bg-green-500 text-white'; // correct
                    } else {
                      bgColor = 'bg-red-500 text-white'; // incorrect
                    }
                  }
                  
                  if (isCurrent) {
                    bgColor = 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'; // current question
                  }
                  
                  return (
                    <div
                      key={index}
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-300
                        ${bgColor}
                      `}
                    >
                      {index + 1}
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-green-300">Corect</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-red-300">Incorect</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-yellow-300">Sărit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white/20 rounded"></div>
                  <span className="text-blue-100">Nerăspuns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
