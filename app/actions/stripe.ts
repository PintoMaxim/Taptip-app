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
  try {
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
  } catch (err) {
    console.error('Erreur getStripeOnboardingLink:', err)
    return { error: 'Erreur lors de la connexion à Stripe' }
  }
}

// Payer un parrain (Transfer Stripe Connect)
export async function payReferrer(referralId: string) {
  if (!isStripeConfigured() || !stripe) {
    return { error: 'Stripe non configuré' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Vérifier que c'est un admin
  const adminEmail = process.env.ADMIN_EMAIL || 'contact.taptip@gmail.com'
  if (user.email !== adminEmail) {
    return { error: 'Accès non autorisé' }
  }

  // Récupérer le parrainage
  const { data: referral, error: refError } = await supabase
    .from('referrals')
    .select(`
      id,
      referrer_id,
      status,
      amount
    `)
    .eq('id', referralId)
    .single()

  if (refError || !referral) {
    return { error: 'Parrainage introuvable' }
  }

  if (referral.status !== 'pending') {
    return { error: 'Ce parrainage a déjà été traité' }
  }

  // Récupérer le compte Stripe du parrain
  const { data: referrer, error: userError } = await supabase
    .from('users')
    .select('stripe_account_id, first_name, last_name')
    .eq('id', referral.referrer_id)
    .single()

  if (userError || !referrer?.stripe_account_id) {
    return { error: 'Le parrain n\'a pas de compte Stripe configuré' }
  }

  try {
    // Créer le transfert Stripe (10€ = 1000 centimes)
    const transfer = await stripe.transfers.create({
      amount: referral.amount, // En centimes (1000 = 10€)
      currency: 'eur',
      destination: referrer.stripe_account_id,
      description: `Bonus parrainage TapTip`,
      metadata: {
        referral_id: referralId,
        referrer_id: referral.referrer_id,
      },
    })

    // Mettre à jour le statut du parrainage
    await supabase
      .from('referrals')
      .update({
        status: 'paid',
        stripe_transfer_id: transfer.id,
        paid_at: new Date().toISOString()
      })
      .eq('id', referralId)

    return { success: true, transferId: transfer.id }
  } catch (err) {
    console.error('Erreur transfert Stripe:', err)
    return { error: 'Erreur lors du transfert Stripe. Vérifiez votre solde.' }
  }
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
