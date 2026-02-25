import Link from 'next/link';

export const metadata = {
  title: 'Returns & Refunds - Rakuten',
  description: 'Return and refund policy for Rakuten orders',
};

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-gray-500 hover:text-[#e61502] transition mb-6 inline-block">
        ← Back to Home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Returns & Refunds</h1>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <p className="text-gray-600 leading-relaxed text-lg">
            At Rakuten, we want you to be satisfied with your purchase. Because we are a multi-vendor marketplace, 
            return and refund policies are set by individual sellers. Here is how it works.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Seller Policies</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Each seller has their own return and refund policy. You can find this information:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>On the product page before you buy</li>
            <li>In your order confirmation email</li>
            <li>In the seller&apos;s profile or store page</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            Always review the return policy before purchasing. If it is not clearly stated, contact the seller 
            directly or reach out to our support team.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">How to Request a Return</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            To start a return or refund:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-2">
            <li>Go to <Link href="/orders" className="text-[#e61502] hover:underline">My Orders</Link></li>
            <li>Select the order and item you want to return</li>
            <li>Follow the return instructions provided by the seller</li>
            <li>Contact the seller or support if you need assistance</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Typical Conditions</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Most sellers require:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>Items to be returned within a set period (e.g., 14–30 days)</li>
            <li>Products to be unused, in original packaging where possible</li>
            <li>Proof of purchase</li>
            <li>Return shipping arranged per seller instructions</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            Defective or damaged items are typically covered. Contact the seller as soon as you notice any issue.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Refund Timing</h2>
          <p className="text-gray-600 leading-relaxed">
            Once the seller receives and approves your return, refunds are processed according to their policy. 
            Refunds usually appear within 5–10 business days, depending on your payment method and bank.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Need Help?</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have trouble with a return or refund, <Link href="/contact" className="text-[#e61502] hover:underline">contact us</Link> or 
            visit the <Link href="/help" className="text-[#e61502] hover:underline">Help Center</Link>. We are here to help resolve any issues.
          </p>
        </section>
      </div>
    </div>
  );
}
