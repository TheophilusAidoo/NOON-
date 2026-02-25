'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import ProductImageUrlsInput from '@/components/ProductImageUrlsInput';

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sku?: string;
  categoryId: string;
  brandId: string;
  isFeatured?: boolean;
  images?: { imageUrl: string }[];
  variants?: { variantType: string; variantValue: string; stock: number }[];
};

export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    categoryId: '',
    brandId: '',
    imageUrls: [] as string[],
    sku: '',
    isFeatured: false,
  });
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    api.get(`/admin/products/${id}`).then((res) => {
      const p = res.data.data;
      setProduct(p);
      setForm({
        title: p.title,
        description: p.description,
        price: String(p.price),
        discountPrice: p.discountPrice ? String(p.discountPrice) : '',
        stock: String(p.stock),
        categoryId: p.categoryId,
        brandId: p.brandId,
        imageUrls: p.images?.map((i: { imageUrl: string }) => i.imageUrl) || [],
        sku: p.sku || '',
        isFeatured: p.isFeatured ?? false,
      });
    }).catch(() => router.push('/admin/products'));
    api.get('/categories').then((res) => setCategories(res.data.data)).catch(() => {});
    api.get('/brands').then((res) => setBrands(res.data.data)).catch(() => {});
  }, [id, router]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const images = form.imageUrls.length ? form.imageUrls : undefined;
      await api.put(`/admin/products/${id}`, {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        stock: parseInt(form.stock),
        categoryId: form.categoryId,
        brandId: form.brandId,
        images,
        sku: form.sku || undefined,
        isFeatured: form.isFeatured,
      });
      toast.success('Product updated');
      router.push('/admin/products');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const convertToWholesale = async () => {
    setConverting(true);
    try {
      await api.put(`/admin/products/${id}/convert-to-wholesale`);
      toast.success('Product moved to wholesale catalog');
      router.push('/admin/products');
    } catch {
      toast.error('Failed to convert');
    } finally {
      setConverting(false);
    }
  };

  if (!product) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="text-amber-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      <form onSubmit={save} className="bg-white p-6 rounded-lg shadow border max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (optional)</label>
            <input
              type="number"
              step="0.01"
              value={form.discountPrice}
              onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <select
            value={form.brandId}
            onChange={(e) => setForm({ ...form, brandId: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Select brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <ProductImageUrlsInput
          value={form.imageUrls}
          onChange={(urls) => setForm({ ...form, imageUrls: urls })}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU (optional)</label>
          <input
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            className="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
          />
          <span className="text-sm font-medium text-gray-700">Featured on homepage</span>
        </label>
        <div className="pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={convertToWholesale}
            disabled={converting}
            className="text-sm text-amber-600 hover:underline disabled:opacity-50"
          >
            {converting ? 'Converting...' : '→ Make wholesale (visible to all sellers)'}
          </button>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
