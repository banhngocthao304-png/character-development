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
      body_measurements: {
        Row: {
          belly_cm: number | null
          bmi: number | null
          body_fat_mass_kg: number | null
          bust_cm: number | null
          created_at: string
          glutes_cm: number | null
          hips_cm: number | null
          id: string
          measurement_date: string
          muscle_mass_kg: number | null
          thighs_cm: number | null
          updated_at: string
          upper_arms_cm: number | null
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          belly_cm?: number | null
          bmi?: number | null
          body_fat_mass_kg?: number | null
          bust_cm?: number | null
          created_at?: string
          glutes_cm?: number | null
          hips_cm?: number | null
          id?: string
          measurement_date: string
          muscle_mass_kg?: number | null
          thighs_cm?: number | null
          updated_at?: string
          upper_arms_cm?: number | null
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          belly_cm?: number | null
          bmi?: number | null
          body_fat_mass_kg?: number | null
          bust_cm?: number | null
          created_at?: string
          glutes_cm?: number | null
          hips_cm?: number | null
          id?: string
          measurement_date?: string
          muscle_mass_kg?: number | null
          thighs_cm?: number | null
          updated_at?: string
          upper_arms_cm?: number | null
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      exercise_library: {
        Row: {
          aliases: string[]
          created_at: string
          equipment: string | null
          exercise_name: string
          id: string
          is_custom: boolean
          primary_muscle_group: string
          secondary_muscle_group: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aliases?: string[]
          created_at?: string
          equipment?: string | null
          exercise_name: string
          id?: string
          is_custom?: boolean
          primary_muscle_group: string
          secondary_muscle_group?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          aliases?: string[]
          created_at?: string
          equipment?: string | null
          exercise_name?: string
          id?: string
          is_custom?: boolean
          primary_muscle_group?: string
          secondary_muscle_group?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      food_option_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      food_options: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_options_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "food_option_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_items: {
        Row: {
          created_at: string
          food_name: string
          id: string
          meal_id: string
          preparation: string | null
          quantity: number
          sort_order: number
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          food_name: string
          id?: string
          meal_id: string
          preparation?: string | null
          quantity: number
          sort_order?: number
          unit: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          food_name?: string
          id?: string
          meal_id?: string
          preparation?: string | null
          quantity?: number
          sort_order?: number
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_meals: {
        Row: {
          created_at: string
          id: string
          meal_name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meal_name: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          meal_name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_targets: {
        Row: {
          calories_max: number
          calories_min: number
          carbs_max_g: number
          carbs_min_g: number
          created_at: string
          fat_max_g: number
          fat_min_g: number
          id: string
          protein_max_g: number
          protein_min_g: number
          updated_at: string
          user_id: string
          water_max_l: number
          water_min_l: number
        }
        Insert: {
          calories_max?: number
          calories_min?: number
          carbs_max_g?: number
          carbs_min_g?: number
          created_at?: string
          fat_max_g?: number
          fat_min_g?: number
          id?: string
          protein_max_g?: number
          protein_min_g?: number
          updated_at?: string
          user_id?: string
          water_max_l?: number
          water_min_l?: number
        }
        Update: {
          calories_max?: number
          calories_min?: number
          carbs_max_g?: number
          carbs_min_g?: number
          created_at?: string
          fat_max_g?: number
          fat_min_g?: number
          id?: string
          protein_max_g?: number
          protein_min_g?: number
          updated_at?: string
          user_id?: string
          water_max_l?: number
          water_min_l?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pt_session_exercises: {
        Row: {
          created_at: string
          exercise_name: string
          exercise_note: string | null
          id: string
          pt_session_id: string
          reps: number | null
          sets: number | null
          sort_order: number
          updated_at: string
          user_id: string
          weight: number | null
          weight_unit: string
        }
        Insert: {
          created_at?: string
          exercise_name: string
          exercise_note?: string | null
          id?: string
          pt_session_id: string
          reps?: number | null
          sets?: number | null
          sort_order?: number
          updated_at?: string
          user_id?: string
          weight?: number | null
          weight_unit?: string
        }
        Update: {
          created_at?: string
          exercise_name?: string
          exercise_note?: string | null
          id?: string
          pt_session_id?: string
          reps?: number | null
          sets?: number | null
          sort_order?: number
          updated_at?: string
          user_id?: string
          weight?: number | null
          weight_unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "pt_session_exercises_pt_session_id_fkey"
            columns: ["pt_session_id"]
            isOneToOne: false
            referencedRelation: "pt_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pt_sessions: {
        Row: {
          created_at: string
          id: string
          session_date: string
          session_note: string | null
          session_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_date: string
          session_note?: string | null
          session_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          session_date?: string
          session_note?: string | null
          session_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pt_settings: {
        Row: {
          created_at: string
          id: string
          period_start_day: number
          sessions_per_period: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period_start_day?: number
          sessions_per_period?: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          period_start_day?: number
          sessions_per_period?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
