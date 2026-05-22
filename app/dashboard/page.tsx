import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getUserStats, getActivity } from '@/app/actions/stats'
import { getProfile } from '@/app/actions/profile'
import { checkStripeStatus } from '@/app/actions/stripe'
import ShareButton from './ShareButton'
import ActivityList from './ActivityList'
import BottomNav from './BottomNav'
import PullToRefresh from './PullToRefresh'
import Link from 'next/link'
import Image from 'next/image'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [profileResult, stripeStatus, stats, activities] = await Promise.all([
    getProfile(),
    checkStripeStatus(),
    getUserStats(user.id),
    getActivity(user.id, 10),
  ])

  const profile = profileResult.profile
  const firstName = profile?.first_name || 'Utilisateur'

  const renderStars = (rating: number) => {
    const stars = []
    const floorRating = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<span key={i} style={{ color: '#f59e0b' }}>★</span>)
      } else if (i === floorRating + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className="relative" style={{ color: 'var(--dash-text-3)' }}>
            ★
            <span className="absolute left-0 top-0 overflow-hidden w-[50%]" style={{ color: '#f59e0b' }}>★</span>
          </span>
        )
      } else {
        stars.push(<span key={i} style={{ color: 'var(--dash-text-3)' }}>★</span>)
      }
    }
    return stars
  }

  return (
    <div className="min-h-[100dvh] flex justify-center" style={{ background: 'var(--dash-bg)' }}>
      <div className="w-full max-w-[390px] min-h-[100dvh] flex flex-col relative" style={{ background: 'var(--dash-bg)' }}>
        <PullToRefresh>
          {/* Header */}
          <header
            className="px-5 py-4 flex items-center justify-between sticky top-0 z-10"
            style={{
              background: 'var(--dash-header)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid var(--dash-border-subtle)',
            }}
          >
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={32} height={32} priority />
              <span className="text-base font-semibold" style={{ color: 'var(--dash-text)' }}>
                Bonjour, {firstName}
              </span>
            </div>
            <Link
              href="/dashboard/profile"
              className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
              style={{ background: 'var(--dash-surface-2)', border: '1px solid var(--dash-border-em)' }}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-sm font-bold" style={{ color: 'var(--dash-text-2)' }}>{firstName[0]}</span>
                </div>
              )}
            </Link>
          </header>

          <main className="px-5 py-5 space-y-4">
            {/* Card Total reçu */}
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: 'var(--dash-surface)',
                border: '1px solid var(--dash-border-em)',
                boxShadow: '0 0 40px oklch(0.78 0.18 155 / 0.06)',
              }}
            >
              {/* Logo watermark */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.06]">
                <Image src="/logo.png" alt="" width={80} height={80} className="invert" />
              </div>
              <div className="relative z-10">
                <p
                  className="text-xs mb-1"
                  style={{ color: 'var(--dash-text-2)', fontFamily: 'var(--font-inter), sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  Total reçu
                </p>
                <p
                  className="text-3xl font-bold mb-5"
                  style={{ color: 'var(--dash-text)', fontFamily: 'var(--font-inter), sans-serif' }}
                >
                  {stats.totalReceived.toFixed(2)}€
                </p>
                <div className="flex gap-6">
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-wider mb-1"
                      style={{ color: 'var(--dash-text-3)', fontFamily: 'var(--font-inter), sans-serif' }}
                    >
                      Note moyenne
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold" style={{ color: 'var(--dash-text)' }}>
                        {stats.averageRating || '-'}
                      </span>
                      <div className="flex text-xs">{renderStars(stats.averageRating)}</div>
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-wider mb-1"
                      style={{ color: 'var(--dash-text-3)', fontFamily: 'var(--font-inter), sans-serif' }}
                    >
                      Avis reçus
                    </p>
                    <span className="text-lg font-bold" style={{ color: 'var(--dash-text)' }}>
                      {stats.reviewCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-3">
              <ShareButton userId={user.id} />
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-16 flex flex-col items-center justify-center gap-1.5 rounded-xl active:scale-[0.98] transition-all duration-200"
                style={{
                  background: 'var(--dash-surface)',
                  border: '1px solid var(--dash-border)',
                  color: 'var(--dash-text-2)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <span className="text-xs font-medium" style={{ color: 'var(--dash-text)' }}>Virements</span>
              </a>
            </div>

            {/* Banner Stripe non configuré */}
            {!stripeStatus.isComplete && (
              <div
                className="rounded-xl p-4"
                style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-border)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'oklch(0.78 0.18 155)', }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium" style={{ color: 'var(--dash-text)' }}>Configurez vos paiements</p>
                    <p className="text-[10px]" style={{ color: 'var(--dash-text-2)' }}>Pour recevoir des pourboires</p>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: 'oklch(0.78 0.18 155)', color: '#000' }}
                  >
                    Configurer
                  </Link>
                </div>
              </div>
            )}

            {/* Activité */}
            <section>
              <ActivityList activities={activities} initialLimit={5} />
            </section>

            <div className="h-20" />
          </main>
        </PullToRefresh>
        <BottomNav />
      </div>
    </div>
  )
}
