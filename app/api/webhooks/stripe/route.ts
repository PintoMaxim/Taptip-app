import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Client Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Client Supabase avec service role (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  console.log('🔔 Webhook Stripe reçu !')

  if (!signature) {
    console.error('❌ Signature Stripe manquante')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log(`✅ Événement vérifié : ${event.type}`)
  } catch (err) {
    console.error('❌ Échec de la vérification de la signature :', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Gérer les différents types d'événements
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('📦 Session de paiement complétée :', session.id)

      // Vérifier que c'est un paiement réussi
      if (session.payment_status === 'paid') {
        // 1. Essayer de récupérer l'userId depuis les metadata (plus fiable)
        let userId = session.metadata?.userId
        console.log('🔍 Recherche userId dans metadata :', userId)

        // 2. Si pas de metadata, essayer d'extraire de l'URL de succès
        if (!userId) {
          const successUrl = session.success_url
          const userIdMatch = successUrl?.match(/\/p\/([^?]+)/)
          userId = userIdMatch?.[1]
          console.log('🔍 Recherche userId dans URL :', userId)
        }

        // 3. Si toujours rien, essayer de trouver l'utilisateur par son stripe_account_id
        const stripeAccountId = (session as any).stripe_account || event.account
        console.log('🔍 Compte Stripe concerné :', stripeAccountId)
        
        if (!userId && stripeAccountId) {
          const { data: userByStripe } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('stripe_account_id', stripeAccountId)
            .single()
          userId = userByStripe?.id
          console.log('🔍 UserId trouvé via stripe_account_id :', userId)
        }

        if (userId && session.amount_total) {
          console.log(`💰 Enregistrement du pourboire de ${session.amount_total / 100}€ pour ${userId}`)
          // Enregistrer le pourboire dans la base de données
          const { error } = await supabaseAdmin
            .from('tips')
            .insert({
              user_id: userId,
              amount: session.amount_total,
              stripe_payment_id: session.payment_intent as string,
              stripe_checkout_session_id: session.id,
              status: 'completed',
            })

          if (error) {
            console.error('❌ Erreur insertion Supabase :', error)
          } else {
            console.log(`✅ Pourboire enregistré avec succès !`)
          }
        } else {
          console.warn('⚠️ Impossible de déterminer l\'utilisateur ou le montant')
        }
      }
      break
    }

    case 'account.updated': {
      const account = event.data.object as Stripe.Account
      if (account.charges_enabled && account.payouts_enabled) {
        const { error } = await supabaseAdmin
          .from('users')
          .update({ stripe_onboarding_complete: true })
          .eq('stripe_account_id', account.id)

        if (error) {
          console.error('❌ Erreur mise à jour onboarding :', error)
        } else {
          console.log(`✅ Onboarding complété pour ${account.id}`)
        }
      }
      break
    }

    default:
      console.log(`ℹ️ Événement non géré : ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
