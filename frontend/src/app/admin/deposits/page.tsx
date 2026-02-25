'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { useFormatPrice } from '@/hooks/useFormatPrice';
import toast from 'react-hot-toast';
import { HiClock } from 'react-icons/hi';

type Deposit = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  seller?: { id: string; name: string; email: string };
  currentLevel?: string;
  currentRecharge?: number;
};

export default function AdminDepositsPage() {
  const formatPrice = useFormatPrice();
  const [pending, setPending] = useState<Deposit[]>([]);
  const [history, setHistory] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const load = () => {
    api.get('/admin/deposits/pending').then((res) => setPending(res.data.data || [])).catch(() => toast.error('Could not load pending deposits'));
    api.get('/admin/deposits/history').then((res) => setHistory(res.data.data || [])).catch(() => toast.error('Could not load deposit history'));
  };

  useEffect(() => load(), []);

  const approve = async (id: string) => {
    setLoading(id);
    try {
      await api.put(`/admin/deposits/${id}/approve`);
      toast.success('Deposit approved. Seller level updated.');
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Failed to approve');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Pending Deposits - on top */}
      <div>
        <h1 className="text-xl font-bold mb-1">Pending Deposits</h1>
        <p className="text-sm text-gray-500 mb-4">Approve seller deposits to credit their cumulative recharge and upgrade store level.</p>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-left font-semibold">Seller</th>
                  <th className="p-4 text-left font-semibold">Amount</th>
                  <th className="p-4 text-left font-semibold">Current Level</th>
                  <th className="p-4 text-left font-semibold">Current Recharge</th>
                  <th className="p-4 text-left font-semibold">Date</th>
                  <th className="p-4 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">No pending deposits</td>
                  </tr>
                ) : (
                  pending.map((d) => (
                    <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                      <td className="p-4">
                        <p className="font-medium">{d.seller?.name}</p>
                        <p className="text-xs text-gray-500">{d.seller?.email}</p>
                      </td>
                      <td className="p-4 font-medium">{formatPrice(d.amount)}</td>
                      <td className="p-4">Level {d.currentLevel || 'C'}</td>
                      <td className="p-4">{formatPrice(d.currentRecharge || 0)}</td>
                      <td className="p-4 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <button
                          onClick={() => approve(d.id)}
                          disabled={loading === d.id}
                          className="px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50"
                        >
                          {loading === d.id ? 'Approving...' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Deposit History */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <HiClock className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold">Deposit History</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">All deposit requests from sellers.</p>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-left font-semibold">Seller</th>
                  <th className="p-4 text-left font-semibold">Amount</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">No deposit history</td>
                  </tr>
                ) : (
                  history.map((d) => (
                    <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                      <td className="p-4">
                        <p className="font-medium">{d.seller?.name}</p>
                        <p className="text-xs text-gray-500">{d.seller?.email}</p>
                      </td>
                      <td className="p-4 font-medium">{formatPrice(d.amount)}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${d.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
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
