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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      blood_banks: {
        Row: {
          address: string | null
          area: string | null
          capacity: number | null
          city: string
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          inventory: Json
          license: string | null
          name: string
          phone: string
          state: string | null
          status: string
          updated_at: string
          user_id: string | null
          verified: boolean
        }
        Insert: {
          address?: string | null
          area?: string | null
          capacity?: number | null
          city: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          inventory?: Json
          license?: string | null
          name: string
          phone: string
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          address?: string | null
          area?: string | null
          capacity?: number | null
          city?: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          inventory?: Json
          license?: string | null
          name?: string
          phone?: string
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      blood_requests: {
        Row: {
          blood_group: string
          city: string
          contact_phone: string
          created_at: string
          hospital: string
          id: string
          notes: string | null
          patient_name: string
          status: string
          units: number
          urgency: string
          user_id: string | null
        }
        Insert: {
          blood_group: string
          city: string
          contact_phone: string
          created_at?: string
          hospital: string
          id?: string
          notes?: string | null
          patient_name: string
          status?: string
          units?: number
          urgency?: string
          user_id?: string | null
        }
        Update: {
          blood_group?: string
          city?: string
          contact_phone?: string
          created_at?: string
          hospital?: string
          id?: string
          notes?: string | null
          patient_name?: string
          status?: string
          units?: number
          urgency?: string
          user_id?: string | null
        }
        Relationships: []
      }
      camp_registrations: {
        Row: {
          blood_group: string
          camp_city: string
          camp_title: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string
          status: string
          user_id: string | null
        }
        Insert: {
          blood_group: string
          camp_city: string
          camp_title: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone: string
          status?: string
          user_id?: string | null
        }
        Update: {
          blood_group?: string
          camp_city?: string
          camp_title?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      donors: {
        Row: {
          age: number | null
          area: string | null
          blood_group: string
          city: string
          created_at: string
          donations_count: number
          email: string | null
          full_name: string
          id: string
          is_available: boolean
          last_donation_date: string | null
          phone: string
          reliability_score: number
          user_id: string | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          area?: string | null
          blood_group: string
          city: string
          created_at?: string
          donations_count?: number
          email?: string | null
          full_name: string
          id?: string
          is_available?: boolean
          last_donation_date?: string | null
          phone: string
          reliability_score?: number
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          area?: string | null
          blood_group?: string
          city?: string
          created_at?: string
          donations_count?: number
          email?: string | null
          full_name?: string
          id?: string
          is_available?: boolean
          last_donation_date?: string | null
          phone?: string
          reliability_score?: number
          user_id?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          address: string
          area: string | null
          beds: number | null
          city: string
          contact_person: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          registration_number: string
          specialties: string[]
          state: string
          status: string
          updated_at: string
          user_id: string | null
          verified: boolean
        }
        Insert: {
          address: string
          area?: string | null
          beds?: number | null
          city: string
          contact_person: string
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
          registration_number: string
          specialties?: string[]
          state: string
          status?: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          address?: string
          area?: string | null
          beds?: number | null
          city?: string
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          registration_number?: string
          specialties?: string[]
          state?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
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
