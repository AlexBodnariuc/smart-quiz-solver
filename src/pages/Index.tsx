
import { useState } from 'react';
import { QuizLoader } from '@/components/QuizLoader';
import { Quiz } from '@/components/Quiz';

export interface QuizData {
  id: string;
  title: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  variants: string[];
  correctAnswer: number;
  passage?: string;
  explanation: string;
}

const Index = () => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isQuizStarted, setIsQuizStarted] = useState(false);

  const handleQuizLoad = (data: QuizData) => {
    setQuizData(data);
  };

  const handleStartQuiz = () => {
    setIsQuizStarted(true);
  };

  const handleQuizComplete = () => {
    setIsQuizStarted(false);
    setQuizData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {!quizData ? (
        <QuizLoader onQuizLoad={handleQuizLoad} />
      ) : !isQuizStarted ? (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h1 className="text-4xl font-bold text-white mb-4">{quizData.title}</h1>
              <p className="text-blue-100 text-lg mb-8">
                Pregătește-te să îți testezi cunoștințele cu {quizData.questions.length} întrebări
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleStartQuiz}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Începe Quiz-ul
                </button>
                <button
                  onClick={() => setQuizData(null)}
                  className="bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/30 transition-all duration-300 border border-white/30"
                >
                  Încarcă Alt Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Quiz quizData={quizData} onComplete={handleQuizComplete} />
      )}
    </div>
  );
};

export default Index;
