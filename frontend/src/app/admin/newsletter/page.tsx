'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { HiMail } from 'react-icons/hi';

type Subscriber = { id: string; email: string; createdAt: string };

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ success: boolean; data: Subscriber[] }>('/admin/newsletter-subscribers')
      .then((res) => setSubscribers(res.data.data || []))
      .catch(() => toast.error('Could not load subscribers'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-8">
        <HiMail className="w-8 h-8 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-500">
            People who subscribed via &quot;Stay in the loop&quot; in the footer
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Subscribers</h2>
          <span className="text-sm text-gray-500">{subscribers.length} total</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : subscribers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No subscribers yet. New signups will appear here when visitors use the footer form.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Subscribed
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                    <td className="py-4 px-6 text-sm text-gray-900">{s.email}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
