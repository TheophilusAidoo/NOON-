'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  HiUserGroup,
  HiCheckCircle,
  HiBan,
  HiTrash,
  HiBadgeCheck,
  HiStar,
  HiDotsVertical,
  HiSearch,
} from 'react-icons/hi';

type Seller = {
  id: string;
  name: string;
  email: string;
  isApproved: boolean | null;
  createdAt: string;
  sellerProfile?: {
    storeName: string;
    storeLevel?: string;
    cumulativeRecharge?: number;
    creditScore?: number;
  };
  _count?: { products: number };
};

const LEVEL_STYLE: Record<string, string> = {
  C: 'bg-amber-500/15 text-amber-700 border-amber-300',
  B: 'bg-emerald-500/15 text-emerald-700 border-emerald-300',
  A: 'bg-blue-500/15 text-blue-700 border-blue-300',
  S: 'bg-violet-500/15 text-violet-700 border-violet-300',
};

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: 'level' | 'credit' | null; seller: Seller | null }>({ type: null, seller: null });
  const [levelValue, setLevelValue] = useState('C');
  const [creditValue, setCreditValue] = useState('100');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get('/admin/sellers').then((res) => setSellers(res.data.data || [])).catch(() => toast.error('Could not load sellers')).finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const filtered = sellers
    .filter((s) => {
      if (filter === 'pending') return !s.isApproved;
      if (filter === 'approved') return s.isApproved;
      return true;
    })
    .filter((s) => {
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.sellerProfile?.storeName || '').toLowerCase().includes(q)
      );
    });

  const approve = async (id: string) => {
    setOpenMenu(null);
    try {
      await api.put(`/admin/sellers/${id}/approve`);
      toast.success('Seller approved');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  const suspend = async (id: string) => {
    setOpenMenu(null);
    if (!confirm('Suspend this seller? They will lose access.')) return;
    try {
      await api.put(`/admin/sellers/${id}/suspend`);
      toast.success('Suspended');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  const openLevelModal = (s: Seller) => {
    setOpenMenu(null);
    setModal({ type: 'level', seller: s });
    setLevelValue(s.sellerProfile?.storeLevel || 'C');
  };

  const openCreditModal = (s: Seller) => {
    setOpenMenu(null);
    setModal({ type: 'credit', seller: s });
    setCreditValue(String(s.sellerProfile?.creditScore ?? 100));
  };

  const submitLevel = async () => {
    if (!modal.seller) return;
    setSubmitting(true);
    try {
      await api.put(`/admin/sellers/${modal.seller.id}/level`, { storeLevel: levelValue });
      toast.success(`Level → ${levelValue}`);
      setModal({ type: null, seller: null });
      load();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const submitCredit = async () => {
    if (!modal.seller) return;
    const score = parseInt(creditValue, 10);
    if (isNaN(score) || score < 0 || score > 1000) {
      toast.error('Credit score 0–1000');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/admin/sellers/${modal.seller.id}/credit-score`, { creditScore: score });
      toast.success(`Credit → ${score}`);
      setModal({ type: null, seller: null });
      load();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSeller = async (id: string) => {
    setOpenMenu(null);
    if (!confirm('Delete this seller? Products will be removed. Cannot be undone.')) return;
    try {
      await api.delete(`/admin/sellers/${id}`);
      toast.success('Deleted');
      setModal({ type: null, seller: null });
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed. Seller may have orders.');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-900">Sellers</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search sellers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-56 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
            />
          </div>
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            {(['all', 'pending', 'approved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium ${
                  filter === f
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Approved'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <HiUserGroup className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 text-sm font-medium">No sellers</p>
            <p className="text-slate-400 text-xs mt-1">{search ? 'Try a different search' : `No ${filter} sellers`}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Seller</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Store</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Level</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Credit</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Products</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.email}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700">
                    {s.sellerProfile?.storeName || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded border text-xs font-semibold ${LEVEL_STYLE[s.sellerProfile?.storeLevel || 'C']}`}>
                      {s.sellerProfile?.storeLevel || 'C'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700">
                    {s.sellerProfile?.creditScore ?? 100}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700">{s._count?.products ?? 0}</td>
                  <td className="py-3 px-4">
                    {s.isApproved ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        <HiCheckCircle className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">{formatDate(s.createdAt)}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setOpenMenu(s.id)}
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                    >
                      <HiDotsVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Actions Popup */}
      {openMenu && (() => {
        const s = sellers.find((x) => x.id === openMenu);
        if (!s) return null;
        return (
          <div
            className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"
            onClick={() => setOpenMenu(null)}
          >
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-semibold text-slate-900">{s.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{s.sellerProfile?.storeName || s.email}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.email}</p>
              <div className="mt-6 space-y-2">
                {!s.isApproved && (
                  <button
                    onClick={() => approve(s.id)}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-3"
                  >
                    <HiCheckCircle className="w-5 h-5" /> Approve seller
                  </button>
                )}
                {s.isApproved && (
                  <button
                    onClick={() => suspend(s.id)}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 flex items-center gap-3"
                  >
                    <HiBan className="w-5 h-5" /> Suspend seller
                  </button>
                )}
                <button
                  onClick={() => openLevelModal(s)}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 flex items-center gap-3"
                >
                  <HiBadgeCheck className="w-5 h-5" /> Set store level
                </button>
                <button
                  onClick={() => openCreditModal(s)}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 flex items-center gap-3"
                >
                  <HiStar className="w-5 h-5" /> Set credit score
                </button>
                <button
                  onClick={() => deleteSeller(s.id)}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-3"
                >
                  <HiTrash className="w-5 h-5" /> Delete seller
                </button>
              </div>
              <button
                onClick={() => setOpenMenu(null)}
                className="w-full mt-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}

      {/* Level Modal */}
      {modal.type === 'level' && modal.seller && (
        <div
          className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"
          onClick={() => setModal({ type: null, seller: null })}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-slate-900">Store level</h3>
            <p className="text-sm text-slate-500 mt-1">{modal.seller.name}</p>
            <div className="flex gap-2 mt-5">
              {['C', 'B', 'A', 'S'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelValue(lvl)}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border-2 transition ${
                    levelValue === lvl
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal({ type: null, seller: null })}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={submitLevel}
                disabled={submitting}
                className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Modal */}
      {modal.type === 'credit' && modal.seller && (
        <div
          className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"
          onClick={() => setModal({ type: null, seller: null })}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-slate-900">Credit score</h3>
            <p className="text-sm text-slate-500 mt-1">{modal.seller.name}</p>
            <div className="mt-5">
              <input
                type="range"
                min={0}
                max={1000}
                value={creditValue}
                onChange={(e) => setCreditValue(e.target.value)}
                className="w-full h-2 rounded-lg accent-slate-800"
              />
              <input
                type="number"
                min={0}
                max={1000}
                value={creditValue}
                onChange={(e) => setCreditValue(e.target.value)}
                className="mt-3 w-full px-4 py-3 border border-slate-200 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal({ type: null, seller: null })}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={submitCredit}
                disabled={submitting}
                className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
