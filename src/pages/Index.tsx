
import { useState } from 'react';
import { QuizLoader } from '@/components/QuizLoader';
import { Quiz } from '@/components/Quiz';
import { Profile } from './Profile';

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

type AppState = 'loader' | 'preview' | 'quiz' | 'profile';

const Index = () => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);
  const [appState, setAppState] = useState<AppState>('loader');

  const handleQuizLoad = (data: QuizData, sessionId?: string) => {
    console.log('Quiz loaded successfully:', data);
    console.log('Session ID:', sessionId);
    console.log('Number of questions:', data.questions.length);
    setQuizData(data);
    setCurrentSessionId(sessionId);
    setAppState('preview');
  };

  const handleStartQuiz = () => {
    console.log('Starting quiz:', quizData?.title);
    console.log('Session ID:', currentSessionId);
    if (!quizData) {
      console.error('No quiz data available to start');
      return;
    }
    setAppState('quiz');
  };

  const handleQuizComplete = () => {
    console.log('Quiz completed');
    setAppState('loader');
    setQuizData(null);
    setCurrentSessionId(undefined);
  };

  const handleLoadNewQuiz = () => {
    console.log('Loading new quiz');
    setQuizData(null);
    setCurrentSessionId(undefined);
    setAppState('loader');
  };

  const handleShowProfile = () => {
    setAppState('profile');
  };

  const handleBackFromProfile = () => {
    if (quizData) {
      setAppState('preview');
    } else {
      setAppState('loader');
    }
  };

  return (
    <>
      {appState === 'loader' && (
        <QuizLoader onQuizLoad={handleQuizLoad} onShowProfile={handleShowProfile} />
      )}
      
      {appState === 'preview' && quizData && (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h1 className="text-4xl font-bold text-white mb-4">{quizData.title}</h1>
              <p className="text-blue-100 text-lg mb-8">
                Pregătește-te să îți testezi cunoștințele cu {quizData.questions.length} întrebări
              </p>
              {currentSessionId && (
                <p className="text-cyan-300 text-sm mb-6">
                  ☁️ Quiz salvat în cloud - progresul va fi sincronizat
                </p>
              )}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleStartQuiz}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Începe Quiz-ul
                </button>
                <button
                  onClick={handleLoadNewQuiz}
                  className="bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/30 transition-all duration-300 border border-white/30"
                >
                  Încarcă Alt Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {appState === 'quiz' && quizData && (
        <Quiz quizData={quizData} sessionId={currentSessionId} onComplete={handleQuizComplete} />
      )}
      
      {appState === 'profile' && (
        <Profile onBack={handleBackFromProfile} />
      )}
    </>
  );
};

export default Index;
