import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - Rakuten',
  description: 'Terms of Service for Rakuten multi-vendor marketplace',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-gray-500 hover:text-[#e61502] transition mb-6 inline-block">
        ← Back to Home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US')}</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing and using Rakuten (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our Platform. We reserve the right to update these 
            terms at any time; continued use after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Use of the Platform</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Rakuten is a multi-vendor marketplace. You may use the Platform as:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>A shopper to browse, purchase, and review products</li>
            <li>A seller to list and sell products (subject to approval)</li>
            <li>An administrator (if authorized)</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            You must provide accurate information and maintain the security of your account. You are responsible for 
            all activity under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Products and Transactions</h2>
          <p className="text-gray-600 leading-relaxed">
            Sellers are responsible for product descriptions, pricing, availability, and shipping. Rakuten facilitates 
            transactions but is not the seller of third-party goods. All purchases are agreements between you and the 
            seller. Returns and refunds are subject to individual seller policies and applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Payments and Fees</h2>
          <p className="text-gray-600 leading-relaxed">
            Payment processing is handled through our supported payment methods. Sellers may be subject to platform 
            fees, commissions, or withdrawal fees as disclosed in the seller dashboard. All fees are subject to change 
            with reasonable notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Prohibited Conduct</h2>
          <p className="text-gray-600 leading-relaxed mb-3">You must not:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>Violate any laws or regulations</li>
            <li>List prohibited, counterfeit, or illegal items</li>
            <li>Misrepresent products or your identity</li>
            <li>Harass, defraud, or harm other users</li>
            <li>Attempt to circumvent platform security or fees</li>
            <li>Use the Platform for unauthorized commercial purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed">
            The Platform, including its design, logos, and content (except user-generated content), is owned by 
            Rakuten or its licensors. You may not copy, modify, or distribute our intellectual property without 
            written permission. Sellers retain rights to their product images and descriptions while granting us 
            a license to display them on the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            Rakuten is provided &quot;as is.&quot; We do not guarantee uninterrupted or error-free service. To the maximum 
            extent permitted by law, we are not liable for indirect, incidental, special, or consequential damages 
            arising from your use of the Platform. Our liability is limited to the amount you paid for the service 
            or product in question.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Termination</h2>
          <p className="text-gray-600 leading-relaxed">
            We may suspend or terminate your account and access at any time for violations of these terms or for 
            any other reason at our discretion. You may close your account at any time. Upon termination, your right 
            to use the Platform ceases immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Governing Law</h2>
          <p className="text-gray-600 leading-relaxed">
            These terms are governed by the laws of the jurisdiction in which Rakuten operates. Any disputes shall 
            be resolved in the appropriate courts of that jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
          <p className="text-gray-600 leading-relaxed">
            For questions about these Terms of Service, please contact us through the contact information provided 
            on our website or in your account settings.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <Link href="/privacy" className="text-[#e61502] hover:underline">
          View Privacy Policy →
        </Link>
      </div>
    </div>
  );
}
