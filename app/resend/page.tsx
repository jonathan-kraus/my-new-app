export default function ResendSetupPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">Resend inbound email setup</h1>
      <p>
        This page explains the setup. Resend sends webhook requests to the
        endpoint below.
      </p>
      <section className="space-y-3 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Webhook</h2>
        <p>
          Endpoint: <code>https://www.kraus.my.id/api/webhook</code>
        </p>
        <p>
          Method: <code>POST</code>. Subscribe to <code>email.received</code> in
          the Resend dashboard.
        </p>
        <p>
          Use the production hostname that serves the app directly, without a
          redirect or deployment-protection login.
        </p>
      </section>
      <section className="space-y-3 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Vercel environment variables</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <code>RESEND_WEBHOOK_SECRET</code>: the signing secret for this
            exact webhook.
          </li>
          <li>
            <code>RESEND_API_KEY</code>: an API key permitted to retrieve
            received emails; a sending-only key is insufficient.
          </li>
        </ul>
        <p>
          Set both for the deployment environment receiving the webhook, then
          deploy the code again. Keep both values server-side.
        </p>
      </section>
      <section className="space-y-3 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Receiving and testing</h2>
        <ol className="list-inside list-decimal space-y-2">
          <li>
            Use your receiving address from Resend, or enable receiving on a
            domain using the DNS records Resend provides.
          </li>
          <li>
            Deploy the webhook handler and confirm the endpoint URL in Resend.
          </li>
          <li>
            Send an email to your receiving address, then inspect its webhook
            delivery in Resend.
          </li>
          <li>
            Look for a successful response and a <code>resend</code> entry in
            the application logs.
          </li>
        </ol>
        <p>
          Missing or invalid signatures return 400. Missing server configuration
          returns 500. Email retrieval failures return 502 (or 500 for
          unexpected failures), allowing Resend to retry.
        </p>
        <p>
          The handler logs the email ID, sender, subject, and content-presence
          flags through logj. Full bodies and attachments are not written to
          logs. It does not forward email.
        </p>
        <p>
          Retries can create repeated log entries; the webhook delivery ID is
          recorded as the request ID. Logs use the app’s existing best-effort
          logging and are not a durable email inbox.
        </p>
      </section>
      <p>
        <a
          className="underline"
          href="https://resend.com/docs/dashboard/receiving/introduction"
        >
          Resend receiving guide
        </a>
        {" · "}
        <a
          className="underline"
          href="https://resend.com/docs/webhooks/verify-webhooks-requests"
        >
          Signature verification
        </a>
      </p>
    </main>
  );
}
