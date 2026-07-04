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
      companies: {
        Row: {
          cnpj: string | null
          copsoq_version: Database["public"]["Enums"]["copsoq_version"]
          created_at: string
          estimated_employees: number | null
          id: string
          invite_code: string
          legal_name: string
          owner_id: string
          plan: Database["public"]["Enums"]["company_plan"]
          sector: string | null
          sectors: string[]
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          copsoq_version?: Database["public"]["Enums"]["copsoq_version"]
          created_at?: string
          estimated_employees?: number | null
          id?: string
          invite_code: string
          legal_name: string
          owner_id: string
          plan?: Database["public"]["Enums"]["company_plan"]
          sector?: string | null
          sectors?: string[]
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          copsoq_version?: Database["public"]["Enums"]["copsoq_version"]
          created_at?: string
          estimated_employees?: number | null
          id?: string
          invite_code?: string
          legal_name?: string
          owner_id?: string
          plan?: Database["public"]["Enums"]["company_plan"]
          sector?: string | null
          sectors?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          sector: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          sector?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          sector?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      fib_assessments: {
        Row: {
          created_at: string
          domains: Json
          encouragement: string | null
          factors: Json
          fib_score: number
          id: string
          learning_trails: Json
          raw_answers: Json
          recommendations: Json
          strengths: Json
          summary: string | null
          user_id: string
          vulnerabilities: Json
        }
        Insert: {
          created_at?: string
          domains: Json
          encouragement?: string | null
          factors: Json
          fib_score: number
          id?: string
          learning_trails?: Json
          raw_answers: Json
          recommendations?: Json
          strengths?: Json
          summary?: string | null
          user_id: string
          vulnerabilities?: Json
        }
        Update: {
          created_at?: string
          domains?: Json
          encouragement?: string | null
          factors?: Json
          fib_score?: number
          id?: string
          learning_trails?: Json
          raw_answers?: Json
          recommendations?: Json
          strengths?: Json
          summary?: string | null
          user_id?: string
          vulnerabilities?: Json
        }
        Relationships: []
      }
      nr1_assessments: {
        Row: {
          company_id: string | null
          created_at: string
          global_risk: string
          global_score: number
          green_flags: Json
          id: string
          raw_answers: Json
          recommendations: Json
          red_flags: Json
          subscales: Json
          summary: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          global_risk: string
          global_score: number
          green_flags?: Json
          id?: string
          raw_answers: Json
          recommendations?: Json
          red_flags?: Json
          subscales: Json
          summary?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          global_risk?: string
          global_score?: number
          green_flags?: Json
          id?: string
          raw_answers?: Json
          recommendations?: Json
          red_flags?: Json
          subscales?: Json
          summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nr1_manifest_signatures: {
        Row: {
          commitment_level: string
          company_name: string
          created_at: string
          email: string
          full_name: string
          headcount_range: string | null
          id: string
          role: string
          state_uf: string | null
          user_agent_hash: string | null
        }
        Insert: {
          commitment_level?: string
          company_name: string
          created_at?: string
          email: string
          full_name: string
          headcount_range?: string | null
          id?: string
          role: string
          state_uf?: string | null
          user_agent_hash?: string | null
        }
        Update: {
          commitment_level?: string
          company_name?: string
          created_at?: string
          email?: string
          full_name?: string
          headcount_range?: string | null
          id?: string
          role?: string
          state_uf?: string | null
          user_agent_hash?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          job_title: string | null
          organization: string | null
          segment: Database["public"]["Enums"]["user_segment"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          organization?: string | null
          segment?: Database["public"]["Enums"]["user_segment"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          organization?: string | null
          segment?: Database["public"]["Enums"]["user_segment"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      public_survey_responses: {
        Row: {
          answers: Json
          company_id: string
          created_at: string
          global_risk: string | null
          global_score: number | null
          id: string
          sector: string | null
          user_agent_hash: string | null
        }
        Insert: {
          answers: Json
          company_id: string
          created_at?: string
          global_risk?: string | null
          global_score?: number | null
          id?: string
          sector?: string | null
          user_agent_hash?: string | null
        }
        Update: {
          answers?: Json
          company_id?: string
          created_at?: string
          global_risk?: string | null
          global_score?: number | null
          id?: string
          sector?: string | null
          user_agent_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_survey_responses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invite_code: { Args: never; Returns: string }
      get_nr1_seal: { Args: { _id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_member: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      join_company_by_code: {
        Args: {
          _code: string
          _role?: Database["public"]["Enums"]["app_role"]
          _sector?: string
        }
        Returns: string
      }
      list_nr1_signatories: {
        Args: {
          _headcount?: string
          _limit?: number
          _offset?: number
          _search?: string
          _uf?: string
        }
        Returns: Json
      }
      lookup_company_by_invite: {
        Args: { _code: string }
        Returns: {
          copsoq_version: Database["public"]["Enums"]["copsoq_version"]
          id: string
          legal_name: string
          sectors: string[]
        }[]
      }
      nr1_manifest_stats: { Args: never; Returns: Json }
      sign_nr1_manifest: {
        Args: {
          p_company_name: string
          p_email: string
          p_full_name: string
          p_headcount_range: string
          p_role: string
          p_state_uf: string
          p_ua_hash: string
        }
        Returns: Json
      }
      submit_public_survey: {
        Args: {
          _answers: Json
          _code: string
          _global_risk: string
          _global_score: number
          _sector: string
          _ua_hash: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "gestor" | "colaborador" | "sst"
      company_plan: "free" | "pro" | "enterprise"
      copsoq_version: "curto" | "medio" | "longo" | "brasil"
      user_segment:
        | "setor_publico"
        | "setor_privado"
        | "sociedade_civil"
        | "nao_informado"
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
    Enums: {
      app_role: ["admin", "gestor", "colaborador", "sst"],
      company_plan: ["free", "pro", "enterprise"],
      copsoq_version: ["curto", "medio", "longo", "brasil"],
      user_segment: [
        "setor_publico",
        "setor_privado",
        "sociedade_civil",
        "nao_informado",
      ],
    },
  },
} as const
