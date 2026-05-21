import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getProfile } from '@/app/actions/profile'
import ProfileForm from '../ProfileForm'
import BottomNav from '../BottomNav'
import ThemeToggleButton from '../ThemeToggleButton'
import Link from 'next/link'

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { profile } = await getProfile()
  const firstName = profile?.first_name || 'U'

  return (
    <div className="min-h-[100dvh] flex justify-center" style={{ background: 'var(--dash-bg)' }}>
      <div className="w-full max-w-[390px] min-h-[100dvh]" style={{ background: 'var(--dash-bg)' }}>

        {/* Header */}
        <header
          className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10"
          style={{
            background: 'var(--dash-header)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--dash-border-subtle)',
          }}
        >
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
            style={{ background: 'var(--dash-surface-2)', border: '1px solid var(--dash-border)' }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color: 'var(--dash-text-2)' }}>{firstName[0]}</span>
              </div>
            )}
          </Link>
          <h1 className="text-base font-semibold flex-1" style={{ color: 'var(--dash-text)' }}>Mon Profil</h1>
          <ThemeToggleButton />
        </header>

        <main className="px-5 py-6 pb-24">
          <ProfileForm initialData={profile} userId={user.id} />
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
