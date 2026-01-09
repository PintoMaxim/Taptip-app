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
  const { data: referrals } = await supabase
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
  const pendingReferrals = enrichedReferrals.filter(r => r.status === 'pending')
  const paidReferrals = enrichedReferrals.filter(r => r.status === 'paid')
  const pendingAmount = pendingReferrals.reduce((acc, r) => acc + (r.amount || 0), 0) / 100
  const paidAmount = paidReferrals.reduce((acc, r) => acc + (r.amount || 0), 0) / 100

  return (
    <div className="min-h-screen bg-white flex justify-center">
      {/* Container mobile fixe */}
      <div className="w-full max-w-[390px] min-h-screen bg-white">
        {/* Header */}
        <header className="px-5 py-4 flex items-center gap-3 border-b border-gray-100">
          <Link 
            href="/admin/badges"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
          >
            <span className="text-sm">←</span>
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-black">Parrainages</h1>
            <p className="text-[10px] text-gray-400">Gestion des bonus</p>
          </div>
          <Image
            src="/logo.png"
            alt="Logo"
            width={28}
            height={28}
          />
        </header>

        <main className="px-5 py-5 space-y-5">
          {/* Carte principale - Solde à payer */}
          <div className="bg-black rounded-2xl p-5 text-white">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">À payer</p>
            <p className="text-4xl font-black mb-4">{pendingAmount}€</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{pendingReferrals.length} parrainage{pendingReferrals.length > 1 ? 's' : ''} en attente</span>
              <a 
                href="https://dashboard.stripe.com/balance"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline"
              >
                Voir solde Stripe →
              </a>
            </div>
          </div>

          {/* Stats secondaires */}
          <div className="flex gap-3">
            <div className="flex-1 bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Payés</p>
              <p className="text-2xl font-black text-black">{paidAmount}€</p>
              <p className="text-[10px] text-gray-400">{paidReferrals.length} parrainage{paidReferrals.length > 1 ? 's' : ''}</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Total</p>
              <p className="text-2xl font-black text-black">{pendingAmount + paidAmount}€</p>
              <p className="text-[10px] text-gray-400">{enrichedReferrals.length} parrainage{enrichedReferrals.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Liste des parrainages */}
          <section>
            <h2 className="text-[10px] text-gray-400 uppercase tracking-wider mb-3 ml-1">
              Historique
            </h2>
            
            {enrichedReferrals.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-10 text-center">
                <p className="text-3xl mb-2">🎁</p>
                <p className="text-sm text-gray-500">Aucun parrainage</p>
                <p className="text-[10px] text-gray-400 mt-1">Les parrainages apparaîtront ici</p>
              </div>
            ) : (
              <ReferralList referrals={enrichedReferrals} />
            )}
          </section>

          {/* Espace en bas */}
          <div className="h-10" />
        </main>
      </div>
    </div>
  )
}

