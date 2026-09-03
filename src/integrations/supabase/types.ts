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
      activity_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          summary: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          summary?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          summary?: string | null
        }
        Relationships: []
      }
      change_request_comments: {
        Row: {
          author_side: string
          author_user_id: string
          body: string
          change_request_id: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          author_side: string
          author_user_id: string
          body: string
          change_request_id: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          author_side?: string
          author_user_id?: string
          body?: string
          change_request_id?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_request_comments_change_request_id_fkey"
            columns: ["change_request_id"]
            isOneToOne: false
            referencedRelation: "change_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      change_requests: {
        Row: {
          client_approved_at: string | null
          client_approved_by: string | null
          client_id: string
          created_at: string
          description: string | null
          id: string
          owner_user_id: string | null
          package_id: string | null
          priority: Database["public"]["Enums"]["priority_level"]
          status: Database["public"]["Enums"]["change_status"]
          submitted_at: string
          title: string
          updated_at: string
        }
        Insert: {
          client_approved_at?: string | null
          client_approved_by?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          owner_user_id?: string | null
          package_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["change_status"]
          submitted_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          client_approved_at?: string | null
          client_approved_by?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          owner_user_id?: string | null
          package_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["change_status"]
          submitted_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_requests_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          id: string
          caller_name: string
          caller_phone: string | null
          caller_email: string | null
          booking_type: Database["public"]["Enums"]["booking_type"]
          scheduled_at: string
          duration_minutes: number
          status: Database["public"]["Enums"]["booking_status"]
          notes: string | null
          source: Database["public"]["Enums"]["booking_source"]
          retell_call_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          caller_name: string
          caller_phone?: string | null
          caller_email?: string | null
          booking_type?: Database["public"]["Enums"]["booking_type"]
          scheduled_at: string
          duration_minutes?: number
          status?: Database["public"]["Enums"]["booking_status"]
          notes?: string | null
          source?: Database["public"]["Enums"]["booking_source"]
          retell_call_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          caller_name?: string
          caller_phone?: string | null
          caller_email?: string | null
          booking_type?: Database["public"]["Enums"]["booking_type"]
          scheduled_at?: string
          duration_minutes?: number
          status?: Database["public"]["Enums"]["booking_status"]
          notes?: string | null
          source?: Database["public"]["Enums"]["booking_source"]
          retell_call_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          contact_name: string | null
          created_at: string
          email: string | null
          health: Database["public"]["Enums"]["health_level"]
          id: string
          joined_at: string
          mrr_cents: number
          name: string
          notes: string | null
          plan: string | null
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          email?: string | null
          health?: Database["public"]["Enums"]["health_level"]
          id?: string
          joined_at?: string
          mrr_cents?: number
          name: string
          notes?: string | null
          plan?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          email?: string | null
          health?: Database["public"]["Enums"]["health_level"]
          id?: string
          joined_at?: string
          mrr_cents?: number
          name?: string
          notes?: string | null
          plan?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_cents: number
          client_id: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          due_at: string | null
          environment: string
          hosted_url: string | null
          id: string
          invoice_type: Database["public"]["Enums"]["invoice_type"]
          issued_at: string
          line_items: Json
          number: string
          package_id: string | null
          paid_at: string | null
          pdf_url: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          due_at?: string | null
          environment?: string
          hosted_url?: string | null
          id?: string
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          issued_at?: string
          line_items?: Json
          number: string
          package_id?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          due_at?: string | null
          environment?: string
          hosted_url?: string | null
          id?: string
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          issued_at?: string
          line_items?: Json
          number?: string
          package_id?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          assigned_to: string | null
          client_id: string
          created_at: string
          id: string
          last_message_at: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id: string
          created_at?: string
          id?: string
          last_message_at?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string
          created_at?: string
          id?: string
          last_message_at?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          sender_side: string
          sender_user_id: string | null
          thread_id: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_side: string
          sender_user_id?: string | null
          thread_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_side?: string
          sender_user_id?: string | null
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      package_update_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          update_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          update_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          update_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_update_attachments_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "package_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      package_update_reads: {
        Row: {
          read_at: string
          update_id: string
          user_id: string
        }
        Insert: {
          read_at?: string
          update_id: string
          user_id: string
        }
        Update: {
          read_at?: string
          update_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_update_reads_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "package_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      package_updates: {
        Row: {
          author_user_id: string
          body: string
          created_at: string
          edited_at: string | null
          id: string
          package_id: string
          progress_change: number | null
          status_change: Database["public"]["Enums"]["package_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_user_id: string
          body?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          package_id: string
          progress_change?: number | null
          status_change?: Database["public"]["Enums"]["package_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_user_id?: string
          body?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          package_id?: string
          progress_change?: number | null
          status_change?: Database["public"]["Enums"]["package_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_updates_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          accent: string
          client_id: string
          created_at: string
          custom_id: string | null
          due_date: string | null
          engineer: string | null
          id: string
          is_custom: boolean
          name: string
          nickname: string | null
          progress: number
          status: Database["public"]["Enums"]["package_status"]
          tier: string | null
          updated_at: string
        }
        Insert: {
          accent?: string
          client_id: string
          created_at?: string
          custom_id?: string | null
          due_date?: string | null
          engineer?: string | null
          id?: string
          is_custom?: boolean
          name: string
          nickname?: string | null
          progress?: number
          status?: Database["public"]["Enums"]["package_status"]
          tier?: string | null
          updated_at?: string
        }
        Update: {
          accent?: string
          client_id?: string
          created_at?: string
          custom_id?: string | null
          due_date?: string | null
          engineer?: string | null
          id?: string
          is_custom?: boolean
          name?: string
          nickname?: string | null
          progress?: number
          status?: Database["public"]["Enums"]["package_status"]
          tier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          avatar_url: string | null
          business_name: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_cents: number
          client_id: string | null
          created_at: string | null
          currency: string
          environment: string
          id: string
          metadata: Json
          package_id: string | null
          price_id: string
          product_id: string
          purchase_kind: string
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          client_id?: string | null
          created_at?: string | null
          currency?: string
          environment?: string
          id?: string
          metadata?: Json
          package_id?: string | null
          price_id: string
          product_id: string
          purchase_kind?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          client_id?: string | null
          created_at?: string | null
          currency?: string
          environment?: string
          id?: string
          metadata?: Json
          package_id?: string | null
          price_id?: string
          product_id?: string
          purchase_kind?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          client_id: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          tier: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          client_id?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          tier?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          client_id?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          tier?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
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
      workspace_settings: {
        Row: {
          created_at: string
          id: string
          singleton: boolean
          slack_channel_change_requests: string | null
          slack_channel_clients: string | null
          slack_channel_default: string | null
          slack_channel_invoices: string | null
          slack_channel_messages: string | null
          slack_channel_payments: string | null
          slack_webhook: string | null
          support_email: string | null
          updated_at: string
          workspace_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          singleton?: boolean
          slack_channel_change_requests?: string | null
          slack_channel_clients?: string | null
          slack_channel_default?: string | null
          slack_channel_invoices?: string | null
          slack_channel_messages?: string | null
          slack_channel_payments?: string | null
          slack_webhook?: string | null
          support_email?: string | null
          updated_at?: string
          workspace_name?: string
        }
        Update: {
          created_at?: string
          id?: string
          singleton?: boolean
          slack_channel_change_requests?: string | null
          slack_channel_clients?: string | null
          slack_channel_default?: string | null
          slack_channel_invoices?: string | null
          slack_channel_messages?: string | null
          slack_channel_payments?: string | null
          slack_webhook?: string | null
          support_email?: string | null
          updated_at?: string
          workspace_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      change_request_belongs_to_user: {
        Args: { _change_request_id: string; _user_id: string }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      derive_customer_name: {
        Args: { _profile: Database["public"]["Tables"]["profiles"]["Row"] }
        Returns: string
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_user_client_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_client_owner: {
        Args: { _client_id: string; _user_id: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      package_belongs_to_user: {
        Args: { _package_id: string; _user_id: string }
        Returns: boolean
      }
      package_update_belongs_to_user: {
        Args: { _update_id: string; _user_id: string }
        Returns: boolean
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      thread_belongs_to_user: {
        Args: { _thread_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_type: "individual" | "business"
      app_role: "admin" | "user" | "support"
      booking_source: "retell_ai" | "manual" | "website"
      booking_status: "confirmed" | "pending" | "completed" | "cancelled" | "no_show"
      booking_type: "discovery" | "strategy" | "onboarding" | "support" | "other"
      change_status: "new" | "in_review" | "shipped"
      client_status: "active" | "onboarding" | "paused" | "churned"
      health_level: "healthy" | "watch" | "at_risk"
      invoice_status:
        | "paid"
        | "due"
        | "overdue"
        | "draft"
        | "sent"
        | "void"
        | "refunded"
        | "partially_refunded"
      invoice_type: "one_time" | "recurring"
      package_status:
        | "active"
        | "in_progress"
        | "review"
        | "paused"
        | "inactive"
      priority_level: "low" | "med" | "high"
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
      account_type: ["individual", "business"],
      app_role: ["admin", "user", "support"],
      booking_source: ["retell_ai", "manual", "website"],
      booking_status: ["confirmed", "pending", "completed", "cancelled", "no_show"],
      booking_type: ["discovery", "strategy", "onboarding", "support", "other"],
      change_status: ["new", "in_review", "shipped"],
      client_status: ["active", "onboarding", "paused", "churned"],
      health_level: ["healthy", "watch", "at_risk"],
      invoice_status: [
        "paid",
        "due",
        "overdue",
        "draft",
        "sent",
        "void",
        "refunded",
        "partially_refunded",
      ],
      invoice_type: ["one_time", "recurring"],
      package_status: ["active", "in_progress", "review", "paused", "inactive"],
      priority_level: ["low", "med", "high"],
    },
  },
} as const
