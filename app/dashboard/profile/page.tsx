import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getProfile } from '@/app/actions/profile'
import ProfileForm from '../ProfileForm'
import BottomNav from '../BottomNav'
import Link from 'next/link'

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { profile } = await getProfile()
  const firstName = profile?.first_name || 'U'

  return (
    <div className="min-h-screen bg-white flex justify-center">
      {/* Container mobile fixe */}
      <div className="w-full max-w-[390px] min-h-screen bg-white">
        {/* Header */}
        <header className="px-5 py-4 flex items-center gap-3 border-b border-gray-100">
          <Link href="/dashboard" className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400 text-sm font-bold">
                  {firstName[0]}
                </span>
              </div>
            )}
          </Link>
          <h1 className="text-base font-semibold text-black">Mon Profil</h1>
        </header>

        <main className="px-5 py-6 pb-24">
          <ProfileForm 
            initialData={profile} 
            userId={user.id}
          />
        </main>

        {/* Barre de navigation */}
        <BottomNav />
      </div>
    </div>
  )
}
