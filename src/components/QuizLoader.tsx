
import { useState } from 'react';
import { Brain } from 'lucide-react';
import { QuizData } from '@/pages/Index';
import { parseQuizJSON } from '@/utils/csvParser';

interface QuizLoaderProps {
  onQuizLoad: (data: QuizData) => void;
}

export const QuizLoader = ({ onQuizLoad }: QuizLoaderProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Fixed quiz title
  const quizTitle = "Medmentor, ajutorul tau AI pentru admitere";

  // Check if there are stored questions in localStorage
  const hasStoredQuestions = () => {
    const stored = localStorage.getItem('quizQuestions');
    return stored && JSON.parse(stored).length > 0;
  };

  // Load quiz from localStorage (simulating database)
  const loadQuizFromDatabase = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const storedQuestions = localStorage.getItem('quizQuestions');
      
      if (storedQuestions) {
        try {
          const questionData = JSON.parse(storedQuestions);
          const quizData = parseQuizJSON(questionData, quizTitle);
          console.log('Loading quiz from storage:', quizData);
          console.log('Number of questions loaded:', quizData.questions.length);
          onQuizLoad(quizData);
        } catch (error) {
          console.error('Error parsing stored questions:', error);
          // Create empty quiz if parsing fails
          const emptyQuiz: QuizData = {
            id: `quiz-${Date.now()}`,
            title: quizTitle,
            questions: []
          };
          onQuizLoad(emptyQuiz);
        }
      } else {
        // No stored questions, create empty quiz
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
            Platforma ta AI pentru pregătirea admiterii la medicină
          </p>
        </div>

        {/* Start Quiz Button */}
        <div className="text-center mb-6">
          {hasStoredQuestions() ? (
            <button
              onClick={loadQuizFromDatabase}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Se încarcă quiz-ul...
                </>
              ) : (
                'Începe Quiz-ul'
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-white mb-4">Quiz-ul nu este disponibil momentan. Vă rugăm să contactați administratorul.</p>
              <button
                disabled
                className="inline-flex items-center gap-2 bg-gray-500 text-white px-8 py-4 rounded-xl font-semibold text-lg opacity-50 cursor-not-allowed"
              >
                Quiz indisponibil
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center mb-6">
            <p className="text-white">Se încarcă întrebările...</p>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">Despre Platformă:</h3>
          <div className="text-blue-100 space-y-2">
            <p>• Quiz-uri personalizate pentru admiterea la medicină</p>
            <p>• Explicații detaliate pentru fiecare răspuns</p>
            <p>• Fragmente relevante din cărțile de referință</p>
            <p>• Urmărirea progresului și performanței</p>
          </div>
        </div>
      </div>
    </div>
  );
};
