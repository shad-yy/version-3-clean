import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const orderSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(200).toLowerCase().trim(),
  whatsapp: z.string().max(20).optional(),
  plan: z.enum([
    // Duration-based plan names
    '1 Month', '3 Months', '6 Months', '12 Months',
    // Marketing plan names (from BuyForm)
    'Starter', 'Popular', 'Standard', 'Ultimate',
    'Basic', 'Premium',
    // Trial
    'Free Trial Request',
  ]),
  message: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = orderSchema.safeParse(body)
    if (!parsed.success) {
      console.error('[ORDER] Validation failed:', parsed.error.flatten())
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { name, email, whatsapp, plan, message } = parsed.data

    const resendKey = process.env.RESEND_API_KEY
    // Primary: support@smartlivetv.co.uk forwards to formyownwork@gmail.com
    const notifyEmail = process.env.ORDER_NOTIFY_EMAIL || 'support@smartlivetv.co.uk'

    if (resendKey) {
      try {
        // Notify owner
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Smart Live TV <noreply@smartlivetv.co.uk>',
            to: [notifyEmail],
            subject: `New ${plan === 'Free Trial Request' ? 'Trial Request' : 'Order'}: ${plan} — ${name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <h2 style="color: #00e676;">New ${plan === 'Free Trial Request' ? 'Trial Request' : 'Order'} Received</h2>
                <table style="border-collapse: collapse; width: 100%;">
                  <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${name}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>WhatsApp</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${whatsapp || 'Not provided'}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Plan</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${plan}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Message</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${message || 'None'}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Time (UTC)</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${new Date().toUTCString()}</td></tr>
                </table>
                <p style="margin-top: 16px; color: #666;">Reply to this email to reach the customer at ${email}</p>
              </div>
            `,
            reply_to: email,
          }),
        })

        // Confirm to customer
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Smart Live TV <noreply@smartlivetv.co.uk>',
            to: [email],
            subject: plan === 'Free Trial Request'
              ? 'Your Free Trial Request — We\'ll Be In Touch Within 5 Minutes'
              : 'Your Smart Live TV Order — We\'ll Be In Touch Shortly',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <h2 style="color: #00e676;">Thanks, ${name}!</h2>
                ${plan === 'Free Trial Request'
                  ? `<p>We\'ve received your free trial request. Our team will send your login credentials to your WhatsApp${whatsapp ? ` (${whatsapp})` : ''} within <strong>5 minutes</strong>.</p>`
                  : `<p>We\'ve received your order for the <strong>${plan}</strong> plan. Our team will contact you within <strong>2 hours</strong> via WhatsApp${whatsapp ? ` (${whatsapp})` : ''} to get you set up.</p>`
                }
                <p>In the meantime, if you have any questions, feel free to reply to this email.</p>
                <br/>
                <p>The Smart Live TV Team<br/>
                <a href="https://smartlivetv.co.uk">smartlivetv.co.uk</a></p>
              </div>
            `,
          }),
        })
      } catch (emailErr) {
        // Log but don't fail the order
        console.error('[ORDER] Email send failed:', emailErr)
      }
    } else {
      console.warn('[ORDER] RESEND_API_KEY not set — email not sent. Order details:', { name, email, plan })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[ORDER ERROR]', err)
    return NextResponse.json(
      { success: false, error: 'Order processing failed' },
      { status: 500 }
    )
  }
}
