
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QuizData, Question } from '@/pages/Index';
import { Answer } from '@/components/Quiz';

interface QuizSession {
  id: string;
  title: string;
  total_questions: number;
  current_question_index: number;
  is_completed: boolean;
  score?: number;
  created_at: string;
  updated_at: string;
}

export const useQuizStorage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveQuizSession = async (quizData: QuizData): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      // Create quiz session without user_id requirement
      const { data: sessionData, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({
          title: quizData.title,
          total_questions: quizData.questions.length,
          current_question_index: 0,
          is_completed: false
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Save all questions for this session
      const questionsToInsert = quizData.questions.map((question, index) => ({
        quiz_session_id: sessionData.id,
        question_id: question.id,
        question_text: question.text,
        variants: question.variants,
        correct_answer: question.correctAnswer,
        explanation: question.explanation,
        passage: question.passage ? JSON.parse(question.passage) : null,
        question_order: index
      }));

      const { error: questionsError } = await supabase
        .from('quiz_session_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      return sessionData.id;
    } catch (err: any) {
      console.error('Error saving quiz session:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadQuizSession = async (sessionId: string): Promise<QuizData | null> => {
    setLoading(true);
    setError(null);

    try {
      // Load session data
      const { data: sessionData, error: sessionError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Load questions for this session
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_session_questions')
        .select('*')
        .eq('quiz_session_id', sessionId)
        .order('question_order');

      if (questionsError) throw questionsError;

      // Convert to QuizData format
      const questions: Question[] = questionsData.map(q => ({
        id: q.question_id,
        text: q.question_text,
        variants: q.variants as string[],
        correctAnswer: q.correct_answer,
        explanation: q.explanation || '',
        passage: q.passage ? JSON.stringify(q.passage) : undefined
      }));

      return {
        id: sessionData.id,
        title: sessionData.title,
        questions
      };
    } catch (err: any) {
      console.error('Error loading quiz session:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserQuizSessions = async (): Promise<QuizSession[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      console.error('Error loading quiz sessions:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // New function to get all questions from the database
  const getAllQuestionsFromDatabase = async (): Promise<Question[]> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Loading all questions from database...');
      
      // Get all questions from all sessions that are NOT generated subject tests
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_session_questions')
        .select(`
          *,
          quiz_sessions!inner(title)
        `)
        .not('quiz_sessions.title', 'like', 'Subiect%');

      if (questionsError) throw questionsError;

      console.log(`Found ${questionsData?.length || 0} questions in database`);

      if (!questionsData || questionsData.length === 0) {
        return [];
      }

      // Convert to Question format and remove duplicates based on question text
      const allQuestions: Question[] = questionsData.map(q => ({
        id: q.question_id,
        text: q.question_text,
        variants: q.variants as string[],
        correctAnswer: q.correct_answer,
        explanation: q.explanation || '',
        passage: q.passage ? JSON.stringify(q.passage) : undefined
      }));

      // Remove duplicates based on question text
      const uniqueQuestions = allQuestions.filter((question, index, self) => 
        index === self.findIndex(q => q.text === question.text)
      );

      console.log(`After removing duplicates: ${uniqueQuestions.length} unique questions`);
      return uniqueQuestions;

    } catch (err: any) {
      console.error('Error loading all questions from database:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Function to delete existing subject quizzes
  const deleteSubjectQuizzes = async (): Promise<void> => {
    try {
      console.log('Deleting existing subject quizzes...');
      
      // Get all subject quiz sessions
      const { data: subjectSessions, error: fetchError } = await supabase
        .from('quiz_sessions')
        .select('id')
        .like('title', 'Subiect%');

      if (fetchError) throw fetchError;

      if (subjectSessions && subjectSessions.length > 0) {
        const sessionIds = subjectSessions.map(s => s.id);

        // Delete questions first (due to foreign key constraints)
        const { error: questionsDeleteError } = await supabase
          .from('quiz_session_questions')
          .delete()
          .in('quiz_session_id', sessionIds);

        if (questionsDeleteError) throw questionsDeleteError;

        // Delete answers
        const { error: answersDeleteError } = await supabase
          .from('quiz_answers')
          .delete()
          .in('quiz_session_id', sessionIds);

        if (answersDeleteError) throw answersDeleteError;

        // Delete sessions
        const { error: sessionsDeleteError } = await supabase
          .from('quiz_sessions')
          .delete()
          .in('id', sessionIds);

        if (sessionsDeleteError) throw sessionsDeleteError;

        console.log(`Deleted ${subjectSessions.length} existing subject quizzes`);
      }
    } catch (err: any) {
      console.error('Error deleting subject quizzes:', err);
      throw err;
    }
  };

  const saveQuizProgress = async (
    sessionId: string, 
    currentQuestionIndex: number, 
    answers: Answer[]
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Update session progress
      const { error: sessionError } = await supabase
        .from('quiz_sessions')
        .update({
          current_question_index: currentQuestionIndex,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      // Save new answers
      for (const answer of answers) {
        const { error: answerError } = await supabase
          .from('quiz_answers')
          .upsert({
            quiz_session_id: sessionId,
            question_id: answer.questionId,
            selected_answer: answer.selectedAnswer,
            is_correct: answer.isCorrect
          }, {
            onConflict: 'quiz_session_id,question_id'
          });

        if (answerError) throw answerError;
      }
    } catch (err: any) {
      console.error('Error saving quiz progress:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeQuizSession = async (
    sessionId: string, 
    answers: Answer[], 
    score: number
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Mark session as completed
      const { error: sessionError } = await supabase
        .from('quiz_sessions')
        .update({
          is_completed: true,
          score,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      // Save final answers
      await saveQuizProgress(sessionId, -1, answers);
    } catch (err: any) {
      console.error('Error completing quiz session:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    saveQuizSession,
    loadQuizSession,
    getUserQuizSessions,
    getAllQuestionsFromDatabase,
    deleteSubjectQuizzes,
    saveQuizProgress,
    completeQuizSession
  };
};
