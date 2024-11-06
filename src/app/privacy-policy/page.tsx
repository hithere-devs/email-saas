export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>

      <section className="space-y-8">
        {/* Data Collection */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">1. Data Collection</h2>
          <div className="space-y-4">
            <p>We collect and process the following types of information:</p>
            <h3 className="text-xl font-medium">Email Data</h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>Email content and attachments</li>
              <li>Message metadata (dates, recipients, subjects)</li>
              <li>Email threading information</li>
              <li>Contact information from email headers</li>
            </ul>

            <h3 className="mt-4 text-xl font-medium">Account Information</h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>Name and email address</li>
              <li>Authentication credentials</li>
              <li>Profile settings and preferences</li>
              <li>Subscription and billing information</li>
            </ul>

            <h3 className="mt-4 text-xl font-medium">Usage Data</h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>Feature usage patterns</li>
              <li>Performance metrics</li>
              <li>Error logs and debugging information</li>
            </ul>
          </div>
        </div>

        {/* Data Processing */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">2. Data Processing</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-medium">AI Features</h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>Email content analysis for smart features</li>
              <li>Natural language processing for suggestions</li>
              <li>Machine learning models for email categorization</li>
            </ul>

            <h3 className="mt-4 text-xl font-medium">Email Synchronization</h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>Real-time email syncing with email providers</li>
              <li>Contact synchronization</li>
              <li>Attachment processing and storage</li>
            </ul>

            <h3 className="mt-4 text-xl font-medium">Search & Indexing</h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>Full-text email content indexing</li>
              <li>Metadata indexing for quick search</li>
              <li>Attachment content indexing</li>
            </ul>
          </div>
        </div>

        {/* Data Storage */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">3. Data Storage</h2>
          <div className="space-y-4">
            <p>We utilize secure and reliable storage solutions:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>PostgreSQL database for structured data storage</li>
              <li>End-to-end encryption for sensitive data</li>
              <li>Regular security audits and updates</li>
              <li>Data retention for active accounts: Indefinite</li>
              <li>Data retention for deleted accounts: 30 days</li>
            </ul>
          </div>
        </div>

        {/* Third-party Services */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">
            4. Third-party Services
          </h2>
          <div className="space-y-4">
            <p>We partner with the following services:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Clerk.js - User authentication and management</li>
              <li>Aurinko - Email service integration</li>
              <li>OpenAI - AI-powered features and analysis</li>
              <li>Logtail - System logging and monitoring</li>
            </ul>
            <p className="mt-4">
              Each third-party service has its own privacy policy and data
              handling practices.
            </p>
          </div>
        </div>

        {/* User Rights */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">5. User Rights</h2>
          <div className="space-y-4">
            <p>You have the following rights regarding your data:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Access your personal data</li>
              <li>Request data correction or deletion</li>
              <li>Export your data in standard formats</li>
              <li>Opt-out of data processing features</li>
              <li>Request account deletion</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact our support team at
              <span className="text-gray-400"> support@hitheredevs.com</span>
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 text-sm text-gray-500">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}
