
import { QuizData, Question } from '@/pages/Index';

interface JSONQuestionData {
  questionId: string;
  originalQuestion: {
    question: string;
    variants: string[];
    correctAnswer: number | null;
  };
  agentResponse: {
    answer: string;
    explanation: string;
    relevantChunks?: any[];
  };
}

export const parseQuizJSON = (jsonData: JSONQuestionData[], quizTitle: string): QuizData => {
  console.log('Parsing JSON data:', jsonData);
  
  if (!Array.isArray(jsonData)) {
    throw new Error('JSON data must be an array of questions');
  }

  const questions: Question[] = jsonData.map((item, index) => {
    console.log(`Processing question ${index + 1}:`, item);
    
    // Find the correct answer index by matching the agent's answer with the variants
    let correctAnswerIndex = 0;
    const agentAnswer = item.agentResponse.answer;
    const variants = item.originalQuestion.variants;
    
    // Try to find exact match first
    const exactMatch = variants.findIndex(variant => 
      variant.includes(agentAnswer) || agentAnswer.includes(variant.replace(/^[A-D]\)\s*/, ''))
    );
    
    if (exactMatch !== -1) {
      correctAnswerIndex = exactMatch;
    } else {
      // If no exact match, try to parse the answer as a letter (A, B, C, D)
      const letterMatch = agentAnswer.match(/^([A-D])/i);
      if (letterMatch) {
        correctAnswerIndex = letterMatch[1].toUpperCase().charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      }
    }
    
    console.log(`Question ${index + 1} correct answer index:`, correctAnswerIndex);
    
    const question: Question = {
      id: item.questionId || `question-${index}`,
      text: item.originalQuestion.question,
      variants: item.originalQuestion.variants,
      correctAnswer: correctAnswerIndex,
      explanation: item.agentResponse.explanation,
      passage: item.agentResponse.relevantChunks ? 
        JSON.stringify(item.agentResponse.relevantChunks, null, 2) : undefined
    };
    
    return question;
  });

  console.log('Generated questions:', questions);
  
  const quizData: QuizData = {
    id: `quiz-${Date.now()}`,
    title: quizTitle,
    questions: questions
  };
  
  console.log('Final quiz data:', quizData);
  return quizData;
};
