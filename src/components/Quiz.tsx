
import { useState } from 'react';
import { QuizData, Question } from '@/pages/Index';
import { QuestionCard } from './QuestionCard';
import { QuizResults } from './QuizResults';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface QuizProps {
  quizData: QuizData;
  onComplete: () => void;
}

export interface Answer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export const Quiz = ({ quizData, onComplete }: QuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showPassage, setShowPassage] = useState(false);

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const hasAnswered = answers.some(a => a.questionId === currentQuestion.id);

  const handleAnswer = (selectedAnswer: number) => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect
    };

    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== currentQuestion.id);
      return [...filtered, newAnswer];
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowPassage(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowPassage(false);
    }
  };

  const getSelectedAnswer = () => {
    return answers.find(a => a.questionId === currentQuestion.id)?.selectedAnswer;
  };

  if (showResults) {
    return <QuizResults quizData={quizData} answers={answers} onRestart={onComplete} />;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">{quizData.title}</h1>
            <div className="text-blue-100">
              Întrebarea {currentQuestionIndex + 1} din {quizData.questions.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Passage */}
            {currentQuestion.passage && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <button
                  onClick={() => setShowPassage(!showPassage)}
                  className="flex items-center gap-2 text-white font-semibold mb-4 hover:text-cyan-300 transition-colors"
                >
                  <BookOpen className="h-5 w-5" />
                  {showPassage ? 'Ascunde' : 'Afișează'} Pasajul
                </button>
                
                {showPassage && (
                  <div className="text-blue-100 leading-relaxed">
                    {currentQuestion.passage}
                  </div>
                )}
              </div>
            )}

            {/* Question Overview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4">Progres Quiz</h3>
              <div className="grid grid-cols-5 gap-2">
                {quizData.questions.map((_, index) => {
                  const isAnswered = answers.some(a => a.questionId === quizData.questions[index].id);
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <div
                      key={index}
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-300
                        ${isCurrent 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                          : isAnswered
                          ? 'bg-green-500 text-white'
                          : 'bg-white/20 text-blue-100'
                        }
                      `}
                    >
                      {index + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
