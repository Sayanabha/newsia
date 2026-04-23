import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// This uses the service role key — only ever used server-side
// It bypasses RLS, which is correct for our API routes
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← service role, not anon key
  )
}