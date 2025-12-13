'use server'

import { stripe, isStripeConfigured } from '@/utils/stripe/server'
import { createClient } from '@/utils/supabase/server'

// Crée un compte Stripe Connect Standard pour l'utilisateur
export async function createStripeAccount() {
  if (!isStripeConfigured() || !stripe) {
    return { error: 'Stripe non configuré' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Vérifier si l'utilisateur a déjà un compte Stripe
  const { data: userData } = await supabase
    .from('users')
    .select('stripe_account_id')
    .eq('id', user.id)
    .single()

  if (userData?.stripe_account_id) {
    return { accountId: userData.stripe_account_id }
  }

  // Créer un nouveau compte Stripe Connect Standard
  const account = await stripe.accounts.create({
    type: 'standard',
    email: user.email,
    metadata: {
      user_id: user.id,
    },
  })

  // Sauvegarder l'ID du compte dans la table users
  await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email,
      stripe_account_id: account.id,
      stripe_onboarding_complete: false,
    })

  return { accountId: account.id }
}

// Génère un lien d'onboarding Stripe
export async function getStripeOnboardingLink() {
  if (!isStripeConfigured() || !stripe) {
    return { error: 'Stripe non configuré' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Récupérer ou créer le compte Stripe
  const { accountId, error } = await createStripeAccount()

  if (error || !accountId) {
    return { error: error || 'Impossible de créer le compte Stripe' }
  }

  // Générer le lien d'onboarding
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.taptip.fr'
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/dashboard/settings`,
    return_url: `${baseUrl}/dashboard/settings`,
    type: 'account_onboarding',
  })

  return { url: accountLink.url }
}

// Vérifie le statut d'onboarding Stripe
export async function checkStripeStatus() {
  if (!isStripeConfigured() || !stripe) {
    return { isComplete: false, hasAccount: false, stripeConfigured: false }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié', isComplete: false }
  }

  // Récupérer l'ID du compte Stripe
  const { data: userData } = await supabase
    .from('users')
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('id', user.id)
    .single()

  if (!userData?.stripe_account_id) {
    return { isComplete: false, hasAccount: false, stripeConfigured: true }
  }

  // Si déjà marqué comme complet, retourner directement
  if (userData.stripe_onboarding_complete) {
    return { isComplete: true, hasAccount: true, stripeConfigured: true }
  }

  // Vérifier auprès de Stripe
  const account = await stripe.accounts.retrieve(userData.stripe_account_id)
  const isComplete = account.charges_enabled && account.payouts_enabled

  // Mettre à jour la DB si l'onboarding est terminé
  if (isComplete) {
    await supabase
      .from('users')
      .update({ stripe_onboarding_complete: true })
      .eq('id', user.id)
  }

  return { isComplete, hasAccount: true, stripeConfigured: true }
}
