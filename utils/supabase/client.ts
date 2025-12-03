import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    "https://ozsfpdlqutiagarjuvse.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96c2ZwZGxxdXRpYWdhcmp1dnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTE3MzIsImV4cCI6MjA4MDE2NzczMn0.dygYzJXZzkIc-s4Z9DZhubaEwuuRvZx0Ni3chIaD1tU"
  )
}