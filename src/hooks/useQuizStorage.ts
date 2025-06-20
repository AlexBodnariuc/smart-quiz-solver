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
  email_session_id?: string;
}

export const useQuizStorage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentEmailSessionId = (): string | null => {
    const token = localStorage.getItem('email_session_token');
    return token;
  };

  const getEmailSessionByToken = async (token: string) => {
    const { data, error } = await supabase
      .from('email_sessions')
      .select('id')
      .eq('session_token', token)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error getting email session:', error);
      return null;
    }
    return data;
  };

  const saveQuizSession = async (quizData: QuizData): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const sessionToken = getCurrentEmailSessionId();
      let emailSessionId = null;

      if (sessionToken) {
        const emailSession = await getEmailSessionByToken(sessionToken);
        emailSessionId = emailSession?.id || null;
      }

      // Create quiz session with email_session_id (required for authenticated users)
      const sessionData = {
        title: quizData.title,
        total_questions: quizData.questions.length,
        current_question_index: 0,
        is_completed: false,
        email_session_id: emailSessionId
      };

      const { data: sessionDataResult, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Save all questions for this session using bulk insert
      const questionsToInsert = quizData.questions.map((question, index) => ({
        quiz_session_id: sessionDataResult.id,
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

      return sessionDataResult.id;
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
      // Reading questions with select as per instructions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_session_questions')
        .select('id, question_id, question_text, variants, correct_answer, explanation, passage, question_order')
        .eq('quiz_session_id', sessionId)
        .order('question_order');

      if (questionsError) throw questionsError;

      // Load session data
      const { data: sessionData, error: sessionError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

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
      const sessionToken = getCurrentEmailSessionId();
      
      if (!sessionToken) {
        return [];
      }

      // Get email session for current user
      const emailSession = await getEmailSessionByToken(sessionToken);
      
      if (!emailSession) {
        return [];
      }

      // Get sessions for this email session
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('email_session_id', emailSession.id)
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

  // Enhanced function to get ALL unique questions from the entire database
  const getAllQuestionsFromDatabase = async (): Promise<Question[]> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Loading ALL questions from the entire database...');
      
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_session_questions')
        .select(`
          *,
          quiz_sessions!inner(title, created_at)
        `);

      if (questionsError) throw questionsError;

      console.log(`Found ${questionsData?.length || 0} total questions in database`);

      if (!questionsData || questionsData.length === 0) {
        return [];
      }

      const allQuestions: Question[] = questionsData.map(q => ({
        id: q.question_id,
        text: q.question_text,
        variants: q.variants as string[],
        correctAnswer: q.correct_answer,
        explanation: q.explanation || '',
        passage: q.passage ? JSON.stringify(q.passage) : undefined
      }));

      const uniqueQuestions = allQuestions.filter((question, index, self) => {
        const firstIndex = self.findIndex(q => {
          const normalizedText1 = q.text.trim().toLowerCase().replace(/\s+/g, ' ');
          const normalizedText2 = question.text.trim().toLowerCase().replace(/\s+/g, ' ');
          const sameText = normalizedText1 === normalizedText2;
          const sameVariants = JSON.stringify(q.variants) === JSON.stringify(question.variants);
          return sameText && sameVariants;
        });
        return index === firstIndex;
      });

      console.log(`After deduplication: ${uniqueQuestions.length} unique questions available from entire corpus`);
      return uniqueQuestions;

    } catch (err: any) {
      console.error('Error loading all questions from database:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Enhanced function to get total count of all questions including generated tests
  const getTotalQuestionCount = async (): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('quiz_session_questions')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (err: any) {
      console.error('Error getting total question count:', err);
      return 0;
    }
  };

  // Function to delete existing subject quizzes
  const deleteSubjectQuizzes = async (): Promise<void> => {
    try {
      console.log('Deleting existing subject quizzes...');
      
      const { data: subjectSessions, error: fetchError } = await supabase
        .from('quiz_sessions')
        .select('id')
        .like('title', 'Subiect%');

      if (fetchError) throw fetchError;

      if (subjectSessions && subjectSessions.length > 0) {
        const sessionIds = subjectSessions.map(s => s.id);

        const { error: questionsDeleteError } = await supabase
          .from('quiz_session_questions')
          .delete()
          .in('quiz_session_id', sessionIds);

        if (questionsDeleteError) throw questionsDeleteError;

        const { error: answersDeleteError } = await supabase
          .from('quiz_answers')
          .delete()
          .in('quiz_session_id', sessionIds);

        if (answersDeleteError) throw answersDeleteError;

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

  // NEW: Function to deduplicate questions in the database
  const deduplicateQuestions = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Starting database deduplication process...');
      
      const { data: allQuestions, error: fetchError } = await supabase
        .from('quiz_session_questions')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (!allQuestions || allQuestions.length === 0) {
        console.log('No questions found to deduplicate');
        return;
      }

      console.log(`Found ${allQuestions.length} total questions, starting deduplication...`);

      const uniqueQuestions = new Map();
      const duplicateIds = [];

      for (const question of allQuestions) {
        const normalizedText = question.question_text.trim().toLowerCase().replace(/\s+/g, ' ');
        const variantsKey = JSON.stringify(question.variants);
        const uniqueKey = `${normalizedText}|||${variantsKey}`;

        if (uniqueQuestions.has(uniqueKey)) {
          duplicateIds.push(question.id);
        } else {
          uniqueQuestions.set(uniqueKey, question);
        }
      }

      console.log(`Found ${duplicateIds.length} duplicate questions to remove`);

      if (duplicateIds.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < duplicateIds.length; i += batchSize) {
          const batch = duplicateIds.slice(i, i + batchSize);
          
          const { error: deleteError } = await supabase
            .from('quiz_session_questions')
            .delete()
            .in('id', batch);

          if (deleteError) {
            console.error('Error deleting duplicate questions:', deleteError);
            throw deleteError;
          }
        }

        console.log(`Successfully removed ${duplicateIds.length} duplicate questions`);
      }

      console.log(`Deduplication complete. ${uniqueQuestions.size} unique questions remain.`);

    } catch (err: any) {
      console.error('Error during deduplication:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function to save quiz progress
  const saveQuizProgress = async (
    sessionId: string, 
    currentQuestionIndex: number, 
    answers: Answer[]
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const { error: sessionError } = await supabase
        .from('quiz_sessions')
        .update({
          current_question_index: currentQuestionIndex,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      // Bulk insert/update answers
      if (answers.length > 0) {
        const answersToInsert = answers.map(answer => ({
          quiz_session_id: sessionId,
          question_id: answer.questionId,
          selected_answer: answer.selectedAnswer,
          is_correct: answer.isCorrect
        }));

        const { error: answerError } = await supabase
          .from('quiz_answers')
          .upsert(answersToInsert, {
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

  // Function to complete a quiz session with XP calculation following finalization pattern
  const completeQuizSession = async (
    sessionId: string, 
    answers: Answer[], 
    score: number
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Calculate XP based on score and number of questions
      const correctAnswers = answers.filter(a => a.isCorrect).length;
      const totalQuestions = answers.length;
      const baseXP = correctAnswers * 10; // 10 XP per correct answer
      const bonusXP = score === 100 ? 50 : 0; // Perfect score bonus
      const totalXP = baseXP + bonusXP;

      // Complete the quiz session
      const { error: sessionError } = await supabase
        .from('quiz_sessions')
        .update({
          is_completed: true,
          score,
          xp_earned: totalXP,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      // Save final answers in bulk
      await saveQuizProgress(sessionId, -1, answers);

      // Update user progress with earned XP
      const sessionToken = getCurrentEmailSessionId();
      if (sessionToken) {
        const emailSession = await getEmailSessionByToken(sessionToken);
        if (emailSession) {
          const { error: progressError } = await supabase
            .from('user_progress')
            .update({
              total_xp: supabase.raw(`total_xp + ${totalXP}`),
              last_activity_date: new Date().toISOString().split('T')[0],
              updated_at: new Date().toISOString()
            })
            .eq('email_session_id', emailSession.id);

          if (progressError) {
            console.error('Error updating user progress:', progressError);
          }
        }
      }
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
    getTotalQuestionCount,
    deleteSubjectQuizzes,
    deduplicateQuestions,
    saveQuizProgress,
    completeQuizSession
  };
};
