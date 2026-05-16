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
  // ── 0. Vérification préalable des variables d'environnement ──────────────
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ STRIPE_WEBHOOK_SECRET est manquant dans les variables d\'environnement Vercel')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY est manquant')
    return NextResponse.json({ error: 'Stripe key not configured' }, { status: 500 })
  }

  // ── 1. Lecture du body brut ───────────────────────────────────────────────
  let body: string
  try {
    body = await request.text()
  } catch (err) {
    console.error('❌ Impossible de lire le body de la requête :', err)
    return NextResponse.json({ error: 'Cannot read request body' }, { status: 400 })
  }

  const signature = request.headers.get('stripe-signature')
  console.log('🔔 Webhook Stripe reçu — signature présente :', !!signature)

  if (!signature) {
    console.error('❌ En-tête stripe-signature manquant')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  // ── 2. Vérification de la signature ──────────────────────────────────────
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    console.log(`✅ Événement Stripe vérifié : ${event.type} (id: ${event.id})`)
  } catch (err) {
    // Cause la plus fréquente : mauvais STRIPE_WEBHOOK_SECRET dans Vercel
    console.error('❌ Échec vérification signature Stripe :', err)
    console.error('   → Vérifiez que STRIPE_WEBHOOK_SECRET dans Vercel correspond')
    console.error('     au "Signing secret" de l\'endpoint dans le Stripe Dashboard (mode LIVE)')
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // ── 3. Traitement de l'événement ─────────────────────────────────────────
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('📦 checkout.session.completed :', session.id, '| statut :', session.payment_status)

        if (session.payment_status === 'paid') {
          // 1. userId depuis les metadata (méthode principale)
          let userId = session.metadata?.userId
          console.log('🔍 userId metadata :', userId)

          // 2. userId extrait de l'URL de succès (fallback)
          if (!userId) {
            const userIdMatch = session.success_url?.match(/\/p\/([^?]+)/)
            userId = userIdMatch?.[1]
            console.log('🔍 userId URL :', userId)
          }

          // 3. userId via stripe_account_id (dernier recours)
          const stripeAccountId = (session as any).stripe_account || event.account
          console.log('🔍 stripeAccountId :', stripeAccountId)

          if (!userId && stripeAccountId) {
            const { data: userByStripe, error: lookupError } = await supabaseAdmin
              .from('users')
              .select('id')
              .eq('stripe_account_id', stripeAccountId)
              .single()
            if (lookupError) console.warn('⚠️ Lookup Supabase :', lookupError.message)
            userId = userByStripe?.id
            console.log('🔍 userId via stripeAccountId :', userId)
          }

          if (userId && session.amount_total) {
            console.log(`💰 Insertion pourboire ${session.amount_total / 100}€ pour user ${userId}`)
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
              console.error('❌ Erreur insertion Supabase :', error.message, error.details)
            } else {
              console.log('✅ Pourboire enregistré avec succès !')
            }
          } else {
            console.warn('⚠️ userId ou amount_total introuvable — pourboire non enregistré')
            console.warn('   session.metadata :', JSON.stringify(session.metadata))
            console.warn('   session.amount_total :', session.amount_total)
          }
        }
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        console.log('👤 account.updated :', account.id, '| charges_enabled :', account.charges_enabled, '| payouts_enabled :', account.payouts_enabled)

        if (account.charges_enabled && account.payouts_enabled) {
          const { error } = await supabaseAdmin
            .from('users')
            .update({ stripe_onboarding_complete: true })
            .eq('stripe_account_id', account.id)

          if (error) {
            console.error('❌ Erreur maj onboarding Supabase :', error.message)
          } else {
            console.log('✅ Onboarding Stripe marqué complet pour :', account.id)
          }
        }
        break
      }

      default:
        console.log(`ℹ️ Événement non géré : ${event.type}`)
    }
  } catch (err) {
    // On log l'erreur mais on retourne quand même 200 pour que Stripe
    // ne réessaie pas (l'événement a bien été reçu, c'est le traitement qui a échoué)
    console.error('❌ Erreur inattendue durant le traitement :', err)
  }

  // ── 4. Toujours retourner 200 pour accuser réception à Stripe ────────────
  return NextResponse.json({ received: true })
}
