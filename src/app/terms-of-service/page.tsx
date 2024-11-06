export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Terms of Service</h1>

      <section className="space-y-8">
        {/* Service Description */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">
            1. Service Description
          </h2>
          <div className="space-y-4">
            <p>
              Our platform provides an advanced email client with integrated AI
              capabilities designed to enhance your email management and
              communication experience.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                AI-powered email composition, summarization, and organization
                features
              </li>
              <li>
                Real-time email synchronization across devices and platforms
              </li>
              <li>Secure account management and authentication services</li>
              <li>
                Premium features including advanced AI capabilities and priority
                support
              </li>
            </ul>
          </div>
        </div>

        {/* User Obligations */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">2. User Obligations</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Account Registration</h3>
            <p>Users must:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of their account credentials</li>
              <li>Be at least 18 years old or have parental consent</li>
              <li>Not share account access with unauthorized users</li>
            </ul>

            <h3 className="mt-4 text-xl font-medium">Acceptable Use Policy</h3>
            <p>Users agree not to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Send spam or unauthorized commercial communications</li>
              <li>Engage in any illegal activities through our service</li>
              <li>Attempt to breach our security measures</li>
              <li>
                Use the service to harm others or spread malicious content
              </li>
            </ul>

            <h3 className="mt-4 text-xl font-medium">API Usage Limits</h3>
            <p>Free tier users are limited to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>100 AI requests per day</li>
              <li>5GB email storage</li>
              <li>Standard API rate limits</li>
            </ul>
          </div>
        </div>

        {/* Intellectual Property */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">
            3. Intellectual Property
          </h2>
          <div className="space-y-4">
            <p>
              All rights, title, and interest in and to the Service are and will
              remain the exclusive property of our company and its licensors.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Users retain ownership of their email content and data</li>
              <li>AI-generated content is provided under a limited license</li>
              <li>Service trademarks and branding are protected by law</li>
            </ul>
          </div>
        </div>

        {/* Service Limitations */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">
            4. Service Limitations
          </h2>
          <div className="space-y-4">
            <p>
              We strive for 99.9% service availability but cannot guarantee
              uninterrupted access. The service depends on third-party providers
              including:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Aurinko for email integration</li>
              <li>OpenAI for AI features</li>
              <li>Cloud infrastructure providers</li>
            </ul>
            <p>
              Service may be occasionally interrupted for maintenance or
              updates.
            </p>
          </div>
        </div>

        {/* Termination */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">5. Termination</h2>
          <div className="space-y-4">
            <p>
              We reserve the right to terminate or suspend access to our Service
              immediately, without prior notice or liability, for any reason
              including:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activities</li>
              <li>Non-payment of fees</li>
            </ul>
            <p className="mt-4">Upon termination:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>User data will be retained for 30 days</li>
              <li>Users can request data export during this period</li>
              <li>Refunds are processed according to our refund policy</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-8 text-sm text-gray-500">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}
