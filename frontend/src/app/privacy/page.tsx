import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Rakuten',
  description: 'Privacy Policy for Rakuten multi-vendor marketplace',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-gray-500 hover:text-[#e61502] transition mb-6 inline-block">
        ← Back to Home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US')}</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
          <p className="text-gray-600 leading-relaxed">
            Rakuten (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our multi-vendor 
            marketplace platform and related services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed mb-3">We may collect the following types of information:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li><strong>Account information:</strong> Name, email address, password, phone number</li>
            <li><strong>Profile information:</strong> For sellers: business name, logo, banner, address</li>
            <li><strong>Transaction information:</strong> Purchase history, order details, payment information</li>
            <li><strong>Device and usage data:</strong> IP address, browser type, pages visited, timestamps</li>
            <li><strong>Communications:</strong> Messages with sellers, support inquiries, feedback</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
          <p className="text-gray-600 leading-relaxed mb-3">We use collected information to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>Provide, maintain, and improve our Platform</li>
            <li>Process transactions and send order confirmations</li>
            <li>Authenticate users and manage accounts</li>
            <li>Communicate with you about orders, promotions, and updates</li>
            <li>Prevent fraud and enforce our policies</li>
            <li>Analyze usage patterns to enhance user experience</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Sharing of Information</h2>
          <p className="text-gray-600 leading-relaxed">
            We may share your information with: (a) sellers when you purchase their products (e.g., shipping address); 
            (b) payment processors to complete transactions; (c) service providers who assist our operations; (d) law 
            enforcement when required by law. We do not sell your personal information to third parties for marketing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
          <p className="text-gray-600 leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
            over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
          <p className="text-gray-600 leading-relaxed">
            We retain your information for as long as your account is active or as needed to provide services, 
            comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion 
            of your data by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
          <p className="text-gray-600 leading-relaxed mb-3">Depending on your location, you may have the right to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict certain processing</li>
            <li>Data portability</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            To exercise these rights, please contact us using the information provided below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cookies and Tracking</h2>
          <p className="text-gray-600 leading-relaxed">
            We use cookies and similar technologies to maintain sessions, remember preferences, and analyze traffic. 
            You can control cookie settings through your browser. Disabling certain cookies may affect Platform 
            functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
          <p className="text-gray-600 leading-relaxed">
            Our Platform is not intended for users under 18. We do not knowingly collect personal information from 
            children. If you believe we have collected such information, please contact us so we can delete it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
          <p className="text-gray-600 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of material changes by posting 
            the updated policy on the Platform and updating the &quot;Last updated&quot; date. Your continued use after changes 
            constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            For questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact 
            us through the contact information provided on our website or in your account settings.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <Link href="/terms" className="text-[#e61502] hover:underline">
          View Terms of Service →
        </Link>
      </div>
    </div>
  );
}
