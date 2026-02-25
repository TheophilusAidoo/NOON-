import Link from 'next/link';

export const metadata = {
  title: 'About Us - Rakuten',
  description: 'Learn about Rakuten, your trusted multi-vendor marketplace',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-gray-500 hover:text-[#e61502] transition mb-6 inline-block">
        ← Back to Home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">About Us</h1>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <p className="text-gray-600 leading-relaxed text-lg">
            Rakuten is your trusted multi-vendor marketplace, bringing together electronics, fashion, home goods, 
            and more — all in one place. We connect shoppers with quality sellers and make online shopping simple, 
            secure, and rewarding.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            We believe everyone deserves access to great products and reliable sellers. Our mission is to create 
            a seamless marketplace where buyers discover what they need and sellers grow their businesses — 
            powered by trust, transparency, and exceptional service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">What We Offer</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li><strong>Shoppers:</strong> A wide selection of products across categories, secure checkout, order tracking, and reliable support</li>
            <li><strong>Sellers:</strong> A platform to reach customers, manage products, process orders, and grow your brand</li>
            <li><strong>Everyone:</strong> Flash deals, featured products, and a shopping experience designed with you in mind</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Why Choose Rakuten?</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            We combine the convenience of a one-stop shop with the variety of multiple sellers. Every seller is 
            vetted, every transaction is protected, and every order matters. Whether you are stocking up for home, 
            shopping for gifts, or running a business — Rakuten is here for you.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Thank you for being part of our community. We are committed to making your experience better every day.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            Have questions or feedback? We would love to hear from you. Reach out through our{' '}
            <Link href="/contact" className="text-[#e61502] hover:underline">Contact Us</Link> page or the 
            contact details in our footer.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-6">
        <Link href="/terms" className="text-[#e61502] hover:underline">Terms of Service</Link>
        <Link href="/privacy" className="text-[#e61502] hover:underline">Privacy Policy</Link>
        <Link href="/register?role=seller" className="text-[#e61502] hover:underline">Become a Seller</Link>
      </div>
    </div>
  );
}
