import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { activateBadge } from '@/app/actions/badges'

interface PageProps {
  params: Promise<{ code: string }>
}

export default async function ConfirmActivationPage({ params }: PageProps) {
  const { code } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/b/${code}`)
  }

  const result = await activateBadge(code)

  if (result.error) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center px-6"
        style={{ background: '#050505' }}
      >
        <div className="text-center page-transition">
          <span className="text-6xl mb-6 block">❌</span>
          <h1 className="text-xl font-bold mb-2" style={{ color: '#f4f4f4' }}>
            Erreur d&apos;activation
          </h1>
          <p className="text-sm mb-6" style={{ color: '#8b8b8d' }}>
            {result.error}
          </p>
          <a
            href={`/b/${code}`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm active:scale-[0.98] transition-all duration-200 hover:brightness-110"
            style={{ background: 'oklch(0.78 0.18 155)', color: '#000' }}
          >
            Réessayer
          </a>
        </div>
      </div>
    )
  }

  redirect('/dashboard/profile?activated=true')
}
