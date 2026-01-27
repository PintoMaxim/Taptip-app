'use server'

import { stripe } from '@/utils/stripe/server'

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

  // 1. Calculer la commission (7% pour tout le monde)
  const commissionRate = 0.07 
  const applicationFee = Math.round(amount * commissionRate)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // Seulement Carte (inclut Apple Pay / Google Pay) + Link
      payment_method_types: ['card', 'link'],
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

