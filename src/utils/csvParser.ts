
import { QuizData, Question } from '@/pages/Index';

export interface QuizJSONData {
  questionId: string;
  originalQuestion: {
    question: string;
    variants: string[];
    correctAnswer: null;
  };
  agentResponse: {
    answer: string;
    explanation: string;
    relevantChunks: Array<{
      text: string;
      bookTitle: string;
      relevanceScore: number;
      page: number;
    }>;
  };
}

export const parseQuizJSON = (jsonData: QuizJSONData[], quizTitle: string): QuizData => {
  const questions: Question[] = jsonData.map((item, index) => {
    // Find which variant matches the agent's answer
    const correctAnswerIndex = item.originalQuestion.variants.findIndex(variant => {
      // Clean both strings for comparison - remove A), B), etc. prefixes and extra spaces
      const cleanVariant = variant.replace(/^[A-D]\)\s*/, '').trim();
      const cleanAnswer = item.agentResponse.answer.trim();
      return cleanVariant === cleanAnswer || variant.includes(cleanAnswer);
    });

    // If no exact match found, try to find by letter prefix in the answer
    let finalCorrectAnswer = correctAnswerIndex;
    if (correctAnswerIndex === -1) {
      const answerMatch = item.agentResponse.answer.match(/^([A-D])\)/);
      if (answerMatch) {
        const letterIndex = answerMatch[1].charCodeAt(0) - 'A'.charCodeAt(0);
        if (letterIndex >= 0 && letterIndex < item.originalQuestion.variants.length) {
          finalCorrectAnswer = letterIndex;
        }
      }
    }

    // Default to 0 if still no match found
    if (finalCorrectAnswer === -1) {
      finalCorrectAnswer = 0;
      console.warn(`Could not determine correct answer for question: ${item.originalQuestion.question}`);
    }

    // Create passage from relevant chunks if available
    let passage = '';
    if (item.agentResponse.relevantChunks && item.agentResponse.relevantChunks.length > 0) {
      const topChunk = item.agentResponse.relevantChunks[0];
      passage = `${topChunk.text} (Sursa: ${topChunk.bookTitle}, pagina ${topChunk.page})`;
    }

    return {
      id: item.questionId,
      text: item.originalQuestion.question,
      variants: item.originalQuestion.variants,
      correctAnswer: finalCorrectAnswer,
      explanation: item.agentResponse.explanation,
      passage: passage || undefined
    };
  });

  return {
    id: `quiz-${Date.now()}`,
    title: quizTitle,
    questions
  };
};

// Legacy exports for backward compatibility (not used anymore)
export interface CSVQuestionVariants {
  questionId: string;
  variants: string[];
  questionText: string;
}

export interface JSONQuestionData {
  id: string;
  text: string;
  correctAnswer: number;
  explanation: string;
  passage?: string;
}

export const parseCSV = (csvText: string): CSVQuestionVariants[] => {
  return [];
};

export const mergeQuizData = (
  csvData: CSVQuestionVariants[],
  jsonData: JSONQuestionData[],
  quizTitle: string
) => {
  throw new Error('CSV functionality has been removed. Please use JSON format only.');
};
