
import { useState } from 'react';
import { Question } from '@/pages/Index';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { PassageDisplay } from './PassageDisplay';
import { ProcessedChunk } from '@/utils/csvParser';

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: number;
  onAnswer: (answer: number) => void;
  hasAnswered: boolean;
  questionNumber: number;
}

export const QuestionCard = ({ 
  question, 
  selectedAnswer, 
  onAnswer, 
  hasAnswered,
  questionNumber 
}: QuestionCardProps) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerClick = (answerIndex: number) => {
    if (!hasAnswered) {
      onAnswer(answerIndex);
    }
  };

  const getAnswerStyle = (answerIndex: number) => {
    if (!hasAnswered) {
      return "bg-white/10 hover:bg-white/20 border-white/30 text-white";
    }

    if (answerIndex === question.correctAnswer) {
      return "bg-green-500/30 border-green-400 text-green-100";
    }

    if (selectedAnswer === answerIndex && answerIndex !== question.correctAnswer) {
      return "bg-red-500/30 border-red-400 text-red-100";
    }

    return "bg-white/5 border-white/20 text-white/60";
  };

  const getAnswerIcon = (answerIndex: number) => {
    if (!hasAnswered) return null;

    if (answerIndex === question.correctAnswer) {
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    }

    if (selectedAnswer === answerIndex && answerIndex !== question.correctAnswer) {
      return <XCircle className="h-5 w-5 text-red-400" />;
    }

    return null;
  };

  // Parse passage data if available
  const getPassageChunks = (): ProcessedChunk[] => {
    if (!question.passage) return [];
    
    try {
      const parsed = JSON.parse(question.passage);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const passageChunks = getPassageChunks();

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
      {/* Question Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold">
          {questionNumber}
        </div>
        <h2 className="text-2xl font-bold text-white flex-1">{question.text}</h2>
      </div>

      {/* Answer Options */}
      <div className="space-y-4 mb-6">
        {question.variants.map((variant, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(index)}
            disabled={hasAnswered}
            className={`
              w-full p-4 rounded-xl border-2 transition-all duration-300 text-left flex items-center justify-between group
              ${getAnswerStyle(index)}
              ${!hasAnswered && 'hover:shadow-lg transform hover:scale-[1.02]'}
            `}
          >
            <span className="font-medium">
              <span className="text-cyan-300 font-bold mr-3">
                {String.fromCharCode(65 + index)}.
              </span>
              {variant}
            </span>
            {getAnswerIcon(index)}
          </button>
        ))}
      </div>

      {/* Explanation Section */}
      {hasAnswered && question.explanation && (
        <div className="border-t border-white/20 pt-6">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 font-semibold mb-4 transition-colors"
          >
            <Eye className="h-5 w-5" />
            {showExplanation ? 'Ascunde' : 'Afișează'} Explicația
          </button>
          
          {showExplanation && (
            <div>
              <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-400/30 mb-4">
                <p className="text-blue-100 leading-relaxed">{question.explanation}</p>
              </div>
              
              {/* Display passage chunks */}
              {passageChunks.length > 0 && (
                <PassageDisplay chunks={passageChunks} />
              )}
            </div>
          )}
        </div>
      )}

      {/* Answer Feedback */}
      {hasAnswered && (
        <div className="mt-6">
          {selectedAnswer === question.correctAnswer ? (
            <div className="flex items-center gap-2 text-green-300 font-semibold">
              <CheckCircle className="h-6 w-6" />
              Corect! Felicitări!
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-300 font-semibold">
              <XCircle className="h-6 w-6" />
              Incorect. Răspunsul corect este: {String.fromCharCode(65 + question.correctAnswer)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
