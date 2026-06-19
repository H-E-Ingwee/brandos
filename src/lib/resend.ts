import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Sender — use Resend's free domain for now, swap to your domain later
const FROM = 'BrandOS <onboarding@resend.dev>'
const REPLY_TO = 'Ingweplex@gmail.com'

function getResendClient() {
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  return resend
}

// ── WELCOME EMAIL ─────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string, businessName: string) {
  return getResendClient().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: `Welcome to BrandOS, ${name}! 🚀`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0F1D26;font-family:'Inter',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    
    <!-- Logo -->
    <div style="margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;background:#F25C05;border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:18px;">⚡</span>
        </div>
        <span style="color:white;font-size:20px;font-weight:700;">BrandOS</span>
        <span style="color:rgba(255,255,255,0.3);font-size:14px;">by Ingweplex</span>
      </div>
    </div>

    <!-- Hero -->
    <div style="background:#1A2E3D;border-radius:16px;padding:32px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.08);">
      <h1 style="color:white;font-size:28px;font-weight:700;margin:0 0 8px 0;">
        Habari ${name}! 👋
      </h1>
      <p style="color:rgba(255,255,255,0.6);font-size:16px;line-height:1.6;margin:0 0 24px 0;">
        Welcome to BrandOS. Your brand-building journey for <strong style="color:white;">${businessName}</strong> starts right now.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
         style="display:inline-block;background:#F25C05;color:white;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;">
        Open Your Dashboard →
      </a>
    </div>

    <!-- Steps -->
    <div style="background:#1A2E3D;border-radius:16px;padding:28px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.08);">
      <h2 style="color:white;font-size:18px;font-weight:600;margin:0 0 20px 0;">Your next 3 steps</h2>
      ${[
        ['1', '#F25C05', 'Complete Brand Discovery', 'Answer 14 questions about your business. Takes 10 minutes. Unlocks everything.'],
        ['2', '#D9910B', 'Generate Your Brand Strategy', 'Your AI coach builds your positioning, personas, and messaging framework.'],
        ['3', '#1A7A6E', 'Create Your First Content', 'Generate social media posts in your brand voice — ready to copy and post.'],
      ].map(([num, color, title, desc]) => `
        <div style="display:flex;gap:16px;margin-bottom:16px;align-items:flex-start;">
          <div style="width:32px;height:32px;background:${color}20;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid ${color}40;">
            <span style="color:${color};font-weight:700;font-size:14px;">${num}</span>
          </div>
          <div>
            <div style="color:white;font-weight:600;font-size:14px;margin-bottom:4px;">${title}</div>
            <div style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.5;">${desc}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:24px;border-top:1px solid rgba(255,255,255,0.05);">
      <p style="color:rgba(255,255,255,0.3);font-size:13px;margin:0 0 8px 0;">
        Questions? Reply to this email or WhatsApp us at +254 798 936 316
      </p>
      <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;">
        © 2026 Ingweplex Business & Branding Consultancy · Nairobi, Kenya
      </p>
    </div>
  </div>
</body>
</html>`,
  })
}

// ── PAYMENT RECEIPT EMAIL ─────────────────────────────────────────────────────
export async function sendPaymentReceiptEmail(
  to: string,
  name: string,
  plan: string,
  amount: number,
  currency: string,
  txRef: string,
  paymentMethod: string
) {
  const planDisplay = plan.charAt(0).toUpperCase() + plan.slice(1)
  const amountDisplay = currency === 'KES' ? `KES ${amount.toLocaleString()}` : `$${amount}`
  const date = new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })

  return resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: `Payment confirmed — BrandOS ${planDisplay} Plan ✅`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0F1D26;font-family:'Inter',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    
    <div style="margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;background:#F25C05;border-radius:10px;">
          <span style="color:white;font-size:18px;display:block;text-align:center;line-height:36px;">⚡</span>
        </div>
        <span style="color:white;font-size:20px;font-weight:700;">BrandOS</span>
      </div>
    </div>

    <!-- Success banner -->
    <div style="background:#1A7A6E20;border:1px solid #1A7A6E40;border-radius:16px;padding:24px;margin-bottom:24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">✅</div>
      <h1 style="color:white;font-size:24px;font-weight:700;margin:0 0 8px 0;">Payment Confirmed!</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;margin:0;">
        Your BrandOS <strong style="color:#1A7A6E;">${planDisplay} Plan</strong> is now active.
      </p>
    </div>

    <!-- Receipt details -->
    <div style="background:#1A2E3D;border-radius:16px;padding:28px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.08);">
      <h2 style="color:white;font-size:16px;font-weight:600;margin:0 0 20px 0;">Payment Receipt</h2>
      ${[
        ['Plan', `BrandOS ${planDisplay}`],
        ['Amount', amountDisplay],
        ['Payment Method', paymentMethod === 'mpesa' ? 'M-Pesa' : 'Card'],
        ['Date', date],
        ['Transaction Ref', txRef],
        ['Status', '✅ Confirmed'],
      ].map(([label, value], i) => `
        <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,${i === 5 ? '0' : '0.05'});">
          <span style="color:rgba(255,255,255,0.4);font-size:14px;">${label}</span>
          <span style="color:white;font-size:14px;font-weight:${label === 'Amount' ? '700' : '400'};">${value}</span>
        </div>
      `).join('')}
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
         style="display:inline-block;background:#F25C05;color:white;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;">
        Go to Dashboard →
      </a>
    </div>

    <div style="text-align:center;padding-top:24px;border-top:1px solid rgba(255,255,255,0.05);">
      <p style="color:rgba(255,255,255,0.3);font-size:13px;margin:0 0 8px 0;">
        Questions? Reply to this email or WhatsApp +254 798 936 316
      </p>
      <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;">
        © 2026 Ingweplex Business & Branding Consultancy · Nairobi, Kenya
      </p>
    </div>
  </div>
</body>
</html>`,
  })
}

// ── PLAN UPGRADE NOTIFICATION ─────────────────────────────────────────────────
export async function sendPlanUpgradeEmail(to: string, name: string, newPlan: string) {
  const planDisplay = newPlan.charAt(0).toUpperCase() + newPlan.slice(1)
  return resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: `You're now on BrandOS ${planDisplay}! 🎉`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0F1D26;font-family:'Inter',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#1A2E3D;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.08);">
      <h1 style="color:white;font-size:26px;font-weight:700;margin:0 0 12px 0;">
        Asante ${name}! 🎉
      </h1>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;margin:0 0 24px 0;">
        Your account has been upgraded to <strong style="color:#F25C05;">BrandOS ${planDisplay}</strong>. 
        All your new features are unlocked and ready to use.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
         style="display:inline-block;background:#F25C05;color:white;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;">
        Explore Your New Features →
      </a>
    </div>
    <div style="text-align:center;padding-top:24px;">
      <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;">
        © 2026 Ingweplex · Nairobi, Kenya · Ingweplex@gmail.com
      </p>
    </div>
  </div>
</body>
</html>`,
  })
}