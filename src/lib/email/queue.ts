import { prisma } from '../db/prisma'
import { emailService, EmailData } from './index'

// Email queue for retry og tracking
export interface EmailQueueItem {
  id: string
  type: EmailData['type']
  to: string | string[]
  data: any
  status: 'pending' | 'sent' | 'failed'
  attempts: number
  error?: string
  sentAt?: Date
  createdAt: Date
}

export class EmailQueue {
  // Send email med retry logic
  async send(data: EmailData): Promise<void> {
    try {
      // Send direkte først
      await emailService.send(data)
      
      // Log success i database (optional)
      await this.logEmail({
        type: data.type,
        to: data.to,
        status: 'sent',
        sentAt: new Date()
      })
    } catch (error: any) {
      console.error('Email send failed:', error)
      
      // Log failure
      await this.logEmail({
        type: data.type,
        to: data.to,
        status: 'failed',
        error: error.message
      })
      
      throw error
    }
  }
  
  // Retry failed emails
  async retryFailed(): Promise<void> {
    // Implementer retry logic her hvis ønskelig
  }
  
  // Log email for audit trail
  private async logEmail(data: {
    type: string
    to: string | string[]
    status: string
    error?: string
    sentAt?: Date
  }): Promise<void> {
    // Kan implementere logging til database her
    console.log('Email log:', data)
  }
}

export const emailQueue = new EmailQueue()