import Link from 'next/link';

export const metadata = {
  title: 'Sell on Rakuten - Grow Your Business',
  description: 'Join Rakuten as a seller and reach millions of shoppers. Start selling today.',
};

export default function SellPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <Link href="/" className="text-sm text-white/80 hover:text-white mb-6 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sell on Rakuten</h1>
          <p className="text-xl text-white/90 max-w-2xl mb-8">
            Reach millions of shoppers. Grow your business with our trusted multi-vendor marketplace — 
            simple setup, secure payments, and powerful tools to help you succeed.
          </p>
          <Link
            href="/register?role=seller"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-gray-100 transition shadow-lg"
          >
            Become a Seller →
          </Link>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Why Sell on Rakuten?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 text-xl font-bold">1</div>
            <h3 className="font-semibold text-gray-900 mb-2">Reach More Customers</h3>
            <p className="text-gray-600 text-sm">Join a marketplace where shoppers come to discover and buy. Get in front of buyers actively looking for products like yours.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 text-xl font-bold">2</div>
            <h3 className="font-semibold text-gray-900 mb-2">Simple Setup</h3>
            <p className="text-gray-600 text-sm">Register, add your store details and logo, list products, and start selling. Our seller dashboard makes managing orders easy.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 text-xl font-bold">3</div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure Payments</h3>
            <p className="text-gray-600 text-sm">Get paid reliably. Request deposits, track withdrawals, and manage your finances with our secure payment infrastructure.</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center mx-auto mb-4">1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Register</h3>
              <p className="text-gray-600 text-sm">Sign up as a seller and complete your store profile with logo and banner.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center mx-auto mb-4">2</div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Approved</h3>
              <p className="text-gray-600 text-sm">Our team reviews your application. Logo and banner are required.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center mx-auto mb-4">3</div>
              <h3 className="font-semibold text-gray-900 mb-2">List Products</h3>
              <p className="text-gray-600 text-sm">Add your products with images, prices, and descriptions.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center mx-auto mb-4">4</div>
              <h3 className="font-semibold text-gray-900 mb-2">Sell & Grow</h3>
              <p className="text-gray-600 text-sm">Receive orders, ship products, and grow your business.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-10 md:p-14 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Selling?</h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            Join thousands of sellers who trust Rakuten. Create your seller account today.
          </p>
          <Link
            href="/register?role=seller"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-gray-100 transition"
          >
            Register as Seller
          </Link>
        </div>
      </div>
    </div>
  );
}
