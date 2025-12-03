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

  // Calculer la commission de 7%
  const applicationFee = Math.round(amount * 0.07)

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

