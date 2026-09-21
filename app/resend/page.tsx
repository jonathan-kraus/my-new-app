export default function ResendSetupPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">Resend delivery tracking</h1>
      <p>
        Track emails your app sends from my-new-app &lt;dbemail@kraus.my.id&gt;
        to your Outlook account.
      </p>
      <section className="space-y-3 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Webhook setup</h2>
        <p>
          Endpoint: <code>https://www.kraus.my.id/api/webhook</code> (POST).
        </p>
        <p>
          Subscribe to <code>email.sent</code>, <code>email.delivered</code>,{" "}
          <code>email.bounced</code>, and <code>email.failed</code> in Resend.
        </p>
        <p>
          Optional events: <code>email.delivery_delayed</code>,{" "}
          <code>email.complained</code>, <code>email.suppressed</code>,{" "}
          <code>email.scheduled</code>, <code>email.opened</code>, and{" "}
          <code>email.clicked</code>.
        </p>
        <p>
          No Resend receiving address or inbound MX setup is needed for delivery
          tracking. Your Outlook account remains the recipient.
        </p>
      </section>
      <section className="space-y-3 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Vercel configuration</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <code>RESEND_WEBHOOK_SECRET</code>: the signing secret for this
            exact endpoint.
          </li>
          <li>
            <code>RESEND_API_KEY</code>: keep your existing sending key.
            Outbound delivery tracking does not fetch received emails or require
            receiving permissions.
          </li>
        </ul>
        <p>
          Set these for the production deployment, then deploy the updated code.
          The webhook must be reachable without a login or redirect.
        </p>
      </section>
      <section className="space-y-3 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Test and inspect</h2>
        <ol className="list-inside list-decimal space-y-2">
          <li>Send an email from the app to your Outlook account.</li>
          <li>
            Inspect the webhook deliveries in Resend and check for successful
            responses.
          </li>
          <li>
            Filter application logs by domain <code>resend</code>. Each record
            includes the event type, email ID, sender, recipient, subject, and
            available failure details.
          </li>
        </ol>
        <p>
          Delivered means the recipient’s mail server accepted the message; it
          does not confirm inbox placement or that you read it.
        </p>
        <p>
          The Resend delivery ID is preserved as the log request ID, including
          in the built context. Retries may produce repeated log entries.
        </p>
        <p>
          Invalid signatures return 400; missing server configuration returns
          500. Logging uses the application’s existing best-effort logj
          pipeline.
        </p>
        <p>
          The handler also retains support for email.received if inbound email
          is configured later. That separate feature requires receiving API
          permission. Full email bodies and attachments are not logged.
        </p>
      </section>
      <p>
        <a
          className="underline"
          href="https://resend.com/docs/webhooks/verify-webhooks-requests"
        >
          Resend signature verification
        </a>
      </p>
    </main>
  );
}
