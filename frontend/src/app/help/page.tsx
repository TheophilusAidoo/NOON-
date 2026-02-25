import Link from 'next/link';

export const metadata = {
  title: 'Help Center - Rakuten',
  description: 'Get help with orders, shipping, returns, and more',
};

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-gray-500 hover:text-[#e61502] transition mb-6 inline-block">
        ← Back to Home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Help Center</h1>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <p className="text-gray-600 leading-relaxed text-lg">
            Find answers to common questions and get support for your Rakuten experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Orders & Checkout</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>How do I place an order? Add items to your cart, go to checkout, enter your details, and complete payment.</li>
            <li>Can I modify or cancel my order? Contact the seller as soon as possible; once shipped, cancellation may not be possible.</li>
            <li>How do I track my order? Visit <Link href="/orders" className="text-[#e61502] hover:underline">My Orders</Link> for status and tracking.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Delivery & Shipping</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>Delivery times vary by seller and location. Check the product page for estimated delivery.</li>
            <li>For full details, see our <Link href="/shipping" className="text-[#e61502] hover:underline">Delivery Info</Link> page.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Returns & Refunds</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>Each seller sets their own return policy. Review the product page or order confirmation.</li>
            <li>Learn more on our <Link href="/returns" className="text-[#e61502] hover:underline">Returns & Refunds</Link> page.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Account & Payments</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>Manage your account, addresses, and order history from <Link href="/account" className="text-[#e61502] hover:underline">My Account</Link>.</li>
            <li>Payments are processed securely. We accept major credit cards and other methods as shown at checkout.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Still Need Help?</h2>
          <p className="text-gray-600 leading-relaxed">
            Our support team is here for you. <Link href="/contact" className="text-[#e61502] hover:underline">Contact Us</Link> and we will get back to you as soon as possible.
          </p>
        </section>
      </div>
    </div>
  );
}
