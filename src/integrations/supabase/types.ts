export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          condition_type: string
          condition_value: number
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          xp_reward: number
        }
        Insert: {
          condition_type: string
          condition_value: number
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          xp_reward?: number
        }
        Update: {
          condition_type?: string
          condition_value?: number
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          xp_reward?: number
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          details: Json | null
          email_session_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          details?: Json | null
          email_session_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          details?: Json | null
          email_session_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      activity_logs_2025_06: {
        Row: {
          activity_type: string
          created_at: string
          details: Json | null
          email_session_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          details?: Json | null
          email_session_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          details?: Json | null
          email_session_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      activity_logs_2025_07: {
        Row: {
          activity_type: string
          created_at: string
          details: Json | null
          email_session_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          details?: Json | null
          email_session_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          details?: Json | null
          email_session_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string
          email_session_id: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          operation: string
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_session_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_session_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      difficulty_levels: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      email_sessions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          last_active: string
          session_token: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          last_active?: string
          session_token?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          last_active?: string
          session_token?: string
        }
        Relationships: []
      }
      meter_reading_requests: {
        Row: {
          completed_at: string | null
          conversation_id: string | null
          id: string
          image_url: string | null
          meter_type: string
          reading_value: number | null
          requested_at: string | null
          status: string | null
          tenant_name: string
        }
        Insert: {
          completed_at?: string | null
          conversation_id?: string | null
          id?: string
          image_url?: string | null
          meter_type: string
          reading_value?: number | null
          requested_at?: string | null
          status?: string | null
          tenant_name: string
        }
        Update: {
          completed_at?: string | null
          conversation_id?: string | null
          id?: string
          image_url?: string | null
          meter_type?: string
          reading_value?: number | null
          requested_at?: string | null
          status?: string | null
          tenant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "meter_reading_requests_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          email_session_id: string | null
          id: string
          metadata: Json | null
          status: string
          stripe_payment_intent_id: string | null
          subscription_id: string | null
          updated_at: string
          user_id: string | null
          version: number
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          email_session_id?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          email_session_id?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_processing_jobs: {
        Row: {
          created_at: string
          error_message: string | null
          filename: string
          id: string
          status: string
          total_questions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          filename: string
          id?: string
          status?: string
          total_questions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          filename?: string
          id?: string
          status?: string
          total_questions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          timezone: string | null
          updated_at: string
          version: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          timezone?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          timezone?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answered_at: string
          id: string
          is_correct: boolean
          question_id: string
          quiz_session_id: string
          selected_answer: number
        }
        Insert: {
          answered_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          quiz_session_id: string
          selected_answer: number
        }
        Update: {
          answered_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          quiz_session_id?: string
          selected_answer?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_quiz_session_id_fkey"
            columns: ["quiz_session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_prerequisites: {
        Row: {
          created_at: string
          id: string
          prerequisite_quiz_id: string
          quiz_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prerequisite_quiz_id: string
          quiz_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prerequisite_quiz_id?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_prerequisites_prerequisite_quiz_id_fkey"
            columns: ["prerequisite_quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_prerequisites_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string
          id: string
          options: Json
          page_number: number | null
          pdf_filename: string | null
          question: string
          search_vector: unknown | null
          subject: string | null
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          options: Json
          page_number?: number | null
          pdf_filename?: string | null
          question: string
          search_vector?: unknown | null
          subject?: string | null
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          options?: Json
          page_number?: number | null
          pdf_filename?: string | null
          question?: string
          search_vector?: unknown | null
          subject?: string | null
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      quiz_session_questions: {
        Row: {
          correct_answer: number
          created_at: string
          explanation: string | null
          id: string
          passage: Json | null
          question_id: string
          question_order: number
          question_text: string
          quiz_session_id: string
          variants: Json
        }
        Insert: {
          correct_answer: number
          created_at?: string
          explanation?: string | null
          id?: string
          passage?: Json | null
          question_id: string
          question_order: number
          question_text: string
          quiz_session_id: string
          variants: Json
        }
        Update: {
          correct_answer?: number
          created_at?: string
          explanation?: string | null
          id?: string
          passage?: Json | null
          question_id?: string
          question_order?: number
          question_text?: string
          quiz_session_id?: string
          variants?: Json
        }
        Relationships: [
          {
            foreignKeyName: "quiz_session_questions_quiz_session_id_fkey"
            columns: ["quiz_session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_sessions: {
        Row: {
          created_at: string
          current_question_index: number
          email_session_id: string | null
          id: string
          is_completed: boolean
          score: number | null
          title: string
          total_questions: number
          updated_at: string
          user_id: string | null
          version: number
          xp_earned: number | null
        }
        Insert: {
          created_at?: string
          current_question_index?: number
          email_session_id?: string | null
          id?: string
          is_completed?: boolean
          score?: number | null
          title: string
          total_questions?: number
          updated_at?: string
          user_id?: string | null
          version?: number
          xp_earned?: number | null
        }
        Update: {
          created_at?: string
          current_question_index?: number
          email_session_id?: string | null
          id?: string
          is_completed?: boolean
          score?: number | null
          title?: string
          total_questions?: number
          updated_at?: string
          user_id?: string | null
          version?: number
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_email_session_id_fkey"
            columns: ["email_session_id"]
            isOneToOne: false
            referencedRelation: "email_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          count: number
          created_at: string
          id: string
          identifier: string
          identifier_type: string
          max_attempts: number
          updated_at: string
          window_duration: unknown
          window_start: string
        }
        Insert: {
          action: string
          count?: number
          created_at?: string
          id?: string
          identifier: string
          identifier_type: string
          max_attempts?: number
          updated_at?: string
          window_duration?: unknown
          window_start?: string
        }
        Update: {
          action?: string
          count?: number
          created_at?: string
          id?: string
          identifier?: string
          identifier_type?: string
          max_attempts?: number
          updated_at?: string
          window_duration?: unknown
          window_start?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_quizzes: number | null
          max_storage_mb: number | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_quizzes?: number | null
          max_storage_mb?: number | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_quizzes?: number | null
          max_storage_mb?: number | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      sync_queue: {
        Row: {
          conflict_resolution: string | null
          created_at: string
          data: Json | null
          email_session_id: string | null
          id: string
          last_error: string | null
          operation: string
          record_id: string
          retry_count: number
          synced_at: string | null
          table_name: string
          user_id: string | null
          version: number
        }
        Insert: {
          conflict_resolution?: string | null
          created_at?: string
          data?: Json | null
          email_session_id?: string | null
          id?: string
          last_error?: string | null
          operation: string
          record_id: string
          retry_count?: number
          synced_at?: string | null
          table_name: string
          user_id?: string | null
          version?: number
        }
        Update: {
          conflict_resolution?: string | null
          created_at?: string
          data?: Json | null
          email_session_id?: string | null
          id?: string
          last_error?: string | null
          operation?: string
          record_id?: string
          retry_count?: number
          synced_at?: string | null
          table_name?: string
          user_id?: string | null
          version?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          earned_at: string
          email_session_id: string | null
          id: string
        }
        Insert: {
          achievement_id?: string | null
          earned_at?: string
          email_session_id?: string | null
          id?: string
        }
        Update: {
          achievement_id?: string | null
          earned_at?: string
          email_session_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_email_session_id_fkey"
            columns: ["email_session_id"]
            isOneToOne: false
            referencedRelation: "email_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_knowledge_areas: {
        Row: {
          created_at: string
          id: string
          interest_level: number | null
          proficiency_level: number | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interest_level?: number | null
          proficiency_level?: number | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interest_level?: number | null
          proficiency_level?: number | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_knowledge_areas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          daily_goal: number | null
          difficulty_level_id: number | null
          difficulty_preference: string | null
          id: string
          language_preference: string | null
          learning_style: string | null
          notifications_enabled: boolean | null
          reminder_enabled: boolean | null
          reminder_time: string | null
          theme_preference: string | null
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          daily_goal?: number | null
          difficulty_level_id?: number | null
          difficulty_preference?: string | null
          id?: string
          language_preference?: string | null
          learning_style?: string | null
          notifications_enabled?: boolean | null
          reminder_enabled?: boolean | null
          reminder_time?: string | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          daily_goal?: number | null
          difficulty_level_id?: number | null
          difficulty_preference?: string | null
          id?: string
          language_preference?: string | null
          learning_style?: string | null
          notifications_enabled?: boolean | null
          reminder_enabled?: boolean | null
          reminder_time?: string | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_difficulty_level_id_fkey"
            columns: ["difficulty_level_id"]
            isOneToOne: false
            referencedRelation: "difficulty_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          created_at: string
          current_level: number
          current_streak: number
          email_session_id: string | null
          id: string
          last_activity_date: string | null
          longest_streak: number
          total_xp: number
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_streak?: number
          email_session_id?: string | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          current_level?: number
          current_streak?: number
          email_session_id?: string | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_email_session_id_fkey"
            columns: ["email_session_id"]
            isOneToOne: true
            referencedRelation: "email_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_recommendations: {
        Row: {
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_dismissed: boolean | null
          metadata: Json | null
          priority: number | null
          recommendation_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          metadata?: Json | null
          priority?: number | null
          recommendation_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          metadata?: Json | null
          priority?: number | null
          recommendation_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          email_session_id: string | null
          id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
          version: number
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email_session_id?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email_session_id?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message: string | null
          last_message_time: string | null
          phone_number: string
          status: string | null
          tenant_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          phone_number: string
          status?: string | null
          tenant_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          phone_number?: string
          status?: string | null
          tenant_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          content: string
          conversation_id: string | null
          id: string
          is_read: boolean | null
          message_id: string | null
          message_type: string | null
          metadata: Json | null
          sender: string
          timestamp: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          id?: string
          is_read?: boolean | null
          message_id?: string | null
          message_type?: string | null
          metadata?: Json | null
          sender: string
          timestamp?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          id?: string
          is_read?: boolean | null
          message_id?: string | null
          message_type?: string | null
          metadata?: Json | null
          sender?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
