
import { useState } from 'react';
import { Upload, FileText, Brain, Plus } from 'lucide-react';
import { QuizData } from '@/pages/Index';
import { parseCSV, mergeQuizData, CSVQuestionVariants, JSONQuestionData } from '@/utils/csvParser';

interface QuizLoaderProps {
  onQuizLoad: (data: QuizData) => void;
}

export const QuizLoader = ({ onQuizLoad }: QuizLoaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<CSVQuestionVariants[] | null>(null);
  const [jsonData, setJsonData] = useState<JSONQuestionData[] | null>(null);
  const [quizTitle, setQuizTitle] = useState('');

  const handleFileUpload = async (file: File, fileType: 'csv' | 'json') => {
    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      
      if (fileType === 'csv') {
        const parsedCSV = parseCSV(text);
        if (parsedCSV.length === 0) {
          throw new Error('Fișierul CSV nu conține date valide. Asigură-te că are cel puțin o întrebare cu 4 opțiuni.');
        }
        setCsvData(parsedCSV);
      } else {
        const parsedJSON = JSON.parse(text) as JSONQuestionData[];
        
        // Validate JSON structure
        if (!Array.isArray(parsedJSON)) {
          throw new Error('JSON-ul trebuie să conțină un array de întrebări.');
        }
        
        parsedJSON.forEach((item, index) => {
          if (!item.id || !item.text || typeof item.correctAnswer !== 'number' || !item.explanation) {
            throw new Error(`Întrebarea ${index + 1} nu are structura corectă (lipsesc: id, text, correctAnswer sau explanation).`);
          }
        });
        
        setJsonData(parsedJSON);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Eroare la încărcarea fișierului ${fileType.toUpperCase()}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.name.endsWith('.csv')) {
        handleFileUpload(file, 'csv');
      } else if (file.name.endsWith('.json')) {
        handleFileUpload(file, 'json');
      } else {
        setError('Te rog să încarci fișiere CSV sau JSON valide.');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'csv' | 'json') => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, fileType);
    }
  };

  const createQuiz = () => {
    if (!csvData || !jsonData || !quizTitle.trim()) {
      setError('Te rog să încarci ambele fișiere și să introduci titlul quiz-ului.');
      return;
    }

    try {
      const mergedData = mergeQuizData(csvData, jsonData, quizTitle.trim());
      onQuizLoad(mergedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la combinarea datelor.');
    }
  };

  const loadSampleQuiz = () => {
    const sampleQuiz: QuizData = {
      id: "sample-quiz",
      title: "Quiz Demo - Cunoștințe Generale",
      questions: [
        {
          id: "q1",
          text: "Care este capitala României?",
          variants: ["Cluj-Napoca", "București", "Iași", "Constanța"],
          correctAnswer: 1,
          passage: "România este o țară din Europa de Sud-Est, cunoscută pentru istoria sa bogată și peisajele diverse. Capitala țării este un centru important economic și cultural.",
          explanation: "București este capitala și cel mai mare oraș al României, cu o populație de aproximativ 2 milioane de locuitori în zona metropolitană."
        },
        {
          id: "q2",
          text: "În ce an a avut loc Revoluția Română?",
          variants: ["1987", "1988", "1989", "1990"],
          correctAnswer: 2,
          explanation: "Revoluția Română a avut loc în decembrie 1989, fiind evenimentul care a dus la căderea regimului comunist condus de Nicolae Ceaușescu."
        },
        {
          id: "q3",
          text: "Care este cel mai lung râu din România?",
          variants: ["Mureș", "Olt", "Dunărea", "Prut"],
          correctAnswer: 2,
          passage: "România este străbătută de numeroase râuri importante. Dunărea, care își are izvoarele în Pădurea Neagră din Germania, traversează mai multe țări europene.",
          explanation: "Dunărea este cel mai lung râu din România, cu o lungime de aproximativ 1.075 km pe teritoriul țării noastre."
        }
      ]
    };

    onQuizLoad(sampleQuiz);
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
            Încarcă fișierul CSV cu variante și JSON cu întrebările tale pentru a crea quiz-ul
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

        {/* Upload Areas */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* CSV Upload */}
          <div
            className={`
              relative border-2 border-dashed rounded-3xl p-6 text-center transition-all duration-300
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
              accept=".csv"
              onChange={(e) => handleFileInput(e, 'csv')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-xl mb-3">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Încarcă CSV cu Variante
              </h3>
              <p className="text-blue-100 text-sm mb-2">
                {csvData ? '✓ CSV încărcat' : 'Drag & drop sau click'}
              </p>
              {csvData && (
                <div className="text-center">
                  <p className="text-green-300 text-xs">
                    {csvData.length} întrebări găsite
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    Prima întrebare: "{csvData[0]?.questionText?.substring(0, 50)}..."
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* JSON Upload */}
          <div
            className={`
              relative border-2 border-dashed rounded-3xl p-6 text-center transition-all duration-300
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
              onChange={(e) => handleFileInput(e, 'json')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-xl mb-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Încarcă JSON cu Date
              </h3>
              <p className="text-blue-100 text-sm mb-2">
                {jsonData ? '✓ JSON încărcat' : 'Drag & drop sau click'}
              </p>
              {jsonData && (
                <p className="text-green-300 text-xs">
                  {jsonData.length} întrebări găsite
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Create Quiz Button */}
        {csvData && jsonData && quizTitle.trim() && (
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

        {/* Demo Option */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 text-center mb-6">
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl mb-3">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Sau Încearcă Quiz Demo
            </h3>
            <p className="text-blue-100 text-sm mb-4">
              Testează platforma cu un quiz de demonstrație
            </p>
            <button
              onClick={loadSampleQuiz}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Încarcă Demo
            </button>
          </div>
        </div>

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
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Format CSV (ca în screenshot):</h3>
            <pre className="text-sm text-blue-100 bg-black/30 p-4 rounded-lg overflow-x-auto">
{`Question,Option A,Option B,Option C,Option D
Care este formula moleculară?,A) C₆H₁₂O₆,B) C₆H₁₀O₅,C) C₆H₁₄O₆,D) C₆H₈O₆
Care este pH-ul?,A) 0,B) 7,C) 14,D) 1`}
            </pre>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Format JSON (Date):</h3>
            <pre className="text-sm text-blue-100 bg-black/30 p-4 rounded-lg overflow-x-auto">
{`[
  {
    "id": "q1",
    "text": "Întrebarea aici?",
    "correctAnswer": 0,
    "explanation": "Explicația...",
    "passage": "Pasaj opțional..."
  }
]`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
