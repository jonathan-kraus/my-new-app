/*
 * @FilePath: \my-new-app\lib\buildSendWeatherEmail.ts
 * @LastEditTime: 2026-02-25 14:00:27
 */

export function buildSendWeatherEmail() {
  return {
    subject: "Send Weather Email Test",
    text: "This is a development email from your travel send weather system.",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #1e3a8a;">Weather Email Test</h2>
        <p> This is a test email sent from buildSendWeatherEmail in future will be weather email.</p>
        <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
          Sent automatically from your system.
        </p>
      </div>
    `,
  };
}
