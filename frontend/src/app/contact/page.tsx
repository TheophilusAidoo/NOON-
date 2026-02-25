'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-gray-500 hover:text-[#e61502] transition mb-6 inline-block">
        ← Back to Home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
      <p className="text-gray-600 mb-8">Have a question or feedback? We would love to hear from you.</p>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h2>
          <div className="space-y-4 text-gray-600">
            <p><strong>Email:</strong> support@rakuten.example.com</p>
            <p><strong>Phone:</strong> +1 234 567 8900</p>
            <p><strong>Address:</strong> 123 Commerce Street, Retail City</p>
          </div>
          <p className="mt-6 text-sm text-gray-500">We typically respond within 24–48 hours.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#e61502] focus:border-[#e61502] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#e61502] focus:border-[#e61502] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#e61502] focus:border-[#e61502] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#e61502] focus:border-[#e61502] outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#e61502] text-white font-medium rounded-lg hover:bg-[#c91201] transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <Link href="/help" className="text-[#e61502] hover:underline">← Help Center</Link>
      </div>
    </div>
  );
}
