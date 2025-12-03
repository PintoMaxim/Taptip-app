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
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[600px] min-h-screen bg-white">
        {/* Header */}
        <header className="px-5 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard" 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <span className="text-sm">←</span>
            </Link>
            <h1 className="text-lg font-bold text-black">🏷️ Gestion des Badges</h1>
          </div>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
            ADMIN
          </span>
        </header>

        <main className="px-5 py-5 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-black">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.activated}</p>
              <p className="text-xs text-gray-500">Activés</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.available}</p>
              <p className="text-xs text-gray-500">Disponibles</p>
            </div>
          </div>

          {/* Générateur */}
          <BadgeGenerator />

          {/* Liste des badges */}
          <BadgeList badges={badges || []} />
        </main>
      </div>
    </div>
  )
}
