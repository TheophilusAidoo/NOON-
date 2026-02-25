'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Placeholder - you can connect to a backend API later
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Thank you! Your message has been sent. We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Compact header */}
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          <Link href="/" className="text-xs uppercase tracking-wider text-gray-400 hover:text-[#e61502] transition mb-3 inline-block">
            ← Home
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Contact Us</h1>
          <p className="mt-1.5 text-sm text-gray-500 max-w-md">
            Have a question or feedback? We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact info cards */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#e61502]/10 flex items-center justify-center">
                <HiMail className="w-5 h-5 text-[#e61502]" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Email</p>
                <a href="mailto:support@rakuten.example.com" className="text-gray-900 hover:text-[#e61502] transition">
                  support@rakuten.example.com
                </a>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#e61502]/10 flex items-center justify-center">
                <HiPhone className="w-5 h-5 text-[#e61502]" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                <a href="tel:+12345678900" className="text-gray-900 hover:text-[#e61502] transition">
                  +1 234 567 8900
                </a>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#e61502]/10 flex items-center justify-center">
                <HiLocationMarker className="w-5 h-5 text-[#e61502]" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Address</p>
                <p className="text-gray-900">123 Commerce Street, Retail City</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 pt-2">We typically respond within 24–48 hours.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-3 bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Send us a message</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#e61502]/20 focus:border-[#e61502] outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#e61502]/20 focus:border-[#e61502] outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#e61502]/20 focus:border-[#e61502] outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#e61502]/20 focus:border-[#e61502] outline-none transition resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#e61502] text-white font-medium rounded-xl hover:bg-[#c91201] transition disabled:opacity-50 text-sm"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/help" className="inline-flex items-center gap-2 text-sm font-medium text-[#e61502] hover:underline">
            ← Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
