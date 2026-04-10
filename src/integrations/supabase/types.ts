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
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          page_path: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          page_path?: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          page_path?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "analytics_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_sessions: {
        Row: {
          converted: boolean
          country: string | null
          device_type: string | null
          id: string
          intent_level: string
          intent_score: number
          landing_page: string
          last_seen_at: string
          referrer: string | null
          region: string | null
          started_at: string
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_id: string
        }
        Insert: {
          converted?: boolean
          country?: string | null
          device_type?: string | null
          id?: string
          intent_level?: string
          intent_score?: number
          landing_page?: string
          last_seen_at?: string
          referrer?: string | null
          region?: string | null
          started_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id: string
        }
        Update: {
          converted?: boolean
          country?: string | null
          device_type?: string | null
          id?: string
          intent_level?: string
          intent_score?: number
          landing_page?: string
          last_seen_at?: string
          referrer?: string | null
          region?: string | null
          started_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          challenge: string | null
          company: string
          created_at: string
          description: string
          id: string
          image: string | null
          image_position: string | null
          image_zoom: number | null
          is_active: boolean
          sort_order: number | null
          tags: string[] | null
          updated_at: string
          website: string | null
          what_we_did: string | null
        }
        Insert: {
          challenge?: string | null
          company: string
          created_at?: string
          description: string
          id?: string
          image?: string | null
          image_position?: string | null
          image_zoom?: number | null
          is_active?: boolean
          sort_order?: number | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
          what_we_did?: string | null
        }
        Update: {
          challenge?: string | null
          company?: string
          created_at?: string
          description?: string
          id?: string
          image?: string | null
          image_position?: string | null
          image_zoom?: number | null
          is_active?: boolean
          sort_order?: number | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
          what_we_did?: string | null
        }
        Relationships: []
      }
      crm_contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string
          follow_up_date: string | null
          id: string
          message: string | null
          name: string
          role: string | null
          source: string
          source_context: string | null
          stage: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          follow_up_date?: string | null
          id?: string
          message?: string | null
          name: string
          role?: string | null
          source?: string
          source_context?: string | null
          stage?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          follow_up_date?: string | null
          id?: string
          message?: string | null
          name?: string
          role?: string | null
          source?: string
          source_context?: string | null
          stage?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_notes: {
        Row: {
          body: string
          contact_id: string
          created_at: string
          id: string
          type: string
        }
        Insert: {
          body: string
          contact_id: string
          created_at?: string
          id?: string
          type?: string
        }
        Update: {
          body?: string
          contact_id?: string
          created_at?: string
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      gov_drafts: {
        Row: {
          context_snippet: string | null
          created_at: string
          created_by: string | null
          id: string
          summary: string
          title: string
        }
        Insert: {
          context_snippet?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          summary: string
          title: string
        }
        Update: {
          context_snippet?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          summary?: string
          title?: string
        }
        Relationships: []
      }
      gov_meeting_minutes: {
        Row: {
          attendees: string[]
          created_at: string
          created_by: string | null
          id: string
          meeting_date: string
          notes: string
          title: string
          transcript_id: string | null
          updated_at: string
        }
        Insert: {
          attendees?: string[]
          created_at?: string
          created_by?: string | null
          id?: string
          meeting_date?: string
          notes?: string
          title: string
          transcript_id?: string | null
          updated_at?: string
        }
        Update: {
          attendees?: string[]
          created_at?: string
          created_by?: string | null
          id?: string
          meeting_date?: string
          notes?: string
          title?: string
          transcript_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gov_meeting_minutes_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "gov_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      gov_members: {
        Row: {
          avatar: string
          created_at: string
          email: string | null
          id: string
          name: string
          role: string
          user_id: string | null
        }
        Insert: {
          avatar?: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          role?: string
          user_id?: string | null
        }
        Update: {
          avatar?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      gov_policies: {
        Row: {
          category: string | null
          context_snippet: string | null
          created_at: string
          created_by: string | null
          id: string
          parent_id: string | null
          passed_at: string | null
          status: Database["public"]["Enums"]["gov_policy_status"]
          summary: string
          title: string
          updated_at: string
          voting_deadline: string | null
          voting_start: string | null
        }
        Insert: {
          category?: string | null
          context_snippet?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          parent_id?: string | null
          passed_at?: string | null
          status?: Database["public"]["Enums"]["gov_policy_status"]
          summary: string
          title: string
          updated_at?: string
          voting_deadline?: string | null
          voting_start?: string | null
        }
        Update: {
          category?: string | null
          context_snippet?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          parent_id?: string | null
          passed_at?: string | null
          status?: Database["public"]["Enums"]["gov_policy_status"]
          summary?: string
          title?: string
          updated_at?: string
          voting_deadline?: string | null
          voting_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gov_policies_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "gov_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      gov_policy_likes: {
        Row: {
          created_at: string
          id: string
          policy_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          policy_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          policy_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gov_policy_likes_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "gov_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      gov_policy_votes: {
        Row: {
          created_at: string
          id: string
          policy_id: string
          updated_at: string
          user_id: string
          vote: string
        }
        Insert: {
          created_at?: string
          id?: string
          policy_id: string
          updated_at?: string
          user_id: string
          vote: string
        }
        Update: {
          created_at?: string
          id?: string
          policy_id?: string
          updated_at?: string
          user_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "gov_policy_votes_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "gov_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      gov_proposals: {
        Row: {
          author: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          policy_id: string
          title: string
        }
        Insert: {
          author?: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          policy_id: string
          title: string
        }
        Update: {
          author?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          policy_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "gov_proposals_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "gov_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      gov_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      gov_votes: {
        Row: {
          created_at: string
          id: string
          proposal_id: string
          updated_at: string
          user_id: string
          vote: Database["public"]["Enums"]["gov_vote_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          proposal_id: string
          updated_at?: string
          user_id: string
          vote: Database["public"]["Enums"]["gov_vote_type"]
        }
        Update: {
          created_at?: string
          id?: string
          proposal_id?: string
          updated_at?: string
          user_id?: string
          vote?: Database["public"]["Enums"]["gov_vote_type"]
        }
        Relationships: [
          {
            foreignKeyName: "gov_votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "gov_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_adaptation_rules: {
        Row: {
          created_at: string
          description: string
          id: string
          input_conditions: Json
          is_active: boolean
          mode_id: string
          name: string
          output_actions: Json
          priority: number
          rule_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          input_conditions?: Json
          is_active?: boolean
          mode_id: string
          name: string
          output_actions?: Json
          priority?: number
          rule_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          input_conditions?: Json
          is_active?: boolean
          mode_id?: string
          name?: string
          output_actions?: Json
          priority?: number
          rule_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mydj_adaptation_rules_mode_id_fkey"
            columns: ["mode_id"]
            isOneToOne: false
            referencedRelation: "mydj_modes"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_audio_scenes: {
        Row: {
          created_at: string
          entry_behavior: string
          exit_behavior: string
          fade_in_seconds: number | null
          fade_out_seconds: number | null
          id: string
          is_active: boolean
          location_id: string
          mode_id: string | null
          name: string
          playlist_id: string | null
          preferred_artist: string | null
          preferred_bpm_max: number | null
          preferred_bpm_min: number | null
          preferred_genre: string | null
          priority: number
          reentry_behavior: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_behavior?: string
          exit_behavior?: string
          fade_in_seconds?: number | null
          fade_out_seconds?: number | null
          id?: string
          is_active?: boolean
          location_id: string
          mode_id?: string | null
          name: string
          playlist_id?: string | null
          preferred_artist?: string | null
          preferred_bpm_max?: number | null
          preferred_bpm_min?: number | null
          preferred_genre?: string | null
          priority?: number
          reentry_behavior?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_behavior?: string
          exit_behavior?: string
          fade_in_seconds?: number | null
          fade_out_seconds?: number | null
          id?: string
          is_active?: boolean
          location_id?: string
          mode_id?: string | null
          name?: string
          playlist_id?: string | null
          preferred_artist?: string | null
          preferred_bpm_max?: number | null
          preferred_bpm_min?: number | null
          preferred_genre?: string | null
          priority?: number
          reentry_behavior?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mydj_audio_scenes_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "mydj_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mydj_audio_scenes_mode_id_fkey"
            columns: ["mode_id"]
            isOneToOne: false
            referencedRelation: "mydj_modes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mydj_audio_scenes_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "mydj_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_biometric_readings: {
        Row: {
          activity_level: string | null
          cadence: number | null
          created_at: string
          gsr: number | null
          heart_rate: number | null
          hrv: number | null
          id: string
          pace: number | null
          raw_payload: Json | null
          recorded_at: string
          respiratory_rate: number | null
          session_id: string
          skin_temperature: number | null
          sleep_duration_minutes: number | null
          sleep_score: number | null
          speed: number | null
          spo2: number | null
          steps_per_minute: number | null
          user_id: string
        }
        Insert: {
          activity_level?: string | null
          cadence?: number | null
          created_at?: string
          gsr?: number | null
          heart_rate?: number | null
          hrv?: number | null
          id?: string
          pace?: number | null
          raw_payload?: Json | null
          recorded_at?: string
          respiratory_rate?: number | null
          session_id: string
          skin_temperature?: number | null
          sleep_duration_minutes?: number | null
          sleep_score?: number | null
          speed?: number | null
          spo2?: number | null
          steps_per_minute?: number | null
          user_id: string
        }
        Update: {
          activity_level?: string | null
          cadence?: number | null
          created_at?: string
          gsr?: number | null
          heart_rate?: number | null
          hrv?: number | null
          id?: string
          pace?: number | null
          raw_payload?: Json | null
          recorded_at?: string
          respiratory_rate?: number | null
          session_id?: string
          skin_temperature?: number | null
          sleep_duration_minutes?: number | null
          sleep_score?: number | null
          speed?: number | null
          spo2?: number | null
          steps_per_minute?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mydj_biometric_readings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mydj_session_summary_view"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "mydj_biometric_readings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mydj_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_contextual_signals: {
        Row: {
          ambient_noise_level: number | null
          calendar_context: string | null
          created_at: string
          device_motion_state: string | null
          id: string
          location_type: string | null
          manual_goal_note: string | null
          manual_mood: string | null
          recorded_at: string
          session_id: string
          time_of_day_bucket: string | null
          user_id: string
          weather_context: string | null
        }
        Insert: {
          ambient_noise_level?: number | null
          calendar_context?: string | null
          created_at?: string
          device_motion_state?: string | null
          id?: string
          location_type?: string | null
          manual_goal_note?: string | null
          manual_mood?: string | null
          recorded_at?: string
          session_id: string
          time_of_day_bucket?: string | null
          user_id: string
          weather_context?: string | null
        }
        Update: {
          ambient_noise_level?: number | null
          calendar_context?: string | null
          created_at?: string
          device_motion_state?: string | null
          id?: string
          location_type?: string | null
          manual_goal_note?: string | null
          manual_mood?: string | null
          recorded_at?: string
          session_id?: string
          time_of_day_bucket?: string | null
          user_id?: string
          weather_context?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mydj_contextual_signals_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mydj_session_summary_view"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "mydj_contextual_signals_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mydj_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_location_events: {
        Row: {
          confidence_score: number | null
          created_at: string
          detected_at: string
          event_type: Database["public"]["Enums"]["mydj_location_event_type"]
          id: string
          location_id: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          detected_at?: string
          event_type: Database["public"]["Enums"]["mydj_location_event_type"]
          id?: string
          location_id: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          detected_at?: string
          event_type?: Database["public"]["Enums"]["mydj_location_event_type"]
          id?: string
          location_id?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mydj_location_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "mydj_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mydj_location_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mydj_session_summary_view"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "mydj_location_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mydj_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_locations: {
        Row: {
          beacon_id: string | null
          created_at: string
          detection_method: string
          id: string
          is_active: boolean
          latitude: number | null
          location_type: string
          longitude: number | null
          name: string
          radius_meters: number | null
          updated_at: string
          user_id: string
          wifi_signature: string | null
        }
        Insert: {
          beacon_id?: string | null
          created_at?: string
          detection_method?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          location_type?: string
          longitude?: number | null
          name: string
          radius_meters?: number | null
          updated_at?: string
          user_id: string
          wifi_signature?: string | null
        }
        Update: {
          beacon_id?: string | null
          created_at?: string
          detection_method?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          location_type?: string
          longitude?: number | null
          name?: string
          radius_meters?: number | null
          updated_at?: string
          user_id?: string
          wifi_signature?: string | null
        }
        Relationships: []
      }
      mydj_memory_associations: {
        Row: {
          created_at: string
          emotional_intent: string
          id: string
          is_active: boolean
          location_id: string | null
          memory_type: string
          note: string | null
          playlist_id: string | null
          strength_score: number
          title: string
          track_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emotional_intent?: string
          id?: string
          is_active?: boolean
          location_id?: string | null
          memory_type?: string
          note?: string | null
          playlist_id?: string | null
          strength_score?: number
          title: string
          track_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emotional_intent?: string
          id?: string
          is_active?: boolean
          location_id?: string | null
          memory_type?: string
          note?: string | null
          playlist_id?: string | null
          strength_score?: number
          title?: string
          track_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mydj_memory_associations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "mydj_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mydj_memory_associations_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "mydj_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mydj_memory_associations_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "mydj_music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_modes: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          strategy_type: Database["public"]["Enums"]["mydj_strategy_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          strategy_type?: Database["public"]["Enums"]["mydj_strategy_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          strategy_type?: Database["public"]["Enums"]["mydj_strategy_type"]
          updated_at?: string
        }
        Relationships: []
      }
      mydj_music_provider_connections: {
        Row: {
          access_token_ref: string | null
          created_at: string
          external_user_id: string | null
          id: string
          provider: string
          refresh_token_ref: string | null
          status: Database["public"]["Enums"]["mydj_connection_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_ref?: string | null
          created_at?: string
          external_user_id?: string | null
          id?: string
          provider: string
          refresh_token_ref?: string | null
          status?: Database["public"]["Enums"]["mydj_connection_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_ref?: string | null
          created_at?: string
          external_user_id?: string | null
          id?: string
          provider?: string
          refresh_token_ref?: string | null
          status?: Database["public"]["Enums"]["mydj_connection_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mydj_music_tracks: {
        Row: {
          acousticness: number | null
          album_name: string | null
          artist_name: string
          bpm: number | null
          created_at: string
          danceability: number | null
          duration_ms: number | null
          energy: number | null
          external_track_id: string
          familiarity_score: number | null
          id: string
          instrumentalness: number | null
          liveness: number | null
          loudness: number | null
          metadata_json: Json | null
          mode_major_minor: string | null
          musical_key: string | null
          popularity: number | null
          provider: string
          speechiness: number | null
          title: string
          updated_at: string
          valence: number | null
        }
        Insert: {
          acousticness?: number | null
          album_name?: string | null
          artist_name: string
          bpm?: number | null
          created_at?: string
          danceability?: number | null
          duration_ms?: number | null
          energy?: number | null
          external_track_id: string
          familiarity_score?: number | null
          id?: string
          instrumentalness?: number | null
          liveness?: number | null
          loudness?: number | null
          metadata_json?: Json | null
          mode_major_minor?: string | null
          musical_key?: string | null
          popularity?: number | null
          provider?: string
          speechiness?: number | null
          title: string
          updated_at?: string
          valence?: number | null
        }
        Update: {
          acousticness?: number | null
          album_name?: string | null
          artist_name?: string
          bpm?: number | null
          created_at?: string
          danceability?: number | null
          duration_ms?: number | null
          energy?: number | null
          external_track_id?: string
          familiarity_score?: number | null
          id?: string
          instrumentalness?: number | null
          liveness?: number | null
          loudness?: number | null
          metadata_json?: Json | null
          mode_major_minor?: string | null
          musical_key?: string | null
          popularity?: number | null
          provider?: string
          speechiness?: number | null
          title?: string
          updated_at?: string
          valence?: number | null
        }
        Relationships: []
      }
      mydj_personalization_feedback: {
        Row: {
          created_at: string
          feedback_type: Database["public"]["Enums"]["mydj_feedback_type"]
          feedback_value: number | null
          id: string
          note: string | null
          session_id: string | null
          track_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_type: Database["public"]["Enums"]["mydj_feedback_type"]
          feedback_value?: number | null
          id?: string
          note?: string | null
          session_id?: string | null
          track_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_type?: Database["public"]["Enums"]["mydj_feedback_type"]
          feedback_value?: number | null
          id?: string
          note?: string | null
          session_id?: string | null
          track_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mydj_personalization_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mydj_session_summary_view"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "mydj_personalization_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mydj_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mydj_personalization_feedback_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "mydj_music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_playback_context: {
        Row: {
          created_at: string
          id: string
          last_event_at: string
          location_id: string
          playback_position_ms: number | null
          playback_status: Database["public"]["Enums"]["mydj_playback_status"]
          playlist_id: string | null
          scene_id: string | null
          track_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_event_at?: string
          location_id: string
          playback_position_ms?: number | null
          playback_status?: Database["public"]["Enums"]["mydj_playback_status"]
          playlist_id?: string | null
          scene_id?: string | null
          track_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_event_at?: string
          location_id?: string
          playback_position_ms?: number | null
          playback_status?: Database["public"]["Enums"]["mydj_playback_status"]
          playlist_id?: string | null
          scene_id?: string | null
          track_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mydj_playback_context_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "mydj_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mydj_playback_context_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "mydj_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mydj_playback_context_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "mydj_audio_scenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mydj_playback_context_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "mydj_music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_playlist_tracks: {
        Row: {
          created_at: string
          id: string
          playlist_id: string
          sequence_number: number
          target_bpm_alignment: number | null
          track_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          playlist_id: string
          sequence_number: number
          target_bpm_alignment?: number | null
          track_id: string
        }
        Update: {
          created_at?: string
          id?: string
          playlist_id?: string
          sequence_number?: number
          target_bpm_alignment?: number | null
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mydj_playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "mydj_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mydj_playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "mydj_music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_playlists: {
        Row: {
          created_at: string
          description: string | null
          external_playlist_id: string | null
          id: string
          is_dynamic: boolean
          mode_id: string | null
          name: string
          playlist_type: Database["public"]["Enums"]["mydj_playlist_type"]
          provider: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_playlist_id?: string | null
          id?: string
          is_dynamic?: boolean
          mode_id?: string | null
          name: string
          playlist_type?: Database["public"]["Enums"]["mydj_playlist_type"]
          provider?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          external_playlist_id?: string | null
          id?: string
          is_dynamic?: boolean
          mode_id?: string | null
          name?: string
          playlist_type?: Database["public"]["Enums"]["mydj_playlist_type"]
          provider?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mydj_playlists_mode_id_fkey"
            columns: ["mode_id"]
            isOneToOne: false
            referencedRelation: "mydj_modes"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_profiles: {
        Row: {
          allow_adaptive_changes: boolean
          created_at: string
          default_mode_id: string | null
          display_name: string | null
          hrv_baseline: number | null
          id: string
          onboarding_completed: boolean
          personalization_level: string
          preferred_energy_max: number | null
          preferred_energy_min: number | null
          preferred_music_service: string | null
          resting_hr_baseline: number | null
          sleep_baseline_hours: number | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_adaptive_changes?: boolean
          created_at?: string
          default_mode_id?: string | null
          display_name?: string | null
          hrv_baseline?: number | null
          id?: string
          onboarding_completed?: boolean
          personalization_level?: string
          preferred_energy_max?: number | null
          preferred_energy_min?: number | null
          preferred_music_service?: string | null
          resting_hr_baseline?: number | null
          sleep_baseline_hours?: number | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_adaptive_changes?: boolean
          created_at?: string
          default_mode_id?: string | null
          display_name?: string | null
          hrv_baseline?: number | null
          id?: string
          onboarding_completed?: boolean
          personalization_level?: string
          preferred_energy_max?: number | null
          preferred_energy_min?: number | null
          preferred_music_service?: string | null
          resting_hr_baseline?: number | null
          sleep_baseline_hours?: number | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mydj_profiles_default_mode_id_fkey"
            columns: ["default_mode_id"]
            isOneToOne: false
            referencedRelation: "mydj_modes"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_session_music_events: {
        Row: {
          bpm_at_selection: number | null
          created_at: string
          energy_at_selection: number | null
          event_type: Database["public"]["Enums"]["mydj_music_event_type"]
          id: string
          played_at: string
          selection_reason: string | null
          session_id: string
          source_rule_id: string | null
          stopped_at: string | null
          target_state_label: string | null
          track_id: string
        }
        Insert: {
          bpm_at_selection?: number | null
          created_at?: string
          energy_at_selection?: number | null
          event_type?: Database["public"]["Enums"]["mydj_music_event_type"]
          id?: string
          played_at?: string
          selection_reason?: string | null
          session_id: string
          source_rule_id?: string | null
          stopped_at?: string | null
          target_state_label?: string | null
          track_id: string
        }
        Update: {
          bpm_at_selection?: number | null
          created_at?: string
          energy_at_selection?: number | null
          event_type?: Database["public"]["Enums"]["mydj_music_event_type"]
          id?: string
          played_at?: string
          selection_reason?: string | null
          session_id?: string
          source_rule_id?: string | null
          stopped_at?: string | null
          target_state_label?: string | null
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mydj_session_music_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mydj_session_summary_view"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "mydj_session_music_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mydj_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mydj_session_music_events_source_rule_id_fkey"
            columns: ["source_rule_id"]
            isOneToOne: false
            referencedRelation: "mydj_adaptation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mydj_session_music_events_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "mydj_music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_session_outcomes: {
        Row: {
          completion_score: number | null
          created_at: string
          duration_minutes: number | null
          effectiveness_score: number | null
          hr_change: number | null
          hr_end: number | null
          hr_start: number | null
          hrv_change: number | null
          hrv_end: number | null
          hrv_start: number | null
          id: string
          outcome_notes: string | null
          session_id: string
          target_state_reached: boolean | null
          updated_at: string
          user_id: string
          user_rating: number | null
        }
        Insert: {
          completion_score?: number | null
          created_at?: string
          duration_minutes?: number | null
          effectiveness_score?: number | null
          hr_change?: number | null
          hr_end?: number | null
          hr_start?: number | null
          hrv_change?: number | null
          hrv_end?: number | null
          hrv_start?: number | null
          id?: string
          outcome_notes?: string | null
          session_id: string
          target_state_reached?: boolean | null
          updated_at?: string
          user_id: string
          user_rating?: number | null
        }
        Update: {
          completion_score?: number | null
          created_at?: string
          duration_minutes?: number | null
          effectiveness_score?: number | null
          hr_change?: number | null
          hr_end?: number | null
          hr_start?: number | null
          hrv_change?: number | null
          hrv_end?: number | null
          hrv_start?: number | null
          id?: string
          outcome_notes?: string | null
          session_id?: string
          target_state_reached?: boolean | null
          updated_at?: string
          user_id?: string
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mydj_session_outcomes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "mydj_session_summary_view"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "mydj_session_outcomes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "mydj_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_sessions: {
        Row: {
          activity_type: Database["public"]["Enums"]["mydj_activity_type"]
          created_at: string
          current_state_id: string | null
          ended_at: string | null
          id: string
          intensity_preference: number | null
          mode_id: string
          notes: string | null
          source_context: string
          started_at: string
          status: Database["public"]["Enums"]["mydj_session_status"]
          target_state_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type?: Database["public"]["Enums"]["mydj_activity_type"]
          created_at?: string
          current_state_id?: string | null
          ended_at?: string | null
          id?: string
          intensity_preference?: number | null
          mode_id: string
          notes?: string | null
          source_context?: string
          started_at?: string
          status?: Database["public"]["Enums"]["mydj_session_status"]
          target_state_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["mydj_activity_type"]
          created_at?: string
          current_state_id?: string | null
          ended_at?: string | null
          id?: string
          intensity_preference?: number | null
          mode_id?: string
          notes?: string | null
          source_context?: string
          started_at?: string
          status?: Database["public"]["Enums"]["mydj_session_status"]
          target_state_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mydj_sessions_current_state_id_fkey"
            columns: ["current_state_id"]
            isOneToOne: false
            referencedRelation: "mydj_state_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mydj_sessions_mode_id_fkey"
            columns: ["mode_id"]
            isOneToOne: false
            referencedRelation: "mydj_modes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mydj_sessions_target_state_id_fkey"
            columns: ["target_state_id"]
            isOneToOne: false
            referencedRelation: "mydj_state_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_state_definitions: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      mydj_track_feedback: {
        Row: {
          alignment_score: number
          bio_cadence: number
          bio_heart_rate: number
          bio_hrv: number
          bio_physio_state: string
          bio_sleep_score: number
          bio_stress: number
          created_at: string
          feedback: string
          id: string
          mode: string
          music_bpm: number
          music_energy: number
          music_harmonic_tension: number
          music_intensity: number
          music_rhythm_density: number
          music_vocal_presence: number
          session_id: string | null
          strategy: string
          track_artist: string
          track_genre: string
          track_title: string
          track_url: string
          user_id: string | null
        }
        Insert: {
          alignment_score?: number
          bio_cadence: number
          bio_heart_rate: number
          bio_hrv: number
          bio_physio_state: string
          bio_sleep_score: number
          bio_stress: number
          created_at?: string
          feedback: string
          id?: string
          mode: string
          music_bpm: number
          music_energy: number
          music_harmonic_tension: number
          music_intensity: number
          music_rhythm_density: number
          music_vocal_presence: number
          session_id?: string | null
          strategy?: string
          track_artist: string
          track_genre: string
          track_title: string
          track_url: string
          user_id?: string | null
        }
        Update: {
          alignment_score?: number
          bio_cadence?: number
          bio_heart_rate?: number
          bio_hrv?: number
          bio_physio_state?: string
          bio_sleep_score?: number
          bio_stress?: number
          created_at?: string
          feedback?: string
          id?: string
          mode?: string
          music_bpm?: number
          music_energy?: number
          music_harmonic_tension?: number
          music_intensity?: number
          music_rhythm_density?: number
          music_vocal_presence?: number
          session_id?: string | null
          strategy?: string
          track_artist?: string
          track_genre?: string
          track_title?: string
          track_url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mydj_user_mode_preferences: {
        Row: {
          created_at: string
          id: string
          mode_id: string
          preferred_bpm_max: number | null
          preferred_bpm_min: number | null
          preferred_energy_max: number | null
          preferred_energy_min: number | null
          preferred_familiarity_bias: number | null
          preferred_vocal_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mode_id: string
          preferred_bpm_max?: number | null
          preferred_bpm_min?: number | null
          preferred_energy_max?: number | null
          preferred_energy_min?: number | null
          preferred_familiarity_bias?: number | null
          preferred_vocal_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mode_id?: string
          preferred_bpm_max?: number | null
          preferred_bpm_min?: number | null
          preferred_energy_max?: number | null
          preferred_energy_min?: number | null
          preferred_familiarity_bias?: number | null
          preferred_vocal_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mydj_user_mode_preferences_mode_id_fkey"
            columns: ["mode_id"]
            isOneToOne: false
            referencedRelation: "mydj_modes"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_user_track_preferences: {
        Row: {
          affinity_score: number
          created_at: string
          familiarity_score: number
          id: string
          last_interacted_at: string | null
          total_completions: number
          total_likes: number
          total_skips: number
          track_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affinity_score?: number
          created_at?: string
          familiarity_score?: number
          id?: string
          last_interacted_at?: string | null
          total_completions?: number
          total_likes?: number
          total_skips?: number
          track_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affinity_score?: number
          created_at?: string
          familiarity_score?: number
          id?: string
          last_interacted_at?: string | null
          total_completions?: number
          total_likes?: number
          total_skips?: number
          track_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mydj_user_track_preferences_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "mydj_music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      mydj_wearable_connections: {
        Row: {
          access_token_ref: string | null
          created_at: string
          external_user_id: string | null
          id: string
          last_synced_at: string | null
          provider: string
          refresh_token_ref: string | null
          status: Database["public"]["Enums"]["mydj_connection_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_ref?: string | null
          created_at?: string
          external_user_id?: string | null
          id?: string
          last_synced_at?: string | null
          provider: string
          refresh_token_ref?: string | null
          status?: Database["public"]["Enums"]["mydj_connection_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_ref?: string | null
          created_at?: string
          external_user_id?: string | null
          id?: string
          last_synced_at?: string | null
          provider?: string
          refresh_token_ref?: string | null
          status?: Database["public"]["Enums"]["mydj_connection_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      rss_feeds: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          url?: string
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
      wobuddy_achievements: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          title: string
          unlocked: boolean
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          title: string
          unlocked?: boolean
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          title?: string
          unlocked?: boolean
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wobuddy_activity_enrichments: {
        Row: {
          activity_name: string
          created_at: string | null
          driver_name: string
          explanation: string | null
          id: string
          target_suggestion: string | null
          training_purpose: string | null
        }
        Insert: {
          activity_name: string
          created_at?: string | null
          driver_name: string
          explanation?: string | null
          id?: string
          target_suggestion?: string | null
          training_purpose?: string | null
        }
        Update: {
          activity_name?: string
          created_at?: string | null
          driver_name?: string
          explanation?: string | null
          id?: string
          target_suggestion?: string | null
          training_purpose?: string | null
        }
        Relationships: []
      }
      wobuddy_competition_participants: {
        Row: {
          competition_id: string
          id: string
          joined_at: string
          progress: number
          user_id: string
        }
        Insert: {
          competition_id: string
          id?: string
          joined_at?: string
          progress?: number
          user_id: string
        }
        Update: {
          competition_id?: string
          id?: string
          joined_at?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wobuddy_competition_participants_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "wobuddy_competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      wobuddy_competitions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          target: number
          time_remaining: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          target: number
          time_remaining?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          target?: number
          time_remaining?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      wobuddy_exercises: {
        Row: {
          confidence: number | null
          created_at: string
          distance_km: number | null
          duration_seconds: number
          id: string
          name: string
          reps: number
          sets: number
          timestamp: string
          type: string
          user_id: string
          weight_lbs: number | null
          workout_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          distance_km?: number | null
          duration_seconds?: number
          id?: string
          name: string
          reps?: number
          sets?: number
          timestamp?: string
          type: string
          user_id: string
          weight_lbs?: number | null
          workout_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          distance_km?: number | null
          duration_seconds?: number
          id?: string
          name?: string
          reps?: number
          sets?: number
          timestamp?: string
          type?: string
          user_id?: string
          weight_lbs?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wobuddy_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "wobuddy_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      wobuddy_goal_drivers: {
        Row: {
          driver_id: string
          goal_id: string
          id: string
        }
        Insert: {
          driver_id: string
          goal_id: string
          id?: string
        }
        Update: {
          driver_id?: string
          goal_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wobuddy_goal_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "wobuddy_performance_drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wobuddy_goal_drivers_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "wobuddy_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      wobuddy_goals: {
        Row: {
          category: string
          created_at: string | null
          current_value: number | null
          deadline: string | null
          id: string
          metric: string
          name: string
          status: string | null
          target_value: number
          timeframe: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          id?: string
          metric?: string
          name: string
          status?: string | null
          target_value: number
          timeframe?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          id?: string
          metric?: string
          name?: string
          status?: string | null
          target_value?: number
          timeframe?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wobuddy_performance_drivers: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      wobuddy_plan_days: {
        Row: {
          created_at: string
          day_of_week: number
          exercises: Json
          focus_drivers: string[]
          id: string
          notes: string | null
          plan_id: string
          workout_type: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          exercises?: Json
          focus_drivers?: string[]
          id?: string
          notes?: string | null
          plan_id: string
          workout_type?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          exercises?: Json
          focus_drivers?: string[]
          id?: string
          notes?: string | null
          plan_id?: string
          workout_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wobuddy_plan_days_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "wobuddy_workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      wobuddy_profiles: {
        Row: {
          avatar_initials: string
          avatar_url: string | null
          background_url: string | null
          birthdate: string | null
          body_fat_pct: number | null
          created_at: string
          daily_goal: number
          display_name: string
          ethnicity: string | null
          gender: string | null
          goal_weight_kg: number | null
          height_cm: number | null
          id: string
          resting_hr: number | null
          updated_at: string
          user_id: string
          weekly_goal: number
          weight_kg: number | null
        }
        Insert: {
          avatar_initials?: string
          avatar_url?: string | null
          background_url?: string | null
          birthdate?: string | null
          body_fat_pct?: number | null
          created_at?: string
          daily_goal?: number
          display_name?: string
          ethnicity?: string | null
          gender?: string | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: string
          resting_hr?: number | null
          updated_at?: string
          user_id: string
          weekly_goal?: number
          weight_kg?: number | null
        }
        Update: {
          avatar_initials?: string
          avatar_url?: string | null
          background_url?: string | null
          birthdate?: string | null
          body_fat_pct?: number | null
          created_at?: string
          daily_goal?: number
          display_name?: string
          ethnicity?: string | null
          gender?: string | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: string
          resting_hr?: number | null
          updated_at?: string
          user_id?: string
          weekly_goal?: number
          weight_kg?: number | null
        }
        Relationships: []
      }
      wobuddy_workout_plans: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      wobuddy_workouts: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          mode: string
          started_at: string
          total_score: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          mode: string
          started_at?: string
          total_score?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          mode?: string
          started_at?: string
          total_score?: number
          user_id?: string
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
      mydj_session_summary_view: {
        Row: {
          activity_type:
            | Database["public"]["Enums"]["mydj_activity_type"]
            | null
          current_state_name: string | null
          duration_minutes: number | null
          effectiveness_score: number | null
          ended_at: string | null
          hr_change: number | null
          hr_end: number | null
          hr_start: number | null
          hrv_change: number | null
          intensity_preference: number | null
          mode_name: string | null
          session_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["mydj_session_status"] | null
          strategy_type:
            | Database["public"]["Enums"]["mydj_strategy_type"]
            | null
          target_state_name: string | null
          target_state_reached: boolean | null
          user_id: string | null
          user_rating: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      gov_phase: "visioning" | "drafting" | "community-review" | "finalized"
      gov_policy_status:
        | "draft"
        | "active"
        | "under-revision"
        | "archived"
        | "commenting"
        | "voting"
        | "passed"
      gov_vote_type: "agree" | "abstain" | "disagree" | "block"
      mydj_activity_type:
        | "work"
        | "run"
        | "gym"
        | "relax"
        | "sleep_prep"
        | "commute"
        | "other"
      mydj_connection_status: "active" | "expired" | "disconnected"
      mydj_feedback_type:
        | "like"
        | "dislike"
        | "skip"
        | "replay"
        | "helpful"
        | "not_helpful"
      mydj_location_event_type: "entered" | "exited" | "reentered" | "dwell"
      mydj_music_event_type:
        | "started"
        | "skipped"
        | "completed"
        | "auto_switched"
        | "user_selected"
      mydj_playback_status: "playing" | "paused" | "stopped"
      mydj_playlist_type:
        | "generated"
        | "saved"
        | "recovery"
        | "workout"
        | "focus"
        | "other"
      mydj_session_status: "active" | "completed" | "cancelled"
      mydj_strategy_type: "mirror" | "counterbalance" | "hybrid"
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
      gov_phase: ["visioning", "drafting", "community-review", "finalized"],
      gov_policy_status: [
        "draft",
        "active",
        "under-revision",
        "archived",
        "commenting",
        "voting",
        "passed",
      ],
      gov_vote_type: ["agree", "abstain", "disagree", "block"],
      mydj_activity_type: [
        "work",
        "run",
        "gym",
        "relax",
        "sleep_prep",
        "commute",
        "other",
      ],
      mydj_connection_status: ["active", "expired", "disconnected"],
      mydj_feedback_type: [
        "like",
        "dislike",
        "skip",
        "replay",
        "helpful",
        "not_helpful",
      ],
      mydj_location_event_type: ["entered", "exited", "reentered", "dwell"],
      mydj_music_event_type: [
        "started",
        "skipped",
        "completed",
        "auto_switched",
        "user_selected",
      ],
      mydj_playback_status: ["playing", "paused", "stopped"],
      mydj_playlist_type: [
        "generated",
        "saved",
        "recovery",
        "workout",
        "focus",
        "other",
      ],
      mydj_session_status: ["active", "completed", "cancelled"],
      mydj_strategy_type: ["mirror", "counterbalance", "hybrid"],
      schedule_role: ["hacker", "sponsor", "press", "mentor", "organizer"],
    },
  },
} as const
