// src/services/emailService.ts - Service d'envoi d'emails
import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailData {
  to: string | string[];
  subject: string;
  message: string;
  html?: string;
  actionUrl?: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendNotification(data: EmailData): Promise<void> {
    const html = this.generateNotificationHTML(data);
    
    await this.send({
      ...data,
      html,
    });
  }

  async sendWelcome(userEmail: string, userName: string): Promise<void> {
    const html = this.generateWelcomeHTML(userName);
    
    await this.send({
      to: userEmail,
      subject: 'Bienvenue sur CareFlow Sénégal',
      message: `Bienvenue ${userName}! Votre compte CareFlow a été créé avec succès.`,
      html,
    });
  }

  async sendPasswordReset(userEmail: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = this.generatePasswordResetHTML(resetUrl);
    
    await this.send({
      to: userEmail,
      subject: 'Réinitialisation de votre mot de passe CareFlow',
      message: `Cliquez sur ce lien pour réinitialiser votre mot de passe: ${resetUrl}`,
      html,
    });
  }

  private async send(data: EmailData): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"CareFlow Sénégal" <${process.env.SMTP_FROM || 'noreply@careflow.sn'}>`,
        to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
        subject: data.subject,
        text: data.message,
        html: data.html || data.message,
        attachments: data.attachments,
      });
    } catch (error) {
      console.error('Erreur envoi email:', error);
      throw new Error('Impossible d\'envoyer l\'email');
    }
  }

  private generateNotificationHTML(data: EmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { 
            display: inline-block; 
            background: #3b82f6; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CareFlow Sénégal</h1>
          </div>
          <div class="content">
            <h2>${data.subject}</h2>
            <p>${data.message}</p>
            ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">Voir les détails</a>` : ''}
          </div>
          <div class="footer">
            <p>CareFlow Sénégal - Votre plateforme e-santé</p>
            <p>Avenue Léopold Sédar Senghor, Dakar, Sénégal</p>
            <p>+221 33 123 45 67 | contact@careflow.sn</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateWelcomeHTML(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue sur CareFlow</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .feature { 
            background: white; 
            padding: 20px; 
            margin: 15px 0; 
            border-left: 4px solid #3b82f6; 
            border-radius: 5px; 
          }
          .button { 
            display: inline-block; 
            background: #3b82f6; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
            font-weight: bold;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue ${userName}!</h1>
            <p>Votre compte CareFlow a été créé avec succès</p>
          </div>
          <div class="content">
            <h2>Découvrez CareFlow Sénégal</h2>
            <p>Nous sommes ravis de vous accueillir sur notre plateforme e-santé. Voici ce que vous pouvez faire:</p>
            
            <div class="feature">
              <h3>📅 Prendre des rendez-vous</h3>
              <p>Réservez facilement vos consultations avec les meilleurs médecins du Sénégal</p>
            </div>
            
            <div class="feature">
              <h3>🏥 Trouver des établissements</h3>
              <p>Localisez les hôpitaux, cliniques et centres médicaux près de chez vous</p>
            </div>
            
            <div class="feature">
              <h3>🛡️ Gérer votre assurance</h3>
              <p>Consultez votre couverture santé et gérez vos remboursements</p>
            </div>
            
            <div class="feature">
              <h3>📱 Téléconsultation</h3>
              <p>Consultez vos médecins à distance en toute sécurité</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL}/login" class="button">Accéder à mon compte</a>
          </div>
          <div class="footer">
            <p>CareFlow Sénégal - Votre plateforme e-santé</p>
            <p>Avenue Léopold Sédar Senghor, Dakar, Sénégal</p>
            <p>+221 33 123 45 67 | contact@careflow.sn</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetHTML(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation mot de passe</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { 
            display: inline-block; 
            background: #dc2626; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
            font-weight: bold;
          }
          .warning { 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Réinitialisation mot de passe</h1>
          </div>
          <div class="content">
            <h2>Demande de réinitialisation</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe CareFlow.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe:</p>
            
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            
            <div class="warning">
              <p><strong>⚠️ Important:</strong></p>
              <ul>
                <li>Ce lien expire dans 1 heure</li>
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                <li>Ne partagez jamais ce lien avec personne</li>
              </ul>
            </div>
            
            <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur:</p>
            <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
          </div>
          <div class="footer">
            <p>CareFlow Sénégal - Votre plateforme e-santé</p>
            <p>Avenue Léopold Sédar Senghor, Dakar, Sénégal</p>
            <p>+221 33 123 45 67 | contact@careflow.sn</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();