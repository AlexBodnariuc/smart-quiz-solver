
import { useState } from 'react';
import { Upload, FileText, Brain } from 'lucide-react';
import { QuizData } from '@/pages/Index';

interface QuizLoaderProps {
  onQuizLoad: (data: QuizData) => void;
}

export const QuizLoader = ({ onQuizLoad }: QuizLoaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text) as QuizData;
      
      // Validate the data structure
      if (!data.id || !data.title || !Array.isArray(data.questions)) {
        throw new Error('Format invalid de quiz. Asigură-te că JSON-ul conține id, title și questions.');
      }

      onQuizLoad(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la încărcarea fișierului');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      handleFileUpload(file);
    } else {
      setError('Te rog să încarci un fișier JSON valid.');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
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
            Încarcă fișierul JSON cu întrebările tale și începe să îți testezi cunoștințele
          </p>
        </div>

        {/* Upload Area */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
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
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Încarcă Quiz JSON
              </h3>
              <p className="text-blue-100 text-sm">
                Drag & drop sau click pentru a selecta fișierul
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Încearcă Quiz Demo
              </h3>
              <p className="text-blue-100 text-sm mb-6">
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
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-white">Se încarcă quiz-ul...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl p-6 border border-red-400/30 text-center">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Format Info */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">Format JSON Așteptat:</h3>
          <pre className="text-sm text-blue-100 bg-black/30 p-4 rounded-lg overflow-x-auto">
{`{
  "id": "quiz-1",
  "title": "Titlul Quiz-ului",
  "questions": [
    {
      "id": "q1",
      "text": "Întrebarea aici?",
      "variants": ["Opțiunea A", "Opțiunea B", "Opțiunea C", "Opțiunea D"],
      "correctAnswer": 0,
      "passage": "Text opțional pentru context",
      "explanation": "Explicația răspunsului corect"
    }
  ]
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};
