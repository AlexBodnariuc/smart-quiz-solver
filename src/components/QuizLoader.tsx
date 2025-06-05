
import { useState } from 'react';
import { Brain, Upload } from 'lucide-react';
import { QuizData } from '@/pages/Index';
import { parseQuizJSON } from '@/utils/csvParser';

interface QuizLoaderProps {
  onQuizLoad: (data: QuizData) => void;
}

export const QuizLoader = ({ onQuizLoad }: QuizLoaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

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

  // Handle JSON file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        console.log('Uploaded JSON data:', jsonData);
        
        // Store in localStorage (simulating database save)
        localStorage.setItem('quizQuestions', JSON.stringify(jsonData));
        console.log('Questions saved to storage');
        
        // Parse and load the quiz
        const quizData = parseQuizJSON(jsonData, quizTitle);
        console.log('Parsed quiz data:', quizData);
        onQuizLoad(quizData);
        setShowUpload(false);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Eroare la citirea fișierului JSON. Verificați formatul.');
      }
    };
    reader.readAsText(file);
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
              <p className="text-white mb-4">Nu există întrebări în baza de date. Încărcați un fișier JSON cu întrebări.</p>
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Upload className="h-6 w-6" />
                Încarcă Întrebări JSON
              </button>
            </div>
          )}
        </div>

        {/* Upload Section */}
        {showUpload && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center mb-6">
            <div className="mb-4">
              <label htmlFor="json-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-white/30 rounded-xl p-8 hover:border-white/50 transition-colors">
                  <Upload className="h-12 w-12 text-white mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">Selectează fișierul JSON cu întrebările</p>
                  <p className="text-blue-200 text-sm">Fișierul trebuie să conțină un array de obiecte cu întrebări</p>
                </div>
                <input
                  id="json-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

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
