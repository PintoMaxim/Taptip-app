import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getAllBadges, getBadgeStats } from '@/app/actions/badges'
import BadgeGenerator from './BadgeGenerator'
import BadgeList from './BadgeList'
import Link from 'next/link'

export default async function AdminBadgesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Vérifier l'authentification
  if (!user) {
    redirect('/login?redirect=/admin/badges')
  }

  // Vérifier que c'est l'admin
  const adminEmail = process.env.ADMIN_EMAIL || 'contact.taptip@gmail.com'
  if (user.email !== adminEmail) {
    redirect('/dashboard')
  }

  // Récupérer les données
  const [{ badges }, stats] = await Promise.all([
    getAllBadges(),
    getBadgeStats(),
  ])

  return (
    <div className="min-h-screen bg-white flex justify-center">
      {/* Container mobile fixe */}
      <div className="w-full max-w-[390px] min-h-screen bg-white">
        {/* Header */}
        <header className="px-5 py-4 flex items-center gap-3 border-b border-gray-100">
          <Link 
            href="/dashboard/settings"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
          >
            <span className="text-sm">←</span>
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-black">Badges</h1>
            <p className="text-[10px] text-gray-400">Génération et suivi</p>
          </div>
          <Link 
            href="/admin/referrals"
            className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg active:scale-95"
          >
            Parrainages
          </Link>
        </header>

        <main className="px-5 py-5 space-y-5">
          {/* Stats */}
          <div className="flex gap-3">
            <div className="flex-1 bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Total</p>
              <p className="text-2xl font-black text-black">{stats.total}</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Activés</p>
              <p className="text-2xl font-black text-black">{stats.activated}</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Dispo</p>
              <p className="text-2xl font-black text-black">{stats.available}</p>
            </div>
          </div>

          {/* Générateur */}
          <BadgeGenerator />

          {/* Liste des badges */}
          <BadgeList badges={badges || []} />

          {/* Espace en bas */}
          <div className="h-10" />
        </main>
      </div>
    </div>
  )
}
