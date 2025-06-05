
import { useState } from 'react';
import { Brain } from 'lucide-react';
import { QuizData } from '@/pages/Index';

interface QuizLoaderProps {
  onQuizLoad: (data: QuizData) => void;
}

export const QuizLoader = ({ onQuizLoad }: QuizLoaderProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Fixed quiz title
  const quizTitle = "Medmentor, ajutorul tau AI pentru admitere";

  // Mock function to simulate loading quiz from database
  const loadQuizFromDatabase = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // For now, create a sample quiz structure
      // In a real implementation, this would fetch from your database
      const mockQuizData: QuizData = {
        id: `quiz-${Date.now()}`,
        title: quizTitle,
        questions: []
      };
      
      console.log('Loading quiz from database:', mockQuizData);
      onQuizLoad(mockQuizData);
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

        {/* Load Quiz Button */}
        <div className="text-center mb-6">
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
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center mb-6">
            <p className="text-white">Se încarcă întrebările din baza de date...</p>
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
