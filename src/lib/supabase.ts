import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server client for middleware and server components
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: '', ...options });
      },
    },
  });
}

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          company: string;
          commercial_address: string;
          phone: string;
          created_at: string;
          subscription_plan: 'monthly' | 'semester' | 'annual';
          subscription_status: 'active' | 'expired';
          subscription_expires_at: string;
          keep_logged_in: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          company: string;
          commercial_address: string;
          phone: string;
          created_at?: string;
          subscription_plan: 'monthly' | 'semester' | 'annual';
          subscription_status?: 'active' | 'expired';
          subscription_expires_at: string;
          keep_logged_in?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          company?: string;
          commercial_address?: string;
          phone?: string;
          created_at?: string;
          subscription_plan?: 'monthly' | 'semester' | 'annual';
          subscription_status?: 'active' | 'expired';
          subscription_expires_at?: string;
          keep_logged_in?: boolean;
        };
      };
    };
  };
};