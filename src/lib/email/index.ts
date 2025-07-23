import { Resend } from 'resend'
import { env } from '../config/env'

// Initialiser Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Email typer
export type EmailType = 
  | 'order-confirmation'
  | 'photographer-assigned'
  | 'order-completed'
  | 'images-ready'
  | 'password-reset'

// Base email data
interface BaseEmailData {
  to: string | string[]
  subject: string
}

// Spesifikke email data typer
export interface OrderConfirmationData extends BaseEmailData {
  type: 'order-confirmation'
  customerName: string
  orderNumber: number
  propertyAddress: string
  scheduledDate: Date
  photographerName?: string
}

export interface PhotographerAssignedData extends BaseEmailData {
  type: 'photographer-assigned'
  photographerName: string
  orderNumber: number
  propertyAddress: string
  scheduledDate: Date
  customerName: string
  customerPhone?: string
  specialInstructions?: string
}

export interface OrderCompletedData extends BaseEmailData {
  type: 'order-completed'
  customerName: string
  orderNumber: number
  propertyAddress: string
  downloadUrl: string
  expiresAt: Date
}

export interface ImagesReadyData extends BaseEmailData {
  type: 'images-ready'
  customerName: string
  orderNumber: number
  imageCount: number
  downloadUrl: string
}

export type EmailData = 
  | OrderConfirmationData 
  | PhotographerAssignedData 
  | OrderCompletedData
  | ImagesReadyData

// Email service klasse
export class EmailService {
  private from = 'IRiS <noreply@iris-app.no>'
  
  async send(data: EmailData): Promise<void> {
    try {
      let html: string
      let subject: string
      
      switch (data.type) {
        case 'order-confirmation':
          html = this.getOrderConfirmationTemplate(data)
          subject = data.subject || `Ordrebekreftelse #${data.orderNumber}`
          break
          
        case 'photographer-assigned':
          html = this.getPhotographerAssignedTemplate(data)
          subject = data.subject || `Nytt oppdrag: ${data.propertyAddress}`
          break
          
        case 'order-completed':
          html = this.getOrderCompletedTemplate(data)
          subject = data.subject || `Bildene dine er klare! Ordre #${data.orderNumber}`
          break
          
        case 'images-ready':
          html = this.getImagesReadyTemplate(data)
          subject = data.subject || `${data.imageCount} bilder klare for nedlasting`
          break
          
        default:
          throw new Error('Unknown email type')
      }
      
      const result = await resend.emails.send({
        from: this.from,
        to: Array.isArray(data.to) ? data.to : [data.to],
        subject,
        html,
        tags: [
          { name: 'type', value: data.type },
          { name: 'environment', value: env.NODE_ENV }
        ]
      })
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      console.log('Email sent:', result.data?.id)
    } catch (error) {
      console.error('Email error:', error)
      throw error
    }
  }
  
  // Email templates
  private getOrderConfirmationTemplate(data: OrderConfirmationData): string {
    const formattedDate = new Date(data.scheduledDate).toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ordrebekreftelse</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f1c35; padding: 40px 40px 30px 40px; text-align: center;">
              <h1 style="color: #5b9bd5; margin: 0; font-size: 32px;">IRiS</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Intelligent Real Estate Image System</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #0f1c35; margin: 0 0 20px 0; font-size: 24px;">Ordrebekreftelse</h2>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                Hei ${data.customerName},
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                Takk for din bestilling! Vi bekrefter herved at vi har mottatt din ordre for fotografering.
              </p>
              
              <!-- Order details -->
              <div style="background-color: #f8f9fa; border-radius: 6px; padding: 25px; margin: 0 0 30px 0;">
                <h3 style="color: #0f1c35; margin: 0 0 15px 0; font-size: 18px;">Ordredetaljer</h3>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Ordrenummer:</td>
                    <td style="padding: 8px 0; color: #0f1c35; font-size: 14px; font-weight: bold; text-align: right;">#${data.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Adresse:</td>
                    <td style="padding: 8px 0; color: #0f1c35; font-size: 14px; text-align: right;">${data.propertyAddress}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Fotodato:</td>
                    <td style="padding: 8px 0; color: #0f1c35; font-size: 14px; text-align: right;">${formattedDate}</td>
                  </tr>
                  ${data.photographerName ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Fotograf:</td>
                    <td style="padding: 8px 0; color: #0f1c35; font-size: 14px; text-align: right;">${data.photographerName}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                ${data.photographerName 
                  ? 'Fotografen vil ta kontakt for å bekrefte tidspunkt og eventuelle spesielle ønsker.'
                  : 'Vi vil tildele en fotograf snart og gi deg beskjed.'
                }
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                Du vil motta en ny e-post når bildene er klare for nedlasting.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}" 
                   style="display: inline-block; background-color: #5b9bd5; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  Se ordre
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 40px 0;">
              
              <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">
                Har du spørsmål? Ta kontakt med oss på <a href="mailto:support@iris-app.no" style="color: #5b9bd5;">support@iris-app.no</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 10px 0;">
                © ${new Date().getFullYear()} IRiS - Intelligent Real Estate Image System
              </p>
              <p style="color: #666666; font-size: 12px; margin: 0;">
                Denne e-posten ble sendt til ${data.to}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }
  
  private getPhotographerAssignedTemplate(data: PhotographerAssignedData): string {
    const formattedDate = new Date(data.scheduledDate).toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nytt oppdrag</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f1c35; padding: 40px 40px 30px 40px; text-align: center;">
              <h1 style="color: #5b9bd5; margin: 0; font-size: 32px;">Nytt oppdrag!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                Hei ${data.photographerName},
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                Du har fått tildelt et nytt fotograferingsoppdrag.
              </p>
              
              <!-- Assignment details -->
              <div style="background-color: #f8f9fa; border-radius: 6px; padding: 25px; margin: 0 0 30px 0;">
                <h3 style="color: #0f1c35; margin: 0 0 15px 0; font-size: 18px;">Oppdragsdetaljer</h3>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Ordrenummer:</td>
                    <td style="padding: 8px 0; color: #0f1c35; font-size: 14px; font-weight: bold; text-align: right;">#${data.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Adresse:</td>
                    <td style="padding: 8px 0; color: #0f1c35; font-size: 14px; font-weight: bold; text-align: right;">${data.propertyAddress}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Dato og tid:</td>
                    <td style="padding: 8px 0; color: #0f1c35; font-size: 14px; font-weight: bold; text-align: right;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Kunde:</td>
                    <td style="padding: 8px 0; color: #0f1c35; font-size: 14px; text-align: right;">${data.customerName}</td>
                  </tr>
                  ${data.customerPhone ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Kundetelefon:</td>
                    <td style="padding: 8px 0; color: #0f1c35; font-size: 14px; text-align: right;">${data.customerPhone}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              ${data.specialInstructions ? `
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; margin: 0 0 30px 0;">
                <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">Spesielle instruksjoner:</h4>
                <p style="color: #856404; font-size: 14px; line-height: 1.5; margin: 0;">
                  ${data.specialInstructions}
                </p>
              </div>
              ` : ''}
              
              <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                Vennligst bekreft at du kan ta dette oppdraget så snart som mulig.
              </p>
              
              <!-- CTA Buttons -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}" 
                   style="display: inline-block; background-color: #5b9bd5; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-size: 16px; font-weight: bold; margin: 0 10px;">
                  Se oppdrag
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 40px 0;">
              
              <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">
                Ved spørsmål, ta kontakt med kundeservice på <a href="mailto:support@iris-app.no" style="color: #5b9bd5;">support@iris-app.no</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center;">
              <p style="color: #666666; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} IRiS - Intelligent Real Estate Image System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }
  
  private getOrderCompletedTemplate(data: OrderCompletedData): string {
    const expiresDate = new Date(data.expiresAt).toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bildene dine er klare!</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header with success theme -->
          <tr>
            <td style="background-color: #28a745; padding: 40px 40px 30px 40px; text-align: center;">
              <div style="font-size: 60px; margin: 0 0 20px 0;">🎉</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Bildene dine er klare!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                Hei ${data.customerName},
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                Gode nyheter! Fotograferingen av <strong>${data.propertyAddress}</strong> er fullført og bildene er nå klare for nedlasting.
              </p>
              
              <!-- Order info -->
              <div style="background-color: #f8f9fa; border-radius: 6px; padding: 25px; margin: 0 0 30px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Ordrenummer:</td>
                    <td style="padding: 8px 0; color: #0f1c35; font-size: 14px; font-weight: bold; text-align: right;">#${data.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Eiendom:</td>
                    <td style="padding: 8px 0; color: #0f1c35; font-size: 14px; text-align: right;">${data.propertyAddress}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Download button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${data.downloadUrl}" 
                   style="display: inline-block; background-color: #28a745; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 18px; font-weight: bold;">
                  Last ned bilder
                </a>
              </div>
              
              <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 20px; margin: 30px 0;">
                <p style="color: #155724; font-size: 14px; margin: 0;">
                  <strong>Viktig:</strong> Nedlastingslenken utløper ${expiresDate}. 
                  Last ned bildene og lagre dem lokalt før denne datoen.
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 40px 0;">
              
              <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">
                Har du problemer med nedlastingen? Ta kontakt med oss på 
                <a href="mailto:support@iris-app.no" style="color: #5b9bd5;">support@iris-app.no</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 10px 0;">
                © ${new Date().getFullYear()} IRiS - Intelligent Real Estate Image System
              </p>
              <p style="color: #666666; font-size: 12px; margin: 0;">
                Denne e-posten ble sendt til ${data.to}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }
  
  private getImagesReadyTemplate(data: ImagesReadyData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bilder klare for nedlasting</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f1c35; padding: 40px 40px 30px 40px; text-align: center;">
              <div style="font-size: 50px; margin: 0 0 20px 0;">📸</div>
              <h1 style="color: #5b9bd5; margin: 0; font-size: 28px;">${data.imageCount} bilder klare!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                Hei ${data.customerName},
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                ${data.imageCount} nye bilder har blitt lastet opp for ordre #${data.orderNumber} og er nå klare for gjennomgang og nedlasting.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${data.downloadUrl}" 
                   style="display: inline-block; background-color: #5b9bd5; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  Se og last ned bilder
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 40px 0;">
              
              <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">
                Spørsmål? Kontakt oss på <a href="mailto:support@iris-app.no" style="color: #5b9bd5;">support@iris-app.no</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center;">
              <p style="color: #666666; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} IRiS - Intelligent Real Estate Image System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }
}

// Eksporter singleton instance
export const emailService = new EmailService()