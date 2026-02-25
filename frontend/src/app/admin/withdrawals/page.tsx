'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { useFormatPrice } from '@/hooks/useFormatPrice';
import toast from 'react-hot-toast';

type Withdrawal = {
  id: string;
  sellerId: string;
  amount: number;
  walletAddress?: string | null;
  cryptoName?: string | null;
  status: string;
  createdAt: string;
  seller?: { id: string; name: string; email: string };
};

export default function AdminWithdrawalsPage() {
  const formatPrice = useFormatPrice();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const load = () => {
    api.get('/admin/withdrawals').then((res) => setWithdrawals(res.data.data || [])).catch(() => toast.error('Could not load withdrawals'));
  };

  useEffect(() => load(), []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setLoading(id);
    try {
      await api.put(`/admin/withdrawals/${id}/status`, { status });
      toast.success(`Withdrawal ${status}`);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold mb-1">Seller Withdrawals</h1>
        <p className="text-sm text-gray-500 mb-4">View and approve seller withdrawal requests. Wallet address and crypto name are shown for each request.</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-left font-semibold">Seller</th>
                  <th className="p-4 text-left font-semibold">Amount</th>
                  <th className="p-4 text-left font-semibold">Crypto</th>
                  <th className="p-4 text-left font-semibold">Wallet address</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Date</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">No withdrawal requests</td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                      <td className="p-4">
                        <p className="font-medium">{w.seller?.name ?? '—'}</p>
                        <p className="text-xs text-gray-500">{w.seller?.email}</p>
                      </td>
                      <td className="p-4 font-medium">{formatPrice(w.amount)}</td>
                      <td className="p-4">
                        <span className="font-medium text-slate-700">{w.cryptoName || '—'}</span>
                      </td>
                      <td className="p-4 max-w-xs">
                        <code className="text-xs break-all text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded">
                          {w.walletAddress || '—'}
                        </code>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          w.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        {w.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(w.id, 'approved')}
                              disabled={loading === w.id}
                              className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(w.id, 'rejected')}
                              disabled={loading === w.id}
                              className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
