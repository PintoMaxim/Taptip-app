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
  // On calcule sur le montant BRUT total
  const commissionRate = 0.07 
  const applicationFee = Math.round(amount * commissionRate)

  try {
    // On passe en mode "Direct Charge"
    // Cela signifie que le paiement est créé directement sur le compte du serveur
    // La plateforme TapTip ne fait que prélever sa commission au passage
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'link'],
      metadata: {
        userId: userId, // On stocke l'ID utilisateur dans les metadata pour le Webhook
      },
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
        // Stripe "aspire" cette commission pour TapTip
        application_fee_amount: applicationFee,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/p/${userId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/p/${userId}?canceled=true`,
    }, {
      // C'est cette ligne qui change TOUT : le paiement se passe chez le serveur
      stripeAccount: destinationAccountId,
    })

    return { url: session.url }
  } catch (error) {
    console.error('Erreur Stripe Direct Charge:', error)
    return { error: 'Erreur lors de la création du paiement' }
  }
}
