import { Resend } from 'resend';

const resend = new Resend('re_XDLWr8zP_8JeUAnEcWTT5BSdTnA3yWRvG');

async function test() {
  console.log('🚀 Tentative d\'envoi de l\'email de test...');
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'TapTip <contact@taptip.fr>',
      to: ['contact.taptip@gmail.com'],
      subject: 'Bienvenue chez TapTip ! 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <div style="text-align: center; padding: 40px 0;">
            <img src="https://app.taptip.fr/logo.png" alt="TapTip" width="80" height="80">
          </div>
          
          <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 24px; text-align: center;">
            Félicitations Maxim ! Votre badge est activé.
          </h1>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Bienvenue dans l'aventure TapTip. Vous êtes maintenant prêt à recevoir vos premiers pourboires et avis clients directement sur votre compte.
          </p>
          
          <div style="background-color: #f9fafb; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
            <h2 style="font-size: 18px; font-weight: bold; margin-top: 0; margin-bottom: 16px;">📚 Vos accès rapides :</h2>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 12px;">
                <strong>🏠 Votre espace personnel :</strong> <a href="https://app.taptip.fr" style="color: #000; font-weight: bold;">app.taptip.fr</a>
              </li>
              <li style="margin-bottom: 12px;">
                <strong>💡 Conseil :</strong> Ajoutez ce lien dans vos favoris ou sur votre écran d'accueil pour suivre vos gains en temps réel.
              </li>
            </ul>
          </div>
          
          <div style="text-align: center; padding-bottom: 40px;">
            <a href="https://app.taptip.fr" style="background-color: #000; color: #fff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">
              Gérer mon profil
            </a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-bottom: 24px;">
          
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            Besoin d'aide ? Répondez simplement à cet email.<br>
            © ${new Date().getFullYear()} TapTip. Tous droits réservés.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Erreur Resend:', error);
    } else {
      console.log('✅ Email envoyé avec succès ! ID:', data?.id);
    }
  } catch (err) {
    console.error('❌ Erreur technique :', err);
  }
}

test();
