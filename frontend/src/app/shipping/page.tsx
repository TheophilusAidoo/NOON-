import Link from 'next/link';

export const metadata = {
  title: 'Delivery Info - Rakuten',
  description: 'Shipping and delivery information for Rakuten orders',
};

export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-gray-500 hover:text-[#e61502] transition mb-6 inline-block">
        ← Back to Home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Delivery Info</h1>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <p className="text-gray-600 leading-relaxed text-lg">
            Rakuten is a multi-vendor marketplace. Delivery times, methods, and costs vary by seller. 
            Here is what you need to know about shipping your orders.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Each product is sold by an independent seller. When you place an order, the seller is responsible 
            for packaging and shipping your items. You may receive multiple parcels if you order from different 
            sellers.
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>Delivery estimates are shown on the product page and at checkout</li>
            <li>Tracking information is provided when available</li>
            <li>Shipping fees may vary by seller and destination</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Delivery Times</h2>
          <p className="text-gray-600 leading-relaxed">
            Standard delivery typically takes 3–7 business days after dispatch, depending on your location and 
            the seller&apos;s shipping method. Express options may be available at checkout. Sellers will notify 
            you when your order is dispatched.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Shipping Costs</h2>
          <p className="text-gray-600 leading-relaxed">
            Shipping is calculated at checkout based on the seller&apos;s settings, package weight/size, and your 
            delivery address. Free delivery may apply to certain orders or sellers — check the product page for details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Order Tracking</h2>
          <p className="text-gray-600 leading-relaxed">
            Once your order is shipped, you can track it from <Link href="/orders" className="text-[#e61502] hover:underline">My Orders</Link>. 
            If you have not received tracking information within the estimated dispatch time, please contact the seller 
            or our support team.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Questions?</h2>
          <p className="text-gray-600 leading-relaxed">
            For specific delivery questions, <Link href="/contact" className="text-[#e61502] hover:underline">contact us</Link> or 
            visit the <Link href="/help" className="text-[#e61502] hover:underline">Help Center</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
