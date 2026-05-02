export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      businesses: {
        Row: {
          app_installs: number | null
          business_name: string
          business_type: string | null
          created_at: string
          description: string | null
          feedback_slug: string
          form_started: number | null
          id: string
          is_public: boolean
          logo_url: string | null
          owner_id: string
          page_views: number | null
          physical_address: string | null
          website_url: string | null
        }
        Insert: {
          app_installs?: number | null
          business_name: string
          business_type?: string | null
          created_at?: string
          description?: string | null
          feedback_slug: string
          form_started?: number | null
          id?: string
          is_public?: boolean
          logo_url?: string | null
          owner_id: string
          page_views?: number | null
          physical_address?: string | null
          website_url?: string | null
        }
        Update: {
          app_installs?: number | null
          business_name?: string
          business_type?: string | null
          created_at?: string
          description?: string | null
          feedback_slug?: string
          form_started?: number | null
          id?: string
          is_public?: boolean
          logo_url?: string | null
          owner_id?: string
          page_views?: number | null
          physical_address?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          audio_url: string | null
          business_id: string
          business_reply: string | null
          category: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          guest_session_id: string | null
          id: string
          is_anonymous: boolean
          is_featured: boolean | null
          is_public: boolean | null
          message: string
          rating: number | null
          reply_at: string | null
          sentiment: string | null
          session_id: string | null
          source: string
          status: string
          trigger_id: string | null
          trigger_type: string | null
          upvotes_count: number | null
          visual_url: string | null
        }
        Insert: {
          audio_url?: string | null
          business_id: string
          business_reply?: string | null
          category?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          guest_session_id?: string | null
          id?: string
          is_anonymous?: boolean
          is_featured?: boolean | null
          is_public?: boolean | null
          message: string
          rating?: number | null
          reply_at?: string | null
          sentiment?: string | null
          session_id?: string | null
          source?: string
          status?: string
          trigger_id?: string | null
          trigger_type?: string | null
          upvotes_count?: number | null
          visual_url?: string | null
        }
        Update: {
          audio_url?: string | null
          business_id?: string
          business_reply?: string | null
          category?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          guest_session_id?: string | null
          id?: string
          is_anonymous?: boolean
          is_featured?: boolean | null
          is_public?: boolean | null
          message?: string
          rating?: number | null
          reply_at?: string | null
          sentiment?: string | null
          session_id?: string | null
          source?: string
          status?: string
          trigger_id?: string | null
          trigger_type?: string | null
          upvotes_count?: number | null
          visual_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "smart_triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          business_id: string
          created_at: string
          id: string
          qr_url: string
          scans_count: number
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          qr_url: string
          scans_count?: number
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          qr_url?: string
          scans_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_triggers: {
        Row: {
          action_type: string
          business_id: string
          conditions: Json | null
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          prompt_text: string | null
          trigger_name: string
          trigger_type: string
          updated_at: string
        }
        Insert: {
          action_type?: string
          business_id: string
          conditions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          prompt_text?: string | null
          trigger_name: string
          trigger_type: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          business_id?: string
          conditions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          prompt_text?: string | null
          trigger_name?: string
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_triggers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          feedback_limit: number
          id: string
          plan_name: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_limit?: number
          id?: string
          plan_name?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_limit?: number
          id?: string
          plan_name?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      trigger_events: {
        Row: {
          business_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          page_url: string | null
          session_id: string | null
          trigger_id: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          session_id?: string | null
          trigger_id?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          session_id?: string | null
          trigger_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trigger_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trigger_events_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "smart_triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_settings: {
        Row: {
          business_id: string
          button_text: string
          created_at: string
          delay_seconds: number | null
          exit_intent_enabled: boolean | null
          id: string
          is_enabled: boolean
          position: string
          scroll_percent: number | null
          theme: string
          widget_title: string
        }
        Insert: {
          business_id: string
          button_text?: string
          created_at?: string
          delay_seconds?: number | null
          exit_intent_enabled?: boolean | null
          id?: string
          is_enabled?: boolean
          position?: string
          scroll_percent?: number | null
          theme?: string
          widget_title?: string
        }
        Update: {
          business_id?: string
          button_text?: string
          created_at?: string
          delay_seconds?: number | null
          exit_intent_enabled?: boolean | null
          id?: string
          is_enabled?: boolean
          position?: string
          scroll_percent?: number | null
          theme?: string
          widget_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_settings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      initialize_business_triggers: {
        Args: { p_business_id: string }
        Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
