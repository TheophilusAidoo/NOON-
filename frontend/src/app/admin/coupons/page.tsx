'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<{ id: string; code: string; discountType: string; discountValue: number; expiryDate: string; usageCount: number; usageLimit?: number }[]>([]);
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    expiryDate: '',
    usageLimit: '',
    minOrderAmount: '',
  });

  useEffect(() => {
    api.get('/admin/coupons').then((res) => setCoupons(res.data.data));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/coupons', {
        ...form,
        discountValue: parseFloat(form.discountValue),
        expiryDate: new Date(form.expiryDate).toISOString(),
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
      });
      setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', expiryDate: '', usageLimit: '', minOrderAmount: '' });
      api.get('/admin/coupons').then((res) => setCoupons(res.data.data)).catch(() => {});
      toast.success('Coupon created');
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Coupons</h1>

      <form onSubmit={create} className="bg-white p-4 rounded shadow mb-6 max-w-lg grid grid-cols-2 gap-3">
        <input
          placeholder="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          required
          className="px-3 py-2 border rounded"
        />
        <select
          value={form.discountType}
          onChange={(e) => setForm({ ...form, discountType: e.target.value })}
          className="px-3 py-2 border rounded"
        >
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED">Fixed</option>
        </select>
        <input
          type="number"
          placeholder="Discount value"
          value={form.discountValue}
          onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
          required
          className="px-3 py-2 border rounded"
        />
        <input
          type="datetime-local"
          placeholder="Expiry"
          value={form.expiryDate}
          onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          required
          className="px-3 py-2 border rounded"
        />
        <input
          type="number"
          placeholder="Usage limit (optional)"
          value={form.usageLimit}
          onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
          className="px-3 py-2 border rounded"
        />
        <input
          type="number"
          placeholder="Min order (optional)"
          value={form.minOrderAmount}
          onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
          className="px-3 py-2 border rounded"
        />
        <button type="submit" className="col-span-2 px-4 py-2 bg-amber-500 text-white rounded">
          Create Coupon
        </button>
      </form>

      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Value</th>
              <th className="p-3 text-left">Expiry</th>
              <th className="p-3 text-left">Usage</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-mono">{c.code}</td>
                <td className="p-3">{c.discountType}</td>
                <td className="p-3">{c.discountValue}{c.discountType === 'PERCENTAGE' ? '%' : '$'}</td>
                <td className="p-3">{new Date(c.expiryDate).toLocaleDateString()}</td>
                <td className="p-3">{c.usageCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
