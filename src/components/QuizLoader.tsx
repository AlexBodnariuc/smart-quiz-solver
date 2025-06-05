
import { useState } from 'react';
import { Upload, FileText, Brain, Plus } from 'lucide-react';
import { QuizData } from '@/pages/Index';
import { parseQuizJSON } from '@/utils/csvParser';

interface QuizLoaderProps {
  onQuizLoad: (data: QuizData) => void;
}

export const QuizLoader = ({ onQuizLoad }: QuizLoaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonData, setJsonData] = useState<any[] | null>(null);
  const [quizTitle, setQuizTitle] = useState('');

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const parsedJSON = JSON.parse(text);
      
      // Validate JSON structure
      if (!Array.isArray(parsedJSON)) {
        throw new Error('JSON-ul trebuie să conțină un array de întrebări.');
      }
      
      parsedJSON.forEach((item, index) => {
        if (!item.questionId || !item.originalQuestion || !item.agentResponse) {
          throw new Error(`Întrebarea ${index + 1} nu are structura corectă (lipsesc: questionId, originalQuestion sau agentResponse).`);
        }
        
        if (!item.originalQuestion.question || !Array.isArray(item.originalQuestion.variants)) {
          throw new Error(`Întrebarea ${index + 1} nu are întrebarea sau variantele definite corect.`);
        }
        
        if (!item.agentResponse.answer || !item.agentResponse.explanation) {
          throw new Error(`Întrebarea ${index + 1} nu are răspunsul sau explicația definite în agentResponse.`);
        }
      });
      
      setJsonData(parsedJSON);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la încărcarea fișierului JSON');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.name.endsWith('.json')) {
        handleFileUpload(file);
      } else {
        setError('Te rog să încarci un fișier JSON valid.');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const createQuiz = () => {
    if (!jsonData || !quizTitle.trim()) {
      setError('Te rog să încarci fișierul JSON și să introduci titlul quiz-ului.');
      return;
    }

    try {
      const quizData = parseQuizJSON(jsonData, quizTitle.trim());
      onQuizLoad(quizData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la procesarea datelor.');
    }
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
            Platformă de
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Quiz</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Încarcă fișierul JSON cu întrebările tale pentru a crea quiz-ul
          </p>
        </div>

        {/* Quiz Title Input */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <label className="block text-white font-semibold mb-2">Titlul Quiz-ului</label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Introdu titlul quiz-ului..."
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-cyan-400 focus:bg-white/30 transition-all"
          />
        </div>

        {/* JSON Upload */}
        <div className="mb-6">
          <div
            className={`
              relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300
              ${isDragOver 
                ? 'border-cyan-400 bg-cyan-500/20' 
                : 'border-white/30 bg-white/10 hover:bg-white/20'
              }
              backdrop-blur-lg
            `}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
          >
            <input
              type="file"
              accept=".json"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 rounded-xl mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                Încarcă Fișierul JSON cu Quiz
              </h3>
              <p className="text-blue-100 text-lg mb-3">
                {jsonData ? '✓ JSON încărcat cu succes' : 'Drag & drop sau click pentru a selecta'}
              </p>
              {jsonData && (
                <div className="text-center">
                  <p className="text-green-300 text-sm font-semibold">
                    {jsonData.length} întrebări găsite
                  </p>
                  <p className="text-blue-200 text-sm mt-1">
                    Prima întrebare: "{jsonData[0]?.originalQuestion?.question?.substring(0, 50)}..."
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Quiz Button */}
        {jsonData && quizTitle.trim() && (
          <div className="text-center mb-6">
            <button
              onClick={createQuiz}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-6 w-6" />
              Creează Quiz-ul
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-white">Se procesează fișierul...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl p-6 border border-red-400/30 text-center mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Format Info */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">Format JSON Așteptat:</h3>
          <pre className="text-sm text-blue-100 bg-black/30 p-4 rounded-lg overflow-x-auto">
{`[
  {
    "questionId": "quiz-1749110512525-0",
    "originalQuestion": {
      "question": "Care dintre următoarele reprezintă formula moleculară a glucozei?",
      "variants": [
        "A) C₆H₁₂O₆",
        "B) C₆H₁₀O₅",
        "C) C₅H₁₀O₅",
        "D) C₆H₆O₆"
      ],
      "correctAnswer": null
    },
    "agentResponse": {
      "answer": "C₆H₁₂O₆",
      "explanation": "Formula moleculară a glucozei este C₆H₁₂O₆...",
      "relevantChunks": [...]
    }
  }
]`}
          </pre>
        </div>
      </div>
    </div>
  );
};
