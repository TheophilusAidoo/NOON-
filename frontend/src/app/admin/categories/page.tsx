'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';

type Category = { id: string; name: string; slug: string; image?: string | null; promoLabel?: string | null; _count?: { products: number } };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: '', slug: '', image: '', promoLabel: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data || [])).catch(() => setCategories([]));
  }, []);

  const slugFromName = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: f.slug || slugFromName(name) }));
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/categories', {
        name: form.name,
        slug: form.slug || slugFromName(form.name),
        image: form.image || undefined,
        promoLabel: form.promoLabel || undefined,
      });
      setForm({ name: '', slug: '', image: '', promoLabel: '' });
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
      toast.success('Category added');
    } catch {
      toast.error('Failed to add category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categories</h1>

      <form onSubmit={create} className="bg-white p-6 rounded-lg shadow border mb-6 space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            placeholder="e.g. Electronics"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            placeholder="e.g. electronics"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
          <p className="text-xs text-gray-500 mt-0.5">URL-friendly identifier (auto-filled from name)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
          <input
            placeholder="https://example.com/category-image.jpg"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Promo label (optional)</label>
          <input
            placeholder="e.g. UP TO -25%"
            value={form.promoLabel}
            onChange={(e) => setForm({ ...form, promoLabel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
        >
          {submitting ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 w-16">Image</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Slug</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 w-24">Products</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="p-4">
                    {c.image ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={c.image}
                          alt={c.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                          unoptimized={c.image.startsWith('/api/')}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">—</div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-gray-900">{c.name}</td>
                  <td className="p-4 text-gray-600 font-mono text-sm">{c.slug}</td>
                  <td className="p-4 text-gray-500 text-sm">{c._count?.products ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
