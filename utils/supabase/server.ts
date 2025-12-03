import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    "https://ozsfpdlqutiagarjuvse.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96c2ZwZGxxdXRpYWdhcmp1dnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTE3MzIsImV4cCI6MjA4MDE2NzczMn0.dygYzJXZzkIc-s4Z9DZhubaEwuuRvZx0Ni3chIaD1tU",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignoré si appelé depuis un Server Component
          }
        },
      },
    }
  )
}
