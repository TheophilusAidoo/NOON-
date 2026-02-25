'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { HiMail, HiPhone, HiLocationMarker, HiHeart } from 'react-icons/hi';
import { api } from '@/lib/axios';

const DEFAULT_FOOTER = {
  tagline: 'Your trusted multi-vendor marketplace. Electronics, fashion, home & more — all in one place.',
  address: '123 Commerce Street, Retail City',
  phone: '+1 234 567 8900',
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [footer, setFooter] = useState(DEFAULT_FOOTER);

  useEffect(() => {
    api
      .get<{ success: boolean; data?: { footer?: typeof DEFAULT_FOOTER } }>('/settings')
      .then((res) => {
        if (res.data.data?.footer) setFooter(res.data.data.footer);
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!agree) {
      toast.error('Please agree to the Privacy and Cookie Policy');
      return;
    }
    setLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email: email.trim() });
      toast.success('Thank you for subscribing!');
      setEmail('');
      setAgree(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer role="contentinfo" className="shrink-0 w-full bg-white border-t border-gray-200 text-gray-600">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-[#e61502] to-amber-400" />

      {/* Newsletter - compact strip */}
      <div className="border-b border-gray-100 bg-amber-50/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#e61502]/10 flex items-center justify-center">
                <HiMail className="w-5 h-5 text-[#e61502]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Stay in the loop</p>
                <p className="text-xs text-gray-500">Exclusive deals & new arrivals</p>
              </div>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 flex-1 max-w-md">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#e61502] focus:border-[#e61502] outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#e61502] text-white font-medium rounded-lg hover:bg-[#c91201] transition disabled:opacity-50"
              >
                {loading ? '...' : 'Subscribe'}
              </button>
            </form>
            <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-600 max-w-xs">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-[#e61502] focus:ring-[#e61502]"
              />
              <span>I agree to the <Link href="/privacy" className="text-[#e61502] hover:underline">Privacy Policy</Link></span>
            </label>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block text-2xl font-bold text-gray-900 hover:text-[#e61502] transition">
              Rakuten
            </Link>
            <p className="mt-3 text-sm text-gray-600 max-w-xs">
              {footer.tagline}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <HiLocationMarker className="w-4 h-4 text-[#e61502] shrink-0" />
                <span>{footer.address}</span>
              </span>
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <HiPhone className="w-4 h-4 text-[#e61502] shrink-0" />
                <span>{footer.phone}</span>
              </span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products" className="hover:text-[#e61502] transition">All Products</Link></li>
              <li><Link href="/sellers" className="hover:text-[#e61502] transition">Our Sellers</Link></li>
              <li><Link href="/products?flash=true" className="hover:text-[#e61502] transition">Flash Deals</Link></li>
              <li><Link href="/products" className="hover:text-[#e61502] transition">New Arrivals</Link></li>
              <li><Link href="/seller" className="hover:text-[#e61502] transition">Sell on Rakuten</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Help</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/help" className="hover:text-[#e61502] transition">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-[#e61502] transition">Contact Us</Link></li>
              <li><Link href="/shipping" className="hover:text-[#e61502] transition">Delivery Info</Link></li>
              <li><Link href="/returns" className="hover:text-[#e61502] transition">Returns & Refunds</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-[#e61502] transition">About Us</Link></li>
              <li><Link href="/terms" className="hover:text-[#e61502] transition">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-[#e61502] transition">Privacy Policy</Link></li>
              <li><Link href="/register?role=seller" className="hover:text-[#e61502] transition">Become a Seller</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 flex items-center gap-1">
            © {new Date().getFullYear()} Rakuten. Made with <HiHeart className="w-4 h-4 text-[#e61502] inline" /> for shoppers.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/terms" className="text-gray-500 hover:text-[#e61502] transition">Terms</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-[#e61502] transition">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
