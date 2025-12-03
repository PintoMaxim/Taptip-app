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

  if (!signature) {
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
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Gérer les différents types d'événements
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      // Vérifier que c'est un paiement réussi
      if (session.payment_status === 'paid') {
        // Extraire l'user_id de l'URL de succès
        // Format: https://app.taptip.fr/p/USER_ID?success=true
        const successUrl = session.success_url
        const userIdMatch = successUrl?.match(/\/p\/([^?]+)/)
        const userId = userIdMatch?.[1]

        if (userId && session.amount_total) {
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
            console.error('Error inserting tip:', error)
          } else {
            console.log(`✅ Tip recorded: ${session.amount_total / 100}€ for user ${userId}`)
          }
        }
      }
      break
    }

    case 'account.updated': {
      // Un compte Stripe Connect a été mis à jour
      const account = event.data.object as Stripe.Account
      
      // Vérifier si l'onboarding est complet
      if (account.charges_enabled && account.payouts_enabled) {
        // Mettre à jour le statut dans la base de données
        const { error } = await supabaseAdmin
          .from('users')
          .update({ stripe_onboarding_complete: true })
          .eq('stripe_account_id', account.id)

        if (error) {
          console.error('Error updating Stripe status:', error)
        } else {
          console.log(`✅ Stripe onboarding completed for account ${account.id}`)
        }
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
