'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiPencil, HiCreditCard, HiPhotograph } from 'react-icons/hi';

type PaymentMethod = {
  id: string;
  cryptoName: string;
  walletAddress: string;
  qrCodeUrl: string | null;
  active: boolean;
  sortOrder: number;
};

export default function AdminPaymentMethodsPage() {
  const [list, setList] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ cryptoName: '', walletAddress: '', qrCodeUrl: '', sortOrder: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [qrUploading, setQrUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefEdit = useRef<HTMLInputElement>(null);

  const fetchList = () => {
    api
      .get('/admin/payment-methods')
      .then((r) => setList(r.data?.data ?? []))
      .catch(() => toast.error('Could not load payment methods'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>, forEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrUploading(true);
    try {
      const fd = new FormData();
      fd.append('images', file);
      const { data } = await api.post('/upload', fd);
      const url = data?.urls?.[0];
      if (url) {
        if (forEdit && editing) setEditing({ ...editing, qrCodeUrl: url });
        else setForm((f) => ({ ...f, qrCodeUrl: url }));
      }
      e.target.value = '';
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Upload failed');
    } finally {
      setQrUploading(false);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cryptoName.trim() || !form.walletAddress.trim()) {
      toast.error('Crypto name and wallet address are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/payment-methods', {
        cryptoName: form.cryptoName.trim(),
        walletAddress: form.walletAddress.trim(),
        qrCodeUrl: form.qrCodeUrl.trim() || null,
        sortOrder: form.sortOrder,
      });
      setForm({ cryptoName: '', walletAddress: '', qrCodeUrl: '', sortOrder: 0 });
      fetchList();
      toast.success('Payment method added');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.cryptoName.trim() || !editing.walletAddress.trim()) return;
    setSubmitting(true);
    try {
      await api.put(`/admin/payment-methods/${editing.id}`, {
        cryptoName: editing.cryptoName.trim(),
        walletAddress: editing.walletAddress.trim(),
        qrCodeUrl: editing.qrCodeUrl?.trim() || null,
        active: editing.active,
        sortOrder: editing.sortOrder,
      });
      setEditing(null);
      fetchList();
      toast.success('Updated');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this payment method?')) return;
    try {
      await api.delete(`/admin/payment-methods/${id}`);
      setEditing(null);
      fetchList();
      toast.success('Removed');
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen -m-6 p-6 bg-gray-50">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <HiCreditCard className="w-8 h-8 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manual Payment Methods</h1>
            <p className="text-sm text-gray-500">Crypto payments: add wallet address and QR code for checkout</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Add Form */}
          <form
            onSubmit={create}
            className="xl:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit"
          >
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <HiPlus className="w-5 h-5 text-amber-500" /> Add Payment Method
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crypto Name *</label>
                <input
                  type="text"
                  placeholder="e.g. BTC, ETH, USDT"
                  value={form.cryptoName}
                  onChange={(e) => setForm({ ...form, cryptoName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address *</label>
                <input
                  type="text"
                  placeholder="Your crypto wallet address"
                  value={form.walletAddress}
                  onChange={(e) => setForm({ ...form, walletAddress: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">QR Code</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleQrUpload(e, false)}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={qrUploading}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50 text-sm"
                  >
                    <HiPhotograph className="w-4 h-4" />
                    {qrUploading ? 'Uploading...' : 'Upload QR'}
                  </button>
                  {form.qrCodeUrl && (
                    <div className="flex items-center gap-2">
                      <img src={form.qrCodeUrl} alt="QR" className="w-12 h-12 object-contain rounded border" />
                      <button type="button" onClick={() => setForm({ ...form, qrCodeUrl: '' })} className="text-red-600 text-sm hover:underline">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-medium rounded-lg"
              >
                {submitting ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>

          {/* List */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-900">Payment Methods ({list.length})</h2>
            </div>
            {list.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <HiCreditCard className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                <p className="font-medium">No payment methods yet</p>
                <p className="text-sm mt-1">Add one using the form on the left. Run database/add-manual-payment-methods.sql if table does not exist.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Crypto</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Wallet</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">QR</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="w-24 py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((pm) => (
                      <tr key={pm.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-semibold text-gray-900">{pm.cryptoName}</td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-600 truncate max-w-[240px]" title={pm.walletAddress}>
                          {pm.walletAddress}
                        </td>
                        <td className="py-3 px-4">
                          {pm.qrCodeUrl ? (
                            <img src={pm.qrCodeUrl} alt="QR" className="w-10 h-10 object-contain rounded" />
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${pm.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {pm.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <button onClick={() => setEditing(pm)} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded" title="Edit">
                              <HiPencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => remove(pm.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-4">Edit Payment Method</h3>
            <form onSubmit={update} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crypto Name</label>
                <input
                  type="text"
                  value={editing.cryptoName}
                  onChange={(e) => setEditing({ ...editing, cryptoName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
                <input
                  type="text"
                  value={editing.walletAddress}
                  onChange={(e) => setEditing({ ...editing, walletAddress: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">QR Code</label>
                <input
                  ref={fileInputRefEdit}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleQrUpload(e, true)}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRefEdit.current?.click()}
                    disabled={qrUploading}
                    className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                  >
                    {qrUploading ? 'Uploading...' : 'Upload'}
                  </button>
                  {editing.qrCodeUrl && <img src={editing.qrCodeUrl} alt="QR" className="w-10 h-10 object-contain rounded" />}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                />
                <label htmlFor="active" className="text-sm">
                  Active (show in checkout)
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="flex-1 py-2.5 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
