const escapeHtml=value=>String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
function emailFrame(content) {
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

export function supportEmailHtml({title,reference,ticket,message,link,user=false}){
 const e=escapeHtml;
 const details=user
  ? `<p style="margin:22px 0 0;font-size:15px;line-height:25px;color:#9b9b9f;">The Arvo team has replied to your support ticket. Sign in with the wallet used to create it to read the reply.</p>`
  : `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;table-layout:fixed;">${[["Subject",ticket.subject],["Category",ticket.category],["Name",ticket.name],["Wallet",ticket.ownerWallet||ticket.wallet||"Not provided"],["Email",ticket.email||"Not provided"]].map(([label,value])=>`<tr><td width="80" valign="top" style="padding:10px 0;border-bottom:1px solid #242426;font-size:12px;color:#6f6f74;">${e(label)}</td><td style="padding:10px 0;border-bottom:1px solid #242426;font-size:13px;color:#ffffff;overflow-wrap:anywhere;word-break:break-word;">${e(value)}</td></tr>`).join("")}</table><div style="margin-top:24px;padding:18px;border:1px solid #242426;border-radius:10px;background:#09090a;font-size:14px;line-height:24px;color:#d0d0d2;overflow-wrap:anywhere;word-break:break-word;">${e(message.body).replace(/\r?\n/g,"<br>")}</div>`;
 return emailFrame(`<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d9997b;">Support · #${e(reference)}</div><h1 style="margin:18px 0 0;font-size:30px;line-height:38px;letter-spacing:-1px;color:#ffffff;">${e(title)}</h1>${details}<div style="margin-top:30px;"><a href="${e(link)}" style="display:inline-block;background:#ffffff;color:#07090b;text-decoration:none;font-size:12px;font-weight:700;padding:14px 19px;border-radius:8px;">${user?"View your reply":"Open admin inbox"}</a></div><p style="margin:24px 0 0;font-size:12px;line-height:21px;color:#85858a;">${user?"Reply through your ticket in the Arvo app. This email does not grant access to the conversation.":"Reply through the admin inbox so the conversation is saved and the user is notified."}</p><p style="margin:14px 0 0;font-size:12px;line-height:21px;color:#85858a;">Arvo will never ask for your recovery phrase, private key or wallet password.</p>`);
}
