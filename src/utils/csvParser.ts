
export interface CSVQuestionVariants {
  questionId: string;
  variants: string[];
  questionText: string;
}

export interface JSONQuestionData {
  id: string;
  text: string;
  correctAnswer: number;
  passage?: string;
  explanation: string;
}

export const parseCSV = (csvText: string): CSVQuestionVariants[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const results: CSVQuestionVariants[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    if (values.length >= 5) { // Need at least question + 4 options
      const questionText = values[0];
      // Extract options A, B, C, D (columns 1-4)
      const variants = values.slice(1, 5).filter(v => v.length > 0);
      
      // Generate a question ID based on row number
      const questionId = `q${i}`;
      
      results.push({
        questionId,
        variants,
        questionText
      });
    }
  }
  
  return results;
};

export const mergeQuizData = (
  csvData: CSVQuestionVariants[],
  jsonData: JSONQuestionData[],
  quizTitle: string
) => {
  const questions = jsonData.map((jsonQuestion, index) => {
    // Try to match by ID first, then by index as fallback
    let csvQuestion = csvData.find(csv => csv.questionId === jsonQuestion.id);
    
    if (!csvQuestion && index < csvData.length) {
      // Fallback: use index-based matching
      csvQuestion = csvData[index];
    }
    
    if (!csvQuestion) {
      throw new Error(`Nu s-au găsit variante pentru întrebarea cu ID: ${jsonQuestion.id}`);
    }
    
    return {
      id: jsonQuestion.id,
      text: jsonQuestion.text,
      variants: csvQuestion.variants,
      correctAnswer: jsonQuestion.correctAnswer,
      passage: jsonQuestion.passage,
      explanation: jsonQuestion.explanation
    };
  });
  
  return {
    id: `merged-quiz-${Date.now()}`,
    title: quizTitle,
    questions
  };
};
