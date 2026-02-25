'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';

type Brand = { id: string; name: string; image?: string | null; _count?: { products: number } };

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState({ name: '', image: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/brands').then((res) => setBrands(res.data.data || [])).catch(() => setBrands([]));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/brands', {
        name: form.name,
        image: form.image || undefined,
      });
      setForm({ name: '', image: '' });
      const res = await api.get('/brands');
      setBrands(res.data.data || []);
      toast.success('Brand added');
    } catch {
      toast.error('Failed to add brand');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Brands</h1>

      <form onSubmit={create} className="bg-white p-6 rounded-lg shadow border mb-6 space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand name</label>
          <input
            placeholder="e.g. Samsung"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
          <input
            placeholder="https://example.com/brand-logo.jpg"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
          <p className="text-xs text-gray-500 mt-0.5">For homepage brand cards</p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
        >
          {submitting ? 'Adding...' : 'Add Brand'}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[360px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 w-16">Image</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 w-24">Products</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="p-4">
                    {b.image ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={b.image}
                          alt={b.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                          unoptimized={b.image.startsWith('/api/')}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">—</div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-gray-900">{b.name}</td>
                  <td className="p-4 text-gray-500 text-sm">{b._count?.products ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {brands.length === 0 && (
          <p className="p-8 text-gray-500 text-center">No brands yet</p>
        )}
      </div>
    </div>
  );
}
