// lib/buildTestEmail.ts
export function buildTestEmail() {
  return {
    subject: "Weather Email Test",
    text: "This is a test email from your weather system.",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #1e3a8a;">Weather Email Test</h2>
        <p>This is a test email sent from your dashboard to confirm MailerSend is working.</p>
        <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
          Sent automatically from your system.
        </p>
      </div>
    `,
  };
}
