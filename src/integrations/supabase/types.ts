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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          details: string | null
          id: string
          teacherid: string | null
          timestamp: string | null
        }
        Insert: {
          action: string
          details?: string | null
          id?: string
          teacherid?: string | null
          timestamp?: string | null
        }
        Update: {
          action?: string
          details?: string | null
          id?: string
          teacherid?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_teacherid_fkey"
            columns: ["teacherid"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      division_ranges: {
        Row: {
          created_at: string
          description: string | null
          division: string
          grading_system_id: string
          id: string
          max_points: number
          min_points: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          division: string
          grading_system_id: string
          id?: string
          max_points: number
          min_points: number
        }
        Update: {
          created_at?: string
          description?: string | null
          division?: string
          grading_system_id?: string
          id?: string
          max_points?: number
          min_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "division_ranges_grading_system_id_fkey"
            columns: ["grading_system_id"]
            isOneToOne: false
            referencedRelation: "grading_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          date: string | null
          form: number
          id: string
          name: string
          term: number
          type: string
          year: number
        }
        Insert: {
          date?: string | null
          form: number
          id?: string
          name: string
          term: number
          type: string
          year: number
        }
        Update: {
          date?: string | null
          form?: number
          id?: string
          name?: string
          term?: number
          type?: string
          year?: number
        }
        Relationships: []
      }
      grade_ranges: {
        Row: {
          created_at: string
          grade: string
          grading_system_id: string
          id: string
          max_score: number
          min_score: number
          points: number | null
        }
        Insert: {
          created_at?: string
          grade: string
          grading_system_id: string
          id?: string
          max_score: number
          min_score: number
          points?: number | null
        }
        Update: {
          created_at?: string
          grade?: string
          grading_system_id?: string
          id?: string
          max_score?: number
          min_score?: number
          points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grade_ranges_grading_system_id_fkey"
            columns: ["grading_system_id"]
            isOneToOne: false
            referencedRelation: "grading_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      grading_systems: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      marks: {
        Row: {
          examid: string | null
          grade: string | null
          id: string
          remarks: string | null
          score: number
          studentid: string | null
          subjectid: string | null
        }
        Insert: {
          examid?: string | null
          grade?: string | null
          id?: string
          remarks?: string | null
          score: number
          studentid?: string | null
          subjectid?: string | null
        }
        Update: {
          examid?: string | null
          grade?: string | null
          id?: string
          remarks?: string | null
          score?: number
          studentid?: string | null
          subjectid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marks_examid_fkey"
            columns: ["examid"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_studentid_fkey"
            columns: ["studentid"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_subjectid_fkey"
            columns: ["subjectid"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_admin: boolean
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          is_admin?: boolean
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          admissionnumber: string
          firstname: string
          form: number
          guardianname: string | null
          guardianphone: string | null
          id: string
          imageurl: string | null
          lastname: string
          stream: string
        }
        Insert: {
          admissionnumber: string
          firstname: string
          form: number
          guardianname?: string | null
          guardianphone?: string | null
          id?: string
          imageurl?: string | null
          lastname: string
          stream: string
        }
        Update: {
          admissionnumber?: string
          firstname?: string
          form?: number
          guardianname?: string | null
          guardianphone?: string | null
          id?: string
          imageurl?: string | null
          lastname?: string
          stream?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          code: string
          id: string
          name: string
        }
        Insert: {
          code: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          email: string
          firstname: string
          id: string
          lastname: string
          password: string
          role: string
          subjectids: string[] | null
        }
        Insert: {
          email: string
          firstname: string
          id?: string
          lastname: string
          password: string
          role: string
          subjectids?: string[] | null
        }
        Update: {
          email?: string
          firstname?: string
          id?: string
          lastname?: string
          password?: string
          role?: string
          subjectids?: string[] | null
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
