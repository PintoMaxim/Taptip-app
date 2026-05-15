import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getAllBadges, getBadgeStats } from '@/app/actions/badges'
import BadgeGenerator from './BadgeGenerator'
import BadgeList from './BadgeList'
import Link from 'next/link'
import Image from 'next/image'

const monoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), monospace',
}

export default async function AdminBadgesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/admin/badges')

  const adminEmail = process.env.ADMIN_EMAIL || 'contact.taptip@gmail.com'
  if (user.email !== adminEmail) redirect('/dashboard')

  const [{ badges }, stats] = await Promise.all([getAllBadges(), getBadgeStats()])

  const statCards = [
    { label: 'Total', value: stats.total, accent: false },
    { label: 'Activés', value: stats.activated, accent: true },
    { label: 'En attente', value: stats.pending, accent: false, indigo: true },
    { label: 'Vierges', value: stats.available, accent: false },
  ]

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
          <Link href="/dashboard/settings">
            <Image src="/logo.png" alt="TapTip" width={32} height={32} className="rounded-lg" />
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-semibold" style={{ color: '#f4f4f4' }}>Badges</h1>
            <p className="text-[10px]" style={{ ...monoStyle, color: '#4a4a4c' }}>Génération et suivi</p>
          </div>
        </header>

        <main className="px-5 py-5 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {statCards.map(({ label, value, accent, indigo }) => (
              <div
                key={label}
                className="rounded-xl p-4"
                style={{
                  background: accent
                    ? 'oklch(0.78 0.18 155 / 0.08)'
                    : indigo
                    ? 'rgba(99,102,241,0.08)'
                    : '#0c0c0d',
                  border: `1px solid ${
                    accent
                      ? 'oklch(0.78 0.18 155 / 0.25)'
                      : indigo
                      ? 'rgba(99,102,241,0.25)'
                      : 'rgba(255,255,255,0.08)'
                  }`,
                }}
              >
                <p
                  className="text-[10px] uppercase tracking-wider mb-1 font-bold"
                  style={{
                    ...monoStyle,
                    color: accent
                      ? 'oklch(0.78 0.18 155)'
                      : indigo
                      ? 'rgba(129,140,248,1)'
                      : '#4a4a4c',
                  }}
                >
                  {label}
                </p>
                <p
                  className="text-2xl font-black"
                  style={{
                    ...monoStyle,
                    color: accent
                      ? 'oklch(0.78 0.18 155)'
                      : indigo
                      ? 'rgba(129,140,248,1)'
                      : '#f4f4f4',
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          <BadgeGenerator />
          <BadgeList badges={badges || []} />

          <div className="h-10" />
        </main>
      </div>
    </div>
  )
}
