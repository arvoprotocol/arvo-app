import "server-only";

import nodemailer from "nodemailer";

type PlatformSignupType = "email" | "telegram";

type SignupNotification = {
  type: PlatformSignupType;
  contact: string;
  createdAt: Date;
};

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user,
      pass,
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fromAddress() {
  const name = process.env.MAIL_FROM_NAME || "Arvo Protocol";
  const address =
    process.env.MAIL_FROM_ADDRESS || "team@arvoprotocol.com";

  return `"${name}" <${address}>`;
}

function emailFrame(content: string) {
  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#07090b;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#07090b;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;">
            <tr>
              <td style="padding:0 0 24px;">
                <img
                  src="https://arvoprotocol.com/arvo-email-logo.png"
                  width="150"
                  alt="Arvo"
                  style="display:block;width:150px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;"
                >
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #292426;border-radius:18px;background:#0d0d0e;padding:42px 40px;">
                ${content}
              </td>
            </tr>

            <tr>
              <td style="padding:24px 8px 0;font-size:11px;line-height:18px;color:#69696d;">
                ARVO PROTOCOL<br>
                Building a treasury through operating businesses and disciplined capital allocation.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function confirmationHtml() {
  return emailFrame(`
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d9997b;">
      App access
    </div>

    <h1 style="margin:18px 0 0;font-size:36px;line-height:42px;letter-spacing:-1.5px;color:#ffffff;">
      You're on the list.
    </h1>

    <p style="margin:22px 0 0;font-size:15px;line-height:25px;color:#9b9b9f;">
      Thanks for registering for Arvo app updates. The app is being prepared for launch and we'll let you know when access opens.
    </p>

    <div style="margin-top:30px;padding-top:26px;border-top:1px solid #242426;">
      <div style="font-size:10px;font-weight:700;letter-spacing:1.7px;text-transform:uppercase;color:#66666b;">
        The Arvo app
      </div>

      <p style="margin:12px 0 0;font-size:14px;line-height:25px;color:#d0d0d2;">
        Vaults&nbsp;&nbsp;·&nbsp;&nbsp;Portfolio&nbsp;&nbsp;·&nbsp;&nbsp;Projects&nbsp;&nbsp;·&nbsp;&nbsp;Rewards&nbsp;&nbsp;·&nbsp;&nbsp;Treasury reporting&nbsp;&nbsp;·&nbsp;&nbsp;Protocol activity
      </p>
    </div>

    <div style="margin-top:30px;">
      <a href="https://arvoprotocol.com/platform"
         style="display:inline-block;background:#ffffff;color:#07090b;text-decoration:none;font-size:12px;font-weight:700;padding:13px 18px;border-radius:8px;">
        View Arvo app
      </a>
    </div>
  `);
}

function teamHtml({
  type,
  contact,
  createdAt,
}: SignupNotification) {
  const submitted = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(createdAt);

  return emailFrame(`
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d9997b;">
      App signup
    </div>

    <h1 style="margin:18px 0 0;font-size:32px;line-height:38px;letter-spacing:-1.2px;color:#ffffff;">
      New app registration.
    </h1>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:30px;">
      <tr>
        <td style="padding:13px 0;border-bottom:1px solid #242426;font-size:12px;color:#6f6f74;">Method</td>
        <td align="right" style="padding:13px 0;border-bottom:1px solid #242426;font-size:13px;font-weight:700;color:#ffffff;">
          ${type === "email" ? "Email" : "Telegram"}
        </td>
      </tr>

      <tr>
        <td style="padding:13px 0;border-bottom:1px solid #242426;font-size:12px;color:#6f6f74;">Contact</td>
        <td align="right" style="padding:13px 0;border-bottom:1px solid #242426;font-size:13px;font-weight:700;color:#ffffff;">
          ${escapeHtml(contact)}
        </td>
      </tr>

      <tr>
        <td style="padding:13px 0;border-bottom:1px solid #242426;font-size:12px;color:#6f6f74;">Source</td>
        <td align="right" style="padding:13px 0;border-bottom:1px solid #242426;font-size:13px;font-weight:700;color:#ffffff;">
          App
        </td>
      </tr>

      <tr>
        <td style="padding:13px 0;font-size:12px;color:#6f6f74;">Submitted</td>
        <td align="right" style="padding:13px 0;font-size:13px;font-weight:700;color:#ffffff;">
          ${submitted}
        </td>
      </tr>
    </table>
  `);
}

export async function sendPlatformSignupEmails(
  signup: SignupNotification
) {
  const transport = getTransport();

  const teamAddress =
    process.env.MAIL_TEAM_ADDRESS || "team@arvoprotocol.com";

  // Internal notification for every signup.
  await transport.sendMail({
    from: fromAddress(),
    to: teamAddress,
    subject: `New Arvo app signup: ${
      signup.type === "email" ? "Email" : "Telegram"
    }`,
    html: teamHtml(signup),
    text: [
      "New Arvo app registration",
      "",
      `Method: ${signup.type}`,
      `Contact: ${signup.contact}`,
      "Source: App",
      `Submitted: ${signup.createdAt.toISOString()}`,
    ].join("\n"),
  });

  // Confirmation can only be sent directly to email signups.
  if (signup.type === "email") {
    await transport.sendMail({
      from: fromAddress(),
      to: signup.contact,
      subject: "You're on the Arvo app list",
      html: confirmationHtml(),
      text: [
        "You're on the Arvo app list.",
        "",
        "Thanks for registering for Arvo app updates.",
        "The app is being prepared for launch and we'll let you know when access opens.",
        "",
        "Vaults · Portfolio · Projects · Rewards · Treasury reporting · Protocol activity",
        "",
        "Arvo Protocol",
        "https://arvoprotocol.com/platform",
      ].join("\n"),
    });
  }
}

type StrategicPartnerRegistrationEmail = {
  name: string;
  email: string;
  registrationUrl: string;
};

function partnerRegistrationHtml({
  name,
  registrationUrl,
}: StrategicPartnerRegistrationEmail) {
  const firstName = name.trim().split(/\s+/)[0] || name;

  return emailFrame(`
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d9997b;">
      Strategic Partner registration
    </div>

    <h1 style="margin:18px 0 0;font-size:34px;line-height:40px;letter-spacing:-1.3px;color:#ffffff;">
      Confirm your Arvo wallet.
    </h1>

    <p style="margin:22px 0 0;font-size:15px;line-height:25px;color:#9b9b9f;">
      Hi ${escapeHtml(firstName)},
    </p>

    <p style="margin:14px 0 0;font-size:15px;line-height:25px;color:#9b9b9f;">
      As part of preparing your Arvo Strategic Partner allocation, we need you to confirm the wallet address you would like associated with your allocation.
    </p>

    <p style="margin:14px 0 0;font-size:15px;line-height:25px;color:#9b9b9f;">
      $ARVO operates on Robinhood Chain. The registration page will show the wallet we currently have on record and guide you through confirming it or requesting a different wallet.
    </p>

    <div style="margin-top:30px;">
      <a href="${escapeHtml(registrationUrl)}"
         style="display:inline-block;background:#ffffff;color:#07090b;text-decoration:none;font-size:12px;font-weight:700;padding:14px 19px;border-radius:8px;">
        Confirm wallet
      </a>
    </div>

    <div style="margin-top:30px;padding-top:26px;border-top:1px solid #242426;">
      <div style="font-size:10px;font-weight:700;letter-spacing:1.7px;text-transform:uppercase;color:#66666b;">
        Security
      </div>

      <p style="margin:12px 0 0;font-size:13px;line-height:23px;color:#85858a;">
        Arvo will never ask for your seed phrase, private key or wallet password. Registration only records the public wallet address associated with your allocation.
      </p>
    </div>
  `);
}

function partnerConfirmedHtml(name: string, wallet: string) {
  const firstName = name.trim().split(/\s+/)[0] || name;

  return emailFrame(`
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d9997b;">
      Wallet confirmed
    </div>

    <h1 style="margin:18px 0 0;font-size:34px;line-height:40px;letter-spacing:-1.3px;color:#ffffff;">
      Registration complete.
    </h1>

    <p style="margin:22px 0 0;font-size:15px;line-height:25px;color:#9b9b9f;">
      Hi ${escapeHtml(firstName)},
    </p>

    <p style="margin:14px 0 0;font-size:15px;line-height:25px;color:#9b9b9f;">
      Your wallet has been registered for your Arvo Strategic Partner allocation. There is nothing else you need to do at this stage.
    </p>

    <div style="margin-top:28px;padding:18px;border:1px solid #242426;border-radius:10px;background:#09090a;">
      <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#66666b;">
        Registered wallet
      </div>

      <div style="margin-top:10px;font-family:monospace;font-size:12px;line-height:20px;color:#d0d0d2;word-break:break-all;">
        ${escapeHtml(wallet)}
      </div>
    </div>

    <p style="margin:24px 0 0;font-size:13px;line-height:23px;color:#85858a;">
      We'll follow up shortly with access to your partner dashboard, where you'll be able to view your $ARVO allocation, vesting schedule, vested and available tokens, and distribution history.
    </p>

    <p style="margin:14px 0 0;font-size:13px;line-height:23px;color:#85858a;">
      There's nothing else you need to do at this stage.
    </p>
  `);
}

export async function sendStrategicPartnerRegistrationEmail(
  partner: StrategicPartnerRegistrationEmail
) {
  const transport = getTransport();

  await transport.sendMail({
    from: fromAddress(),
    to: partner.email,
    subject: "Confirm your wallet for Arvo",
    html: partnerRegistrationHtml(partner),
    text: [
      `Hi ${partner.name.trim().split(/\s+/)[0] || partner.name},`,
      "",
      "As part of preparing your Arvo Strategic Partner allocation, we need you to confirm the wallet address you would like associated with your allocation.",
      "",
      "$ARVO operates on Robinhood Chain. Use the secure registration link below to confirm the wallet we currently have on record or request a different wallet.",
      "",
      partner.registrationUrl,
      "",
      "Arvo will never ask for your seed phrase, private key or wallet password.",
      "",
      "Arvo Protocol",
    ].join("\n"),
  });
}

export async function sendStrategicPartnerConfirmationEmail({
  name,
  email,
  wallet,
}: {
  name: string;
  email: string;
  wallet: string;
}) {
  const transport = getTransport();

  await transport.sendMail({
    from: fromAddress(),
    to: email,
    subject: "Your Arvo wallet is confirmed",
    html: partnerConfirmedHtml(name, wallet),
    text: [
      `Hi ${name.trim().split(/\s+/)[0] || name},`,
      "",
      "Your wallet has been registered for your Arvo Strategic Partner allocation.",
      "",
      `Registered wallet: ${wallet}`,
      "",
      "We'll follow up shortly with access to your partner dashboard, where you'll be able to view your $ARVO allocation, vesting schedule, vested and available tokens, and distribution history.",
      "",
      "There's nothing else you need to do at this stage.",
      "",
      "Arvo Protocol",
    ].join("\n"),
  });
}

export type AdminBroadcastRecipient = {
  email: string;
  name?: string | null;
};

function broadcastBodyHtml(body: string, recipientName?: string | null, unsubscribeUrl?: string) {
  const firstName = recipientName?.trim().split(/\s+/)[0] || "";

  const personalised = body.replace(
    /\[First name\]/gi,
    firstName || ""
  );

  const blocks = personalised
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const content = blocks
    .map((block) => {
      if (block.startsWith("## ")) {
        return `
          <div style="margin:32px 0 13px;font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#d9997b;">
            ${escapeHtml(block.slice(3))}
          </div>
        `;
      }

      if (block === "[Visit Arvo]") {
        return `
          <div style="margin:30px 0;">
            <a
              href="https://arvoprotocol.com"
              style="display:inline-block;background:#ffffff;color:#07090b;text-decoration:none;font-size:12px;font-weight:700;padding:14px 20px;border-radius:8px;"
            >
              Visit Arvo
            </a>

            <div style="margin-top:11px;font-size:11px;line-height:18px;color:#66666b;">
              arvoprotocol.com
            </div>
          </div>
        `;
      }

      return `
        <p style="margin:0 0 17px;font-size:15px;line-height:25px;color:#9b9b9f;">
          ${escapeHtml(block).replace(/\n/g, "<br>")}
        </p>
      `;
    })
    .join("");

  return emailFrame(`
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d9997b;">
      Arvo update
    </div>

    <h1 style="margin:18px 0 28px;font-size:34px;line-height:40px;letter-spacing:-1.3px;color:#ffffff;">
      Project update.
    </h1>

    <div>
      ${content}
    </div>
    ${unsubscribeUrl ? `
    <p style="margin:32px 0 0;font-size:11px;line-height:18px;color:#66666b;">
      You are receiving this because you joined the Arvo waitlist.
      <a href="${escapeHtml(unsubscribeUrl)}" style="color:#9b9b9f;text-decoration:underline;">Unsubscribe</a>
    </p>` : ""}
  `);
}

function broadcastPlainText(body: string, recipientName?: string | null, unsubscribeUrl?: string) {
  const firstName = recipientName?.trim().split(/\s+/)[0] || "";
  const footer = unsubscribeUrl
    ? `\n\n--\nYou are receiving this because you joined the Arvo waitlist.\nUnsubscribe: ${unsubscribeUrl}`
    : "";

  return body
    .replace(/\[First name\]/gi, firstName)
    .replace(/^##\s+/gm, "")
    .replace(
      /\[Visit Arvo\]/g,
      "Visit Arvo: https://arvoprotocol.com"
    ) + footer;
}

export async function sendAdminBroadcastEmail({
  recipient,
  subject,
  body,
  unsubscribe,
}: {
  recipient: AdminBroadcastRecipient;
  subject: string;
  body: string;
  /** Waitlist mail: page link for the footer and RFC 8058 one-click URL. */
  unsubscribe?: { page: string; oneClick: string };
}) {
  const transport = getTransport();

  await transport.sendMail({
    from: fromAddress(),
    to: recipient.email,
    subject,
    html: broadcastBodyHtml(body, recipient.name, unsubscribe?.page),
    text: broadcastPlainText(body, recipient.name, unsubscribe?.page),
    ...(unsubscribe ? {
      headers: {
        "List-Unsubscribe": `<${unsubscribe.oneClick}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    } : {}),
  });
}
