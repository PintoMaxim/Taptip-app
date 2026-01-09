import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ReferralList from './ReferralList'

export default async function AdminReferralsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Vérifier que c'est un admin
  const adminEmail = process.env.ADMIN_EMAIL || 'contact.taptip@gmail.com'
  if (user.email !== adminEmail) {
    redirect('/dashboard')
  }

  // Récupérer tous les parrainages avec les infos des utilisateurs
  const { data: referrals, error } = await supabase
    .from('referrals')
    .select(`
      id,
      referrer_id,
      referee_id,
      status,
      amount,
      created_at,
      paid_at,
      stripe_transfer_id
    `)
    .order('created_at', { ascending: false })

  // Récupérer les infos des utilisateurs
  const userIds = new Set<string>()
  referrals?.forEach(r => {
    userIds.add(r.referrer_id)
    userIds.add(r.referee_id)
  })

  const { data: users } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, stripe_account_id')
    .in('id', Array.from(userIds))

  const usersMap = new Map(users?.map(u => [u.id, u]) || [])

  // Enrichir les parrainages avec les infos utilisateurs
  const enrichedReferrals = referrals?.map(r => ({
    ...r,
    referrer: usersMap.get(r.referrer_id),
    referee: usersMap.get(r.referee_id),
  })) || []

  // Stats
  const stats = {
    total: enrichedReferrals.length,
    pending: enrichedReferrals.filter(r => r.status === 'pending').length,
    paid: enrichedReferrals.filter(r => r.status === 'paid').length,
    totalAmount: enrichedReferrals.reduce((acc, r) => acc + (r.amount || 0), 0) / 100,
    paidAmount: enrichedReferrals.filter(r => r.status === 'paid').reduce((acc, r) => acc + (r.amount || 0), 0) / 100,
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[500px] min-h-screen bg-white">
        {/* Header */}
        <header className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo"
              width={28}
              height={28}
            />
            <h1 className="text-base font-semibold text-black">Gestion Parrainages</h1>
          </div>
          <Link 
            href="/admin/badges"
            className="text-xs text-gray-500 hover:text-black"
          >
            ← Badges
          </Link>
        </header>

        <main className="px-5 py-5 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
              <p className="text-[10px] text-amber-600 uppercase font-medium">En attente</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-emerald-600">{stats.paid}</p>
              <p className="text-[10px] text-emerald-600 uppercase font-medium">Payés</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-gray-700">{stats.totalAmount}€</p>
              <p className="text-[10px] text-gray-500 uppercase font-medium">Total</p>
            </div>
          </div>

          {/* Info solde */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-blue-800">
              <strong>💡 Rappel :</strong> Assurez-vous d'avoir suffisamment de solde sur votre compte Stripe avant de payer les parrains.
            </p>
          </div>

          {/* Liste des parrainages */}
          <section>
            <h2 className="text-[10px] text-gray-400 uppercase tracking-wider mb-3 ml-1">
              Parrainages ({stats.total})
            </h2>
            
            {enrichedReferrals.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <p className="text-gray-400 text-sm">Aucun parrainage pour le moment</p>
              </div>
            ) : (
              <ReferralList referrals={enrichedReferrals} />
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

