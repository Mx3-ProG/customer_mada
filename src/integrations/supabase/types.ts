export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null;
          business_since: string | null;
          charges: number;
          charges_frequency: string;
          cost_price: number;
          cost_price_frequency: string;
          created_at: string;
          email: string | null;
          entry_date: string;
          google_business: string | null;
          headquarters: string | null;
          id: string;
          last_interaction_at: string | null;
          last_payment_at: string | null;
          name: string;
          next_payment_due: string | null;
          notes: string | null;
          phone: string | null;
          product: string | null;
          real_need: string | null;
          sale_price: number;
          sale_price_frequency: string;
          sector: string | null;
          siret: string | null;
          social_links: string | null;
          updated_at: string;
          user_id: string;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          business_since?: string | null;
          charges?: number;
          charges_frequency?: string;
          cost_price?: number;
          cost_price_frequency?: string;
          created_at?: string;
          email?: string | null;
          entry_date?: string;
          google_business?: string | null;
          headquarters?: string | null;
          id?: string;
          last_interaction_at?: string | null;
          last_payment_at?: string | null;
          name: string;
          next_payment_due?: string | null;
          notes?: string | null;
          phone?: string | null;
          product?: string | null;
          real_need?: string | null;
          sale_price?: number;
          sale_price_frequency?: string;
          sector?: string | null;
          siret?: string | null;
          social_links?: string | null;
          updated_at?: string;
          user_id?: string;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          business_since?: string | null;
          charges?: number;
          charges_frequency?: string;
          cost_price?: number;
          cost_price_frequency?: string;
          created_at?: string;
          email?: string | null;
          entry_date?: string;
          google_business?: string | null;
          headquarters?: string | null;
          id?: string;
          last_interaction_at?: string | null;
          last_payment_at?: string | null;
          name?: string;
          next_payment_due?: string | null;
          notes?: string | null;
          phone?: string | null;
          product?: string | null;
          real_need?: string | null;
          sale_price?: number;
          sale_price_frequency?: string;
          sector?: string | null;
          siret?: string | null;
          social_links?: string | null;
          updated_at?: string;
          user_id?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      score_settings: {
        Row: {
          alarm_threshold: number;
          created_at: string;
          id: string;
          interaction_days_per_point: number;
          interaction_grace_days: number;
          interaction_max_penalty: number;
          interaction_missing_penalty: number;
          loyalty_bonus: number;
          loyalty_days: number;
          margin_good_rate: number;
          margin_low_penalty: number;
          margin_negative_penalty: number;
          margin_ok_penalty: number;
          margin_ok_rate: number;
          monthly_payment_bonus: number;
          no_payment_after_days: number;
          no_payment_penalty: number;
          no_price_penalty: number;
          overdue_max_penalty: number;
          overdue_points_per_day: number;
          risk_threshold: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          alarm_threshold?: number;
          created_at?: string;
          id?: string;
          interaction_days_per_point?: number;
          interaction_grace_days?: number;
          interaction_max_penalty?: number;
          interaction_missing_penalty?: number;
          loyalty_bonus?: number;
          loyalty_days?: number;
          margin_good_rate?: number;
          margin_low_penalty?: number;
          margin_negative_penalty?: number;
          margin_ok_penalty?: number;
          margin_ok_rate?: number;
          monthly_payment_bonus?: number;
          no_payment_after_days?: number;
          no_payment_penalty?: number;
          no_price_penalty?: number;
          overdue_max_penalty?: number;
          overdue_points_per_day?: number;
          risk_threshold?: number;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          alarm_threshold?: number;
          created_at?: string;
          id?: string;
          interaction_days_per_point?: number;
          interaction_grace_days?: number;
          interaction_max_penalty?: number;
          interaction_missing_penalty?: number;
          loyalty_bonus?: number;
          loyalty_days?: number;
          margin_good_rate?: number;
          margin_low_penalty?: number;
          margin_negative_penalty?: number;
          margin_ok_penalty?: number;
          margin_ok_rate?: number;
          monthly_payment_bonus?: number;
          no_payment_after_days?: number;
          no_payment_penalty?: number;
          no_price_penalty?: number;
          overdue_max_penalty?: number;
          overdue_points_per_day?: number;
          risk_threshold?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean;
          created_at: string;
          current_period_end: string | null;
          id: string;
          plan: string;
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          plan?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          plan?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      team_invitations: {
        Row: {
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          role: Database["public"]["Enums"]["team_role"];
          status: string;
          team_id: string;
          token: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          role?: Database["public"]["Enums"]["team_role"];
          status?: string;
          team_id: string;
          token?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          role?: Database["public"]["Enums"]["team_role"];
          status?: string;
          team_id?: string;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      team_members: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["team_role"];
          team_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["team_role"];
          team_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["team_role"];
          team_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      teams: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          owner_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_id?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_team_member: {
        Args: { _team: string; _user: string };
        Returns: boolean;
      };
      is_team_moderator: {
        Args: { _team: string; _user: string };
        Returns: boolean;
      };
      shares_team_with_owner: {
        Args: { _owner: string; _viewer: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "superadmin" | "user";
      team_role: "moderator" | "employee";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["superadmin", "user"],
      team_role: ["moderator", "employee"],
    },
  },
} as const;
