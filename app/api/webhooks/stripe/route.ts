import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  // ── 0. Vérification des variables d'environnement ────────────────────────
  const secretConnect = process.env.STRIPE_WEBHOOK_SECRET          // "TapTip connect" (Comptes connectés)
  const secretPlatform = process.env.STRIPE_WEBHOOK_SECRET_PLATFORM // "brilliant-victory" (Votre compte)

  if (!secretConnect && !secretPlatform) {
    console.error('❌ Aucun STRIPE_WEBHOOK_SECRET configuré dans Vercel')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  // ── 1. Lecture du body brut ───────────────────────────────────────────────
  let body: string
  try {
    body = await request.text()
  } catch (err) {
    console.error('❌ Impossible de lire le body :', err)
    return NextResponse.json({ error: 'Cannot read request body' }, { status: 400 })
  }

  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('❌ En-tête stripe-signature manquant')
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  // ── 2. Vérification de la signature — on essaie les 2 secrets ────────────
  // Deux endpoints Stripe pointent vers cette même URL avec des secrets différents :
  //   - STRIPE_WEBHOOK_SECRET         → "TapTip connect" (Comptes connectés) → checkout.session.completed
  //   - STRIPE_WEBHOOK_SECRET_PLATFORM → "brilliant-victory" (Votre compte)   → account.updated
  let event: Stripe.Event | null = null
  let usedSecret = ''

  const secretsToTry = [
    { key: 'STRIPE_WEBHOOK_SECRET', value: secretConnect },
    { key: 'STRIPE_WEBHOOK_SECRET_PLATFORM', value: secretPlatform },
  ].filter(s => !!s.value)

  for (const { key, value } of secretsToTry) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, value!)
      usedSecret = key
      break
    } catch {
      // Ce secret ne correspond pas à cet événement, on essaie le suivant
    }
  }

  if (!event) {
    console.error('❌ Échec de vérification avec tous les secrets disponibles')
    console.error('   Secrets essayés :', secretsToTry.map(s => s.key).join(', '))
    console.error('   → Vérifiez que STRIPE_WEBHOOK_SECRET et STRIPE_WEBHOOK_SECRET_PLATFORM')
    console.error('     correspondent aux signing secrets dans le Stripe Dashboard (mode LIVE)')
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  console.log(`✅ Événement Stripe vérifié : ${event.type} (id: ${event.id}) via ${usedSecret}`)

  // ── 3. Traitement de l'événement ─────────────────────────────────────────
  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('📦 checkout.session.completed :', session.id, '| statut :', session.payment_status)

        if (session.payment_status === 'paid') {
          let userId = session.metadata?.userId
          console.log('🔍 userId metadata :', userId)

          if (!userId) {
            const userIdMatch = session.success_url?.match(/\/p\/([^?]+)/)
            userId = userIdMatch?.[1]
            console.log('🔍 userId URL :', userId)
          }

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
            console.warn('   metadata :', JSON.stringify(session.metadata))
            console.warn('   amount_total :', session.amount_total)
          }
        }
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        console.log('👤 account.updated :', account.id,
          '| charges_enabled :', account.charges_enabled,
          '| payouts_enabled :', account.payouts_enabled)

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
    // On log l'erreur mais on retourne 200 quand même :
    // Stripe a bien livré l'événement, c'est notre traitement qui a planté.
    // On ne veut pas que Stripe réessaie à l'infini.
    console.error('❌ Erreur inattendue durant le traitement :', err)
  }

  // ── 4. Toujours 200 pour accuser réception à Stripe ──────────────────────
  return NextResponse.json({ received: true })
}
