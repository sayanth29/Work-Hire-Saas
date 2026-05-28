import nodemailer from 'nodemailer'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  await transporter.sendMail({
    from: `"WorkHire" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
}

// ── Templates ────────────────────────────────────

export function verifyEmailTemplate({
  name,
  verifyUrl,
}: {
  name: string
  verifyUrl: string
}): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h1 style="color:#3C3489;font-size:22px;margin-bottom:4px;">WorkHire</h1>
      <hr style="border:none;border-top:1px solid #eee;margin-bottom:28px;" />
      <h2 style="font-size:18px;color:#111;">Verify your email address</h2>
      <p style="color:#555;line-height:1.6;">
        Hi <strong>${name}</strong>, thanks for signing up!
        Click below to verify your email. Link expires in <strong>24 hours</strong>.
      </p>
      <a href="${verifyUrl}"
        style="display:inline-block;margin:24px 0;padding:12px 32px;
               background:#3C3489;color:#fff;border-radius:8px;
               text-decoration:none;font-weight:600;">
        Verify Email
      </a>
      <p style="color:#999;font-size:13px;">
        If you didn't create an account, ignore this email.
      </p>
    </div>
  `
}

export function companyVerifyEmailTemplate({
  name,
  verifyUrl,
}: {
  name: string
  verifyUrl: string
}): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h1 style="color:#3C3489;font-size:22px;margin-bottom:4px;">WorkHire</h1>
      <hr style="border:none;border-top:1px solid #eee;margin-bottom:28px;" />
      <h2 style="font-size:18px;color:#111;">Verify your company email</h2>
      <p style="color:#555;line-height:1.6;">
        Hi <strong>${name}</strong>, your company registration is almost done!
        Verify your email first, then our admin team will review your account.
      </p>
      <a href="${verifyUrl}"
        style="display:inline-block;margin:24px 0;padding:12px 32px;
               background:#3C3489;color:#fff;border-radius:8px;
               text-decoration:none;font-weight:600;">
        Verify Company Email
      </a>
      <p style="color:#999;font-size:13px;">
        After verification, approval usually takes 24–48 hours.
      </p>
    </div>
  `
}

export function companyApprovedTemplate({ name }: { name: string }): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h1 style="color:#3C3489;font-size:22px;margin-bottom:4px;">WorkHire</h1>
      <hr style="border:none;border-top:1px solid #eee;margin-bottom:28px;" />
      <h2 style="font-size:18px;color:#111;">🎉 Your company is approved!</h2>
      <p style="color:#555;line-height:1.6;">
        Hi <strong>${name}</strong>, your company has been approved.
        You can now post jobs and start hiring!
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/company/dashboard"
        style="display:inline-block;margin:24px 0;padding:12px 32px;
               background:#3C3489;color:#fff;border-radius:8px;
               text-decoration:none;font-weight:600;">
        Go to Dashboard
      </a>
    </div>
  `
}

export function companyRejectedTemplate({
  name,
  reason,
}: {
  name: string
  reason: string
}): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h1 style="color:#3C3489;font-size:22px;margin-bottom:4px;">WorkHire</h1>
      <hr style="border:none;border-top:1px solid #eee;margin-bottom:28px;" />
      <h2 style="font-size:18px;color:#111;">Company application update</h2>
      <p style="color:#555;line-height:1.6;">
        Hi <strong>${name}</strong>, unfortunately your company registration
        was not approved for the following reason:
      </p>
      <p style="color:#e53e3e;background:#fff5f5;padding:12px;border-radius:6px;">
        ${reason}
      </p>
      <p style="color:#555;">Contact support if you think this was a mistake.</p>
    </div>
  `
}

export function applicationReceivedTemplate({
  recruiterName,
  jobTitle,
  seekerName,
}: {
  recruiterName: string
  jobTitle: string
  seekerName: string
}): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h1 style="color:#3C3489;font-size:22px;margin-bottom:4px;">WorkHire</h1>
      <hr style="border:none;border-top:1px solid #eee;margin-bottom:28px;" />
      <h2 style="font-size:18px;color:#111;">New application received</h2>
      <p style="color:#555;line-height:1.6;">
        Hi <strong>${recruiterName}</strong>,
        <strong>${seekerName}</strong> has applied for
        <strong>${jobTitle}</strong>.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/company/dashboard/applicants"
        style="display:inline-block;margin:24px 0;padding:12px 32px;
               background:#3C3489;color:#fff;border-radius:8px;
               text-decoration:none;font-weight:600;">
        View Application
      </a>
    </div>
  `
}

export function statusChangedTemplate({
  seekerName,
  jobTitle,
  status,
}: {
  seekerName: string
  jobTitle: string
  status: string
}): string {
  const colors: Record<string, string> = {
    reviewed:  '#3C3489',
    interview: '#0F6E56',
    hired:     '#276749',
    rejected:  '#e53e3e',
  }

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h1 style="color:#3C3489;font-size:22px;margin-bottom:4px;">WorkHire</h1>
      <hr style="border:none;border-top:1px solid #eee;margin-bottom:28px;" />
      <h2 style="font-size:18px;color:#111;">Application status update</h2>
      <p style="color:#555;line-height:1.6;">
        Hi <strong>${seekerName}</strong>, your application for
        <strong>${jobTitle}</strong> has been updated.
      </p>
      <span style="display:inline-block;padding:8px 20px;border-radius:20px;
                   background:${colors[status] || '#3C3489'};
                   color:#fff;font-weight:600;text-transform:uppercase;
                   font-size:12px;letter-spacing:1px;">
        ${status}
      </span>
      <br/>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/applications"
        style="display:inline-block;margin:24px 0;padding:12px 32px;
               background:#3C3489;color:#fff;border-radius:8px;
               text-decoration:none;font-weight:600;">
        View Application
      </a>
    </div>
  `
}

export function resetPasswordTemplate({
  name,
  resetUrl,
}: {
  name: string
  resetUrl: string
}): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h1 style="color:#3C3489;font-size:22px;margin-bottom:4px;">WorkHire</h1>
      <hr style="border:none;border-top:1px solid #eee;margin-bottom:28px;" />
      <h2 style="font-size:18px;color:#111;">Reset your password</h2>
      <p style="color:#555;line-height:1.6;">
        Hi <strong>${name}</strong>, click below to reset your password.
        This link expires in <strong>1 hour</strong>.
      </p>
      <a href="${resetUrl}"
        style="display:inline-block;margin:24px 0;padding:12px 32px;
               background:#3C3489;color:#fff;border-radius:8px;
               text-decoration:none;font-weight:600;">
        Reset Password
      </a>
      <p style="color:#999;font-size:13px;">
        If you didn't request this, ignore this email.
      </p>
    </div>
  `
}