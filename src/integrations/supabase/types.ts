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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      schedule_items: {
        Row: {
          allowed_roles: Database["public"]["Enums"]["schedule_role"][]
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          icon_name: string | null
          id: string
          location: string | null
          sponsor: string | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          allowed_roles?: Database["public"]["Enums"]["schedule_role"][]
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          icon_name?: string | null
          id?: string
          location?: string | null
          sponsor?: string | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          allowed_roles?: Database["public"]["Enums"]["schedule_role"][]
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          icon_name?: string | null
          id?: string
          location?: string | null
          sponsor?: string | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      xr_agencies: {
        Row: {
          created_at: string
          description: string | null
          editors_note: string | null
          id: string
          is_editors_pick: boolean | null
          logo_url: string | null
          name: string
          regions: string[] | null
          services: string[] | null
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          editors_note?: string | null
          id?: string
          is_editors_pick?: boolean | null
          logo_url?: string | null
          name: string
          regions?: string[] | null
          services?: string[] | null
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          editors_note?: string | null
          id?: string
          is_editors_pick?: boolean | null
          logo_url?: string | null
          name?: string
          regions?: string[] | null
          services?: string[] | null
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      xr_companies: {
        Row: {
          company_size: string | null
          created_at: string
          description: string | null
          editors_note: string | null
          end_of_life_date: string | null
          founded_year: number | null
          hq_location: string | null
          id: string
          is_editors_pick: boolean | null
          launch_date: string | null
          logo_url: string | null
          name: string
          sectors: string[] | null
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          company_size?: string | null
          created_at?: string
          description?: string | null
          editors_note?: string | null
          end_of_life_date?: string | null
          founded_year?: number | null
          hq_location?: string | null
          id?: string
          is_editors_pick?: boolean | null
          launch_date?: string | null
          logo_url?: string | null
          name: string
          sectors?: string[] | null
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          company_size?: string | null
          created_at?: string
          description?: string | null
          editors_note?: string | null
          end_of_life_date?: string | null
          founded_year?: number | null
          hq_location?: string | null
          id?: string
          is_editors_pick?: boolean | null
          launch_date?: string | null
          logo_url?: string | null
          name?: string
          sectors?: string[] | null
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      xr_products: {
        Row: {
          additional_images: string[] | null
          ai_access_score: number | null
          ai_integration: string
          app_store_availability: string | null
          battery_life: string | null
          brightness_nits: string | null
          camera_access_for_devs: boolean | null
          category: string
          cellular_5g: boolean | null
          cloud_dependency: string | null
          company: string
          company_hq: string | null
          created_at: string
          description: string | null
          developer_docs_url: string | null
          developer_resources_url: string | null
          editors_note: string | null
          eye_tracking: boolean | null
          field_of_view: string | null
          hand_tracking: boolean | null
          id: string
          image_url: string | null
          is_editors_pick: boolean | null
          key_features: string[] | null
          link: string | null
          monetization_score: number | null
          name: string
          on_device_ai: boolean | null
          open_ecosystem_score: number | null
          openxr_compatible: boolean | null
          operating_system: string | null
          optics_type: string | null
          platform_viability_score: number | null
          price_range: string | null
          ram: string | null
          refresh_rate: string | null
          region: string
          resolution_per_eye: string | null
          sdk_availability: string | null
          shipping_status: string
          sideloading_allowed: boolean | null
          slam_support: boolean | null
          slug: string
          soc_processor: string | null
          spatial_capability_score: number | null
          standalone_or_tethered: string | null
          tracking_type: string | null
          updated_at: string
          voice_assistant: string | null
          weight: string | null
          wifi_bluetooth_version: string | null
        }
        Insert: {
          additional_images?: string[] | null
          ai_access_score?: number | null
          ai_integration: string
          app_store_availability?: string | null
          battery_life?: string | null
          brightness_nits?: string | null
          camera_access_for_devs?: boolean | null
          category: string
          cellular_5g?: boolean | null
          cloud_dependency?: string | null
          company: string
          company_hq?: string | null
          created_at?: string
          description?: string | null
          developer_docs_url?: string | null
          developer_resources_url?: string | null
          editors_note?: string | null
          eye_tracking?: boolean | null
          field_of_view?: string | null
          hand_tracking?: boolean | null
          id?: string
          image_url?: string | null
          is_editors_pick?: boolean | null
          key_features?: string[] | null
          link?: string | null
          monetization_score?: number | null
          name: string
          on_device_ai?: boolean | null
          open_ecosystem_score?: number | null
          openxr_compatible?: boolean | null
          operating_system?: string | null
          optics_type?: string | null
          platform_viability_score?: number | null
          price_range?: string | null
          ram?: string | null
          refresh_rate?: string | null
          region: string
          resolution_per_eye?: string | null
          sdk_availability?: string | null
          shipping_status: string
          sideloading_allowed?: boolean | null
          slam_support?: boolean | null
          slug: string
          soc_processor?: string | null
          spatial_capability_score?: number | null
          standalone_or_tethered?: string | null
          tracking_type?: string | null
          updated_at?: string
          voice_assistant?: string | null
          weight?: string | null
          wifi_bluetooth_version?: string | null
        }
        Update: {
          additional_images?: string[] | null
          ai_access_score?: number | null
          ai_integration?: string
          app_store_availability?: string | null
          battery_life?: string | null
          brightness_nits?: string | null
          camera_access_for_devs?: boolean | null
          category?: string
          cellular_5g?: boolean | null
          cloud_dependency?: string | null
          company?: string
          company_hq?: string | null
          created_at?: string
          description?: string | null
          developer_docs_url?: string | null
          developer_resources_url?: string | null
          editors_note?: string | null
          eye_tracking?: boolean | null
          field_of_view?: string | null
          hand_tracking?: boolean | null
          id?: string
          image_url?: string | null
          is_editors_pick?: boolean | null
          key_features?: string[] | null
          link?: string | null
          monetization_score?: number | null
          name?: string
          on_device_ai?: boolean | null
          open_ecosystem_score?: number | null
          openxr_compatible?: boolean | null
          operating_system?: string | null
          optics_type?: string | null
          platform_viability_score?: number | null
          price_range?: string | null
          ram?: string | null
          refresh_rate?: string | null
          region?: string
          resolution_per_eye?: string | null
          sdk_availability?: string | null
          shipping_status?: string
          sideloading_allowed?: boolean | null
          slam_support?: boolean | null
          slug?: string
          soc_processor?: string | null
          spatial_capability_score?: number | null
          standalone_or_tethered?: string | null
          tracking_type?: string | null
          updated_at?: string
          voice_assistant?: string | null
          weight?: string | null
          wifi_bluetooth_version?: string | null
        }
        Relationships: []
      }
      xr_use_cases: {
        Row: {
          agency_id: string | null
          client_name: string | null
          created_at: string
          description: string | null
          device: string
          editors_note: string | null
          id: string
          image_url: string | null
          is_editors_pick: boolean | null
          slug: string
          tech_stack: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          client_name?: string | null
          created_at?: string
          description?: string | null
          device: string
          editors_note?: string | null
          id?: string
          image_url?: string | null
          is_editors_pick?: boolean | null
          slug: string
          tech_stack?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          client_name?: string | null
          created_at?: string
          description?: string | null
          device?: string
          editors_note?: string | null
          id?: string
          image_url?: string | null
          is_editors_pick?: boolean | null
          slug?: string
          tech_stack?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "xr_use_cases_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "xr_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      schedule_role: "hacker" | "sponsor" | "press" | "mentor" | "organizer"
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
      schedule_role: ["hacker", "sponsor", "press", "mentor", "organizer"],
    },
  },
} as const
