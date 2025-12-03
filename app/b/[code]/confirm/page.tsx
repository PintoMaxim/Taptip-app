import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { activateBadge } from '@/app/actions/badges'

interface PageProps {
  params: Promise<{ code: string }>
}

// Cette page est appelée après la confirmation email
// Elle active automatiquement le badge et redirige vers le dashboard
export default async function ConfirmActivationPage({ params }: PageProps) {
  const { code } = await params
  const supabase = await createClient()

  // Vérifier que l'utilisateur est connecté
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Si pas connecté, rediriger vers la page d'activation
    redirect(`/b/${code}`)
  }

  // Activer le badge
  const result = await activateBadge(code)

  if (result.error) {
    // En cas d'erreur, afficher un message
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <span className="text-6xl mb-6 block">❌</span>
          <h1 className="text-xl font-bold text-black mb-2">
            Erreur d'activation
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            {result.error}
          </p>
          <a
            href={`/b/${code}`}
            className="inline-block px-6 py-3 bg-black text-white rounded-xl font-medium"
          >
            Réessayer
          </a>
        </div>
      </div>
    )
  }

  // Succès → rediriger vers le dashboard
  redirect('/dashboard/profile?activated=true')
}

