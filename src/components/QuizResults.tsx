import { QuizData } from '@/pages/Index';
import { Answer } from './Quiz';
import { Trophy, RotateCcw, CheckCircle, XCircle, Target } from 'lucide-react';

interface QuizResultsProps {
  quizData: QuizData;
  answers: Answer[];
  onRestart: () => void;
}

export const QuizResults = ({ quizData, answers, onRestart }: QuizResultsProps) => {
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const totalQuestions = quizData.questions.length;
  const scorePercentage = (correctAnswers / totalQuestions) * 100;

  const getScoreColor = () => {
    if (scorePercentage >= 80) return 'text-green-400';
    if (scorePercentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreMessage = () => {
    if (scorePercentage >= 90) return 'Excelent! Performanță remarcabilă!';
    if (scorePercentage >= 80) return 'Foarte bine! Continuă așa!';
    if (scorePercentage >= 70) return 'Bine! Mai ai puțin până la excelența!';
    if (scorePercentage >= 60) return 'Satisfăcător. Poți face mai bine!';
    return 'Încearcă din nou! Studiul este cheia succesului!';
  };

  const getScoreGradient = () => {
    if (scorePercentage >= 80) return 'from-green-500 to-emerald-600';
    if (scorePercentage >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className={`bg-gradient-to-r ${getScoreGradient()} p-6 rounded-3xl`}>
              <Trophy className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">Quiz Finalizat!</h1>
          <p className="text-xl text-blue-100">{quizData.title}</p>
        </div>

        {/* Score Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20 text-center">
          <div className={`text-6xl font-bold mb-4 ${getScoreColor()}`}>
            {Math.round(scorePercentage)}%
          </div>
          
          <div className="text-2xl text-white mb-2">
            {correctAnswers} din {totalQuestions} răspunsuri corecte
          </div>
          
          <p className="text-lg text-blue-100 mb-6">{getScoreMessage()}</p>

          {/* Score Bar */}
          <div className="w-full bg-white/20 rounded-full h-4 mb-6">
            <div 
              className={`bg-gradient-to-r ${getScoreGradient()} h-4 rounded-full transition-all duration-1000`}
              style={{ width: `${scorePercentage}%` }}
            ></div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-400">{correctAnswers}</div>
              <div className="text-blue-100">Corecte</div>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-400">{totalQuestions - correctAnswers}</div>
              <div className="text-blue-100">Greșite</div>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-cyan-400">{totalQuestions}</div>
              <div className="text-blue-100">Total</div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Revizia Răspunsurilor</h2>
          
          <div className="space-y-4">
            {quizData.questions.map((question, index) => {
              const answer = answers.find(a => a.questionId === question.id);
              const isCorrect = answer?.isCorrect || false;
              
              return (
                <div key={question.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center font-bold
                      ${isCorrect ? 'bg-green-500' : 'bg-red-500'}
                    `}>
                      {isCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2">
                        {index + 1}. {question.text}
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-blue-100 text-sm mb-1">Răspunsul tău:</p>
                          <p className={`font-medium ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                            {answer ? question.variants[answer.selectedAnswer] : 'Nu ai răspuns'}
                          </p>
                        </div>
                        
                        {!isCorrect && (
                          <div>
                            <p className="text-blue-100 text-sm mb-1">Răspunsul corect:</p>
                            <p className="text-green-300 font-medium">
                              {question.variants[question.correctAnswer]}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="text-center">
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <RotateCcw className="h-6 w-6" />
            Încearcă Alt Quiz
          </button>
        </div>
      </div>
    </div>
  );
};
