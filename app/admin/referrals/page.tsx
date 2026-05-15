import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ReferralList from './ReferralList'

const monoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), monospace',
}

export default async function AdminReferralsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const adminEmail = process.env.ADMIN_EMAIL || 'contact.taptip@gmail.com'
  if (user.email !== adminEmail) redirect('/dashboard')

  const { data: referrals } = await supabase
    .from('referrals')
    .select('id, referrer_id, referee_id, status, amount, created_at, paid_at, stripe_transfer_id')
    .order('created_at', { ascending: false })

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

  const enrichedReferrals = referrals?.map(r => ({
    ...r,
    referrer: usersMap.get(r.referrer_id),
    referee: usersMap.get(r.referee_id),
  })) || []

  const pendingReferrals = enrichedReferrals.filter(r => r.status === 'pending')
  const paidReferrals = enrichedReferrals.filter(r => r.status === 'paid')
  const pendingAmount = pendingReferrals.reduce((acc, r) => acc + (r.amount || 0), 0) / 100
  const paidAmount = paidReferrals.reduce((acc, r) => acc + (r.amount || 0), 0) / 100

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
            href="/admin/badges"
            className="w-8 h-8 flex items-center justify-center rounded-full active:scale-95 transition-all duration-200"
            style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', color: '#8b8b8d' }}
          >
            <span className="text-sm">←</span>
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-semibold" style={{ color: '#f4f4f4' }}>Parrainages</h1>
            <p className="text-[10px]" style={{ ...monoStyle, color: '#4a4a4c' }}>Gestion des bonus</p>
          </div>
          <Image src="/logo.png" alt="Logo" width={28} height={28} />
        </header>

        <main className="px-5 py-5 space-y-5">

          {/* Carte principale — À payer */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: '#0c0c0d',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 0 40px oklch(0.78 0.18 155 / 0.06)',
            }}
          >
            <p
              className="text-[10px] uppercase tracking-wider mb-1"
              style={{ ...monoStyle, color: '#4a4a4c' }}
            >
              À payer
            </p>
            <p
              className="text-4xl font-black mb-4"
              style={{ ...monoStyle, color: '#f4f4f4' }}
            >
              {pendingAmount}€
            </p>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: '#8b8b8d' }}>
                {pendingReferrals.length} parrainage{pendingReferrals.length > 1 ? 's' : ''} en attente
              </span>
              <a
                href="https://dashboard.stripe.com/balance"
                target="_blank"
                rel="noopener noreferrer"
                className="underline transition-colors duration-200"
                style={{ color: 'oklch(0.78 0.18 155)' }}
              >
                Voir Stripe →
              </a>
            </div>
          </div>

          {/* Stats secondaires */}
          <div className="flex gap-3">
            <div
              className="flex-1 rounded-xl p-4"
              style={{ background: '#0c0c0d', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ ...monoStyle, color: '#4a4a4c' }}>Payés</p>
              <p className="text-2xl font-black" style={{ ...monoStyle, color: 'oklch(0.78 0.18 155)' }}>{paidAmount}€</p>
              <p className="text-[10px]" style={{ color: '#4a4a4c' }}>{paidReferrals.length} parrainage{paidReferrals.length > 1 ? 's' : ''}</p>
            </div>
            <div
              className="flex-1 rounded-xl p-4"
              style={{ background: '#0c0c0d', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ ...monoStyle, color: '#4a4a4c' }}>Total</p>
              <p className="text-2xl font-black" style={{ ...monoStyle, color: '#f4f4f4' }}>{pendingAmount + paidAmount}€</p>
              <p className="text-[10px]" style={{ color: '#4a4a4c' }}>{enrichedReferrals.length} parrainage{enrichedReferrals.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Historique */}
          <section>
            <h2
              className="text-[10px] uppercase tracking-wider mb-3 ml-1"
              style={{ ...monoStyle, color: '#4a4a4c' }}
            >
              Historique
            </h2>

            {enrichedReferrals.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center"
                style={{ background: '#0c0c0d', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-3xl mb-2">🎁</p>
                <p className="text-sm" style={{ color: '#8b8b8d' }}>Aucun parrainage</p>
                <p className="text-[10px] mt-1" style={{ color: '#4a4a4c' }}>Les parrainages apparaîtront ici</p>
              </div>
            ) : (
              <ReferralList referrals={enrichedReferrals} />
            )}
          </section>

          <div className="h-10" />
        </main>
      </div>
    </div>
  )
}
