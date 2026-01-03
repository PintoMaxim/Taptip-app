'use server'

import { stripe } from '@/utils/stripe/server'
import { createClient } from '@/utils/supabase/server'

interface CheckoutSessionParams {
  amount: number // Montant en centimes
  destinationAccountId: string
  userId: string
}

export async function createCheckoutSession({
  amount,
  destinationAccountId,
  userId,
}: CheckoutSessionParams) {
  if (!stripe) {
    return { error: 'Stripe non configuré' }
  }

  // 1. Vérifier si l'utilisateur bénéficie du 0% commission (parrainage)
  const supabase = await createClient()
  let commissionRate = 0.07 // 7% par défaut

  const { data: userData } = await supabase
    .from('users')
    .select('referral_claimed_at')
    .eq('id', userId)
    .single()

  if (userData?.referral_claimed_at) {
    const claimedAt = new Date(userData.referral_claimed_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Si le parrainage a été réclamé il y a moins de 30 jours
    if (claimedAt > thirtyDaysAgo) {
      commissionRate = 0
    }
  }

  // Calculer la commission
  const applicationFee = Math.round(amount * commissionRate)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // Ne pas spécifier payment_method_types pour activer automatiquement
      // Apple Pay, Google Pay, et Link selon l'appareil du client
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Pourboire',
              description: 'Merci pour votre générosité !',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFee,
        on_behalf_of: destinationAccountId, // Frais Stripe prélevés sur le porteur, pas sur TapTip
        transfer_data: {
          destination: destinationAccountId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/p/${userId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/p/${userId}?canceled=true`,
    })

    return { url: session.url }
  } catch (error) {
    console.error('Erreur Stripe:', error)
    return { error: 'Erreur lors de la création du paiement' }
  }
}

