import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getProfile } from '@/app/actions/profile'
import ProfileForm from '../ProfileForm'
import BottomNav from '../BottomNav'
import Link from 'next/link'

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { profile } = await getProfile()
  const firstName = profile?.first_name || 'U'

  return (
    <div className="min-h-[100dvh] flex justify-center" style={{ background: '#050505' }}>
      <div className="w-full max-w-[390px] min-h-[100dvh]" style={{ background: '#050505' }}>

        {/* Header */}
        <header
          className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10"
          style={{
            background: 'rgba(5,5,5,0.9)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
            style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color: '#8b8b8d' }}>{firstName[0]}</span>
              </div>
            )}
          </Link>
          <h1 className="text-base font-semibold" style={{ color: '#f4f4f4' }}>Mon Profil</h1>
        </header>

        <main className="px-5 py-6 pb-24">
          <ProfileForm initialData={profile} userId={user.id} />
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
