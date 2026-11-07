
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "ai_calls": {
                  Row: {
                    "cache_read_tokens": number,"cache_write_tokens": number,"cost_usd": number,"created_at": string,"error": string | null,"feature": string,"id": string,"input_tokens": number,"latency_ms": number,"model": string,"output_tokens": number,"prompt_ver": string | null,"status": string,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "cache_read_tokens"?: number,"cache_write_tokens"?: number,"cost_usd"?: number,"created_at"?: string,"error"?: string | null,"feature": string,"id"?: string,"input_tokens"?: number,"latency_ms": number,"model": string,"output_tokens"?: number,"prompt_ver"?: string | null,"status": string,"user_id"?: string | null
                  }
                  Update: {
                    "cache_read_tokens"?: number,"cache_write_tokens"?: number,"cost_usd"?: number,"created_at"?: string,"error"?: string | null,"feature"?: string,"id"?: string,"input_tokens"?: number,"latency_ms"?: number,"model"?: string,"output_tokens"?: number,"prompt_ver"?: string | null,"status"?: string,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"match_explanations": {
                  Row: {
                    "created_at": string,"prompt_ver": string,"reason": string,"score": number,"target_id": string,"viewer_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"prompt_ver": string,"reason": string,"score": number,"target_id": string,"viewer_id": string
                  }
                  Update: {
                    "created_at"?: string,"prompt_ver"?: string,"reason"?: string,"score"?: number,"target_id"?: string,"viewer_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "match_explanations_target_id_fkey"
      columns: ["target_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "match_explanations_target_id_fkey"
      columns: ["target_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "match_explanations_viewer_id_fkey"
      columns: ["viewer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "match_explanations_viewer_id_fkey"
      columns: ["viewer_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"matches": {
                  Row: {
                    "created_at": string,"id": string,"user_a": string | null,"user_b": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"user_a"?: string | null,"user_b"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"user_a"?: string | null,"user_b"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "matches_user_a_fkey"
      columns: ["user_a"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "matches_user_a_fkey"
      columns: ["user_a"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "matches_user_b_fkey"
      columns: ["user_b"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "matches_user_b_fkey"
      columns: ["user_b"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"messages": {
                  Row: {
                    "body": string,"created_at": string,"id": string,"match_id": string | null,"mod_reason": string | null,"moderation": string,"sender_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "body": string,"created_at"?: string,"id"?: string,"match_id"?: string | null,"mod_reason"?: string | null,"moderation"?: string,"sender_id"?: string | null
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"id"?: string,"match_id"?: string | null,"mod_reason"?: string | null,"moderation"?: string,"sender_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "messages_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "matches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "messages_sender_id_fkey"
      columns: ["sender_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "messages_sender_id_fkey"
      columns: ["sender_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "age": number,"avatar_url": string | null,"bio": string | null,"city": string,"created_at": string,"embedding": string | null,"gender": string,"id": string,"interests": (string)[],"is_seed": boolean,"looking_for": (string)[],"name": string,"onboarded_at": string | null,"red_flags": (string)[],"seeking": string | null,"values": (string)[]
                  }
                  ComputedFields: never
                  Insert: {
                    "age": number,"avatar_url"?: string | null,"bio"?: string | null,"city": string,"created_at"?: string,"embedding"?: string | null,"gender": string,"id": string,"interests"?: (string)[],"is_seed"?: boolean,"looking_for": (string)[],"name": string,"onboarded_at"?: string | null,"red_flags"?: (string)[],"seeking"?: string | null,"values"?: (string)[]
                  }
                  Update: {
                    "age"?: number,"avatar_url"?: string | null,"bio"?: string | null,"city"?: string,"created_at"?: string,"embedding"?: string | null,"gender"?: string,"id"?: string,"interests"?: (string)[],"is_seed"?: boolean,"looking_for"?: (string)[],"name"?: string,"onboarded_at"?: string | null,"red_flags"?: (string)[],"seeking"?: string | null,"values"?: (string)[]
                  }
                  Relationships: [
                    
                  ]
                },"swipes": {
                  Row: {
                    "created_at": string,"direction": string,"swiper_id": string,"target_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"direction": string,"swiper_id": string,"target_id": string
                  }
                  Update: {
                    "created_at"?: string,"direction"?: string,"swiper_id"?: string,"target_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "swipes_swiper_id_fkey"
      columns: ["swiper_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "swipes_swiper_id_fkey"
      columns: ["swiper_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "swipes_target_id_fkey"
      columns: ["target_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "swipes_target_id_fkey"
      columns: ["target_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"user_warnings": {
                  Row: {
                    "created_at": string,"id": string,"match_id": string,"message_id": string | null,"reason": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"match_id": string,"message_id"?: string | null,"reason": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"match_id"?: string,"message_id"?: string | null,"reason"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_warnings_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "matches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "user_warnings_message_id_fkey"
      columns: ["message_id"]
isOneToOne: false
      referencedRelation: "messages"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "user_warnings_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "user_warnings_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "public_profiles": {
                  Row: {
                    "age": number,"avatar_url": string | null,"bio": string | null,"city": string,"gender": string,"id": string,"interests": (string)[],"name": string,"seeking": string | null,"values": (string)[]
                  }
                  ComputedFields: never
                  Insert: {
                           "age"?: number | null,"avatar_url"?: string | null,"bio"?: string | null,"city"?: string | null,"gender"?: string | null,"id"?: string | null,"interests"?: (string)[] | null,"name"?: string | null,"seeking"?: string | null,"values"?: (string)[] | null
                         }
                        Update: {
                           "age"?: number | null,"avatar_url"?: string | null,"bio"?: string | null,"city"?: string | null,"gender"?: string | null,"id"?: string | null,"interests"?: (string)[] | null,"name"?: string | null,"seeking"?: string | null,"values"?: (string)[] | null
                         }
                        Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "insert_warning_and_count":
{ Args: { "p_match_id": string,"p_message_id"?: string,"p_reason"?: string,"p_user_id": string }; Returns: number
                           },
"match_candidates":
{ Args: { "k": number,"viewer": string }; Returns: {
              "age": number,
"avatar_url": string | null,
"bio": string | null,
"city": string,
"gender": string,
"id": string,
"interests": (string)[],
"name": string,
"seeking": string | null,
"values": (string)[]
            }[]
                          SetofOptions: {
        from: "*"
        to: "public_profiles"
        isOneToOne: false
        isSetofReturn: true
      } },
"record_swipe":
{ Args: { "dir": string,"target": string }; Returns: {
              "match_id": string,"matched": boolean
            }[]
                           },
"search_profiles_by_embedding":
{ Args: { "query_embedding": string,"exclude_id": string,"k": number,"filter_city"?: string | null }; Returns: {
              "age": number,
"avatar_url": string | null,
"bio": string | null,
"city": string,
"gender": string,
"id": string,
"interests": (string)[],
"name": string,
"seeking": string | null,
"values": (string)[]
            }[]
                          SetofOptions: {
        from: "*"
        to: "public_profiles"
        isOneToOne: false
        isSetofReturn: true
      } }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
