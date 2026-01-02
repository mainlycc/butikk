import { resend, FROM_EMAIL } from './client'
import { generateInvitationEmail } from './templates/invitation-email'
import { generateResetPasswordEmail } from './templates/reset-password-email'
import { generateRejectionEmail } from './templates/rejection-email'

export type SendInvitationEmailParams = {
  to: string
  invitationLink: string
  expiryDays?: number
}

export type SendPasswordResetEmailParams = {
  to: string
  resetLink: string
  expiryHours?: number
}

export type SendRejectionEmailParams = {
  to: string
  fullName: string
  reason?: string
}

export type SendEmailResult = {
  success: boolean
  error?: string
  messageId?: string
}

export async function sendInvitationEmail({
  to,
  invitationLink,
  expiryDays = 7,
}: SendInvitationEmailParams): Promise<SendEmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set in environment variables')
      return { success: false, error: 'RESEND_API_KEY is not configured' }
    }

    const html = generateInvitationEmail('Nowy Użytkownik', invitationLink, expiryDays)

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Zaproszenie do Butik Kandydatów - Aktywuj swoje konto',
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    console.log('Email sent successfully:', data)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Unexpected error sending email:', error)
    return { success: false, error: 'Nieoczekiwany błąd podczas wysyłania emaila' }
  }
}

export async function sendPasswordResetEmail({
  to,
  resetLink,
  expiryHours = 1,
}: SendPasswordResetEmailParams): Promise<SendEmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set in environment variables')
      return { success: false, error: 'RESEND_API_KEY is not configured' }
    }

    const html = generateResetPasswordEmail(resetLink, expiryHours)

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Resetowanie hasła - Butik Kandydatów',
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    console.log('Password reset email sent successfully:', data)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Unexpected error sending password reset email:', error)
    return { success: false, error: 'Nieoczekiwany błąd podczas wysyłania emaila' }
  }
}

export async function sendRejectionEmail({
  to,
  fullName,
  reason,
}: SendRejectionEmailParams): Promise<SendEmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set in environment variables')
      return { success: false, error: 'RESEND_API_KEY is not configured' }
    }

    const html = generateRejectionEmail(fullName, reason)

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Odpowiedź na zgłoszenie - Butik Kandydatów',
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    console.log('Rejection email sent successfully:', data)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Unexpected error sending rejection email:', error)
    return { success: false, error: 'Nieoczekiwany błąd podczas wysyłania emaila' }
  }
}

