import nodemailer from "nodemailer";

// Emails a form submission to the team inbox in the dark Arvo style used by the contact form.
// Returns false when SMTP isn't configured (staging), so the caller can answer 503.

const esc = (v: string) => v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

export function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendTeamEnquiry(input: {
  to?: string;
  kicker: string;
  heading: string;
  subject: string;
  replyTo: string;
  rows: [string, string][];
  bodyLabel: string;
  body: string;
  footer: string;
}) {
  if (!smtpConfigured()) return false;
  const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || "465"), secure: process.env.SMTP_SECURE === "true", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  const html = `<!doctype html><html><body style="margin:0;background:#07090b;font-family:Arial,Helvetica,sans-serif;color:#fff;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07090b;"><tr><td align="center" style="padding:40px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;"><tr><td style="padding:0 0 24px;"><img src="https://arvoprotocol.com/arvo-email-logo.png" width="150" alt="Arvo" style="display:block;width:150px;height:auto;border:0;"></td></tr><tr><td style="border:1px solid #292426;border-radius:18px;background:#0d0d0e;padding:40px;"><div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d9997b;">${esc(input.kicker)}</div><h1 style="margin:18px 0 0;font-size:30px;line-height:36px;letter-spacing:-1px;color:#fff;">${esc(input.heading)}</h1><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">${input.rows.map(([k, v]) => `<tr><td style="padding:12px 0;border-bottom:1px solid #242426;font-size:12px;color:#6f6f74;">${esc(k)}</td><td align="right" style="padding:12px 0;border-bottom:1px solid #242426;font-size:13px;font-weight:700;color:#fff;">${esc(v)}</td></tr>`).join("")}</table><div style="margin-top:26px;font-size:10px;font-weight:700;letter-spacing:1.7px;text-transform:uppercase;color:#66666b;">${esc(input.bodyLabel)}</div><p style="margin:12px 0 0;font-size:15px;line-height:25px;color:#d0d0d2;">${esc(input.body).replace(/\n/g, "<br>")}</p></td></tr><tr><td style="padding:22px 8px 0;font-size:11px;line-height:18px;color:#69696d;">ARVO PROTOCOL<br>${esc(input.footer)}</td></tr></table></td></tr></table></body></html>`;
  await transport.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || "Arvo Protocol"}" <${process.env.MAIL_FROM_ADDRESS || "team@arvoprotocol.com"}>`,
    to: input.to || process.env.MAIL_TEAM_ADDRESS || "team@arvoprotocol.com",
    replyTo: { address: input.replyTo },
    subject: input.subject,
    html,
    text: [input.kicker, "", ...input.rows.map(([k, v]) => `${k}: ${v}`), "", `${input.bodyLabel}:`, input.body].join("\n"),
  });
  return true;
}
