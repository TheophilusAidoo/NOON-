'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import ProductImageUrlsInput, { DEFAULT_IMAGE } from '@/components/ProductImageUrlsInput';
import { useFormatPrice } from '@/hooks/useFormatPrice';

type Product = {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  sku?: string;
  images?: { imageUrl: string }[];
};

type WholesaleProduct = Product & {
  category?: { name: string };
  brand?: { name: string };
  description?: string;
  categoryId?: string;
  brandId?: string;
};

export default function SellerProductsPage() {
  const formatPrice = useFormatPrice();
  const [products, setProducts] = useState<Product[]>([]);
  const [wholesaleProducts, setWholesaleProducts] = useState<WholesaleProduct[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [resellProduct, setResellProduct] = useState<WholesaleProduct | null>(null);
  const [reselling, setReselling] = useState(false);
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
  });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'mine' | 'wholesale'>('mine');
  const [canListProducts, setCanListProducts] = useState<boolean | null>(null);
  const [levelInfo, setLevelInfo] = useState<{ storeLevel: string; productLimit: number } | null>(null);

  const loadData = () => {
    api.get('/seller/products').then((res) => setProducts(res.data.data)).catch(() => {});
    api.get('/seller/wholesale-products').then((res) => setWholesaleProducts(res.data.data || [])).catch(() => setWholesaleProducts([]));
  };

  useEffect(() => {
    loadData();
    api.get('/categories').then((res) => setCategories(res.data.data)).catch(() => {});
    api.get('/brands').then((res) => setBrands(res.data.data)).catch(() => {});
    api.get('/seller/level').then((res) => {
      const d = res.data.data;
      const recharge = d?.cumulativeRecharge ?? 0;
      setCanListProducts(recharge > 0);
      setLevelInfo(d ? { storeLevel: d.storeLevel ?? 'C', productLimit: d.productLimit ?? 20 } : null);
    }).catch(() => setCanListProducts(false));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const images = form.imageUrls.length ? form.imageUrls : [DEFAULT_IMAGE];
      await api.post('/seller/products', {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        stock: parseInt(form.stock),
        categoryId: form.categoryId,
        brandId: form.brandId,
        images,
        sku: form.sku || undefined,
      });
      setShowForm(false);
      setForm({ title: '', description: '', price: '', discountPrice: '', stock: '', categoryId: '', brandId: '', imageUrls: [], sku: '' });
      loadData();
      toast.success('Product created');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/seller/products/${id}`);
      setProducts((p) => p.filter((x) => x.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed');
    }
  };

  const resell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resellProduct) return;
    setReselling(true);
    try {
      const wholesalePrice = resellProduct.discountPrice ?? resellProduct.price;
      await api.post(`/seller/wholesale-products/${resellProduct.id}/resell`, {
        price: wholesalePrice,
        stock: 1,
      });
      setResellProduct(null);
      loadData();
      toast.success('Product added to your store');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setReselling(false);
    }
  };

  return (
    <div className="w-full">
      {canListProducts === false && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800">
            You must make a deposit to list or resell products. Deposit to unlock your store level.
          </p>
          <Link href="/seller/deposits" className="shrink-0 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600">Deposit</Link>
        </div>
      )}
      {canListProducts && levelInfo && products.length >= levelInfo.productLimit && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800">
            Product limit reached ({levelInfo.productLimit} for Level {levelInfo.storeLevel}). Deposit to upgrade your store level.
          </p>
          <Link href="/seller/deposits" className="shrink-0 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600">Deposit to Upgrade</Link>
        </div>
      )}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500">
              Manage and resell from wholesale
              {levelInfo && canListProducts && (
                <span className="ml-1 text-amber-600 font-medium">
                  · {products.length}/{levelInfo.productLimit} (Level {levelInfo.storeLevel})
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={canListProducts === false || (levelInfo != null && products.length >= levelInfo.productLimit)}
            className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>
        <div className="flex gap-0.5 mt-4 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('mine')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === 'mine'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Products ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wholesale')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === 'wholesale'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Wholesale ({wholesaleProducts.length})
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 space-y-4 max-w-xl">
          <h2 className="text-lg font-semibold text-gray-900">New Product</h2>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              step="0.01"
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400"
            />
            <input
              type="number"
              placeholder="Discount price (optional)"
              value={form.discountPrice}
              onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
              step="0.01"
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
            min="0"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400"
          />
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={form.brandId}
            onChange={(e) => setForm({ ...form, brandId: e.target.value })}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Select brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <ProductImageUrlsInput
            value={form.imageUrls}
            onChange={(urls) => setForm({ ...form, imageUrls: urls })}
          />
          <input
            placeholder="SKU (optional)"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400"
          />
          <button type="submit" className="px-5 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600">
            Create Product
          </button>
        </form>
      )}

      {activeTab === 'mine' && (
        <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {products.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500 text-sm">No products yet</p>
              <p className="text-xs text-gray-400 mt-0.5">Add a product above or resell from Wholesale</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50/50">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {p.images?.[0]?.imageUrl ? (
                      <Image src={p.images[0].imageUrl} alt="" width={56} height={56} className="object-cover w-full h-full" unoptimized={p.images[0].imageUrl.startsWith('/api/')} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{p.title}</h3>
                    <p className="text-sm font-semibold text-amber-600">{formatPrice(p.discountPrice ?? p.price)}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {!p.sku?.startsWith('WS-') && (
                      <Link href={`/seller/products/${p.id}`} className="px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 rounded hover:bg-amber-100">Edit</Link>
                    )}
                    <button onClick={() => remove(p.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'wholesale' && (
        <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {wholesaleProducts.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500 text-sm">No wholesale products</p>
              <p className="text-xs text-gray-400 mt-0.5">Admin adds them in Admin → Products</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {wholesaleProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50/50">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                    {p.images?.[0]?.imageUrl ? (
                      <Image src={p.images[0].imageUrl} alt="" width={56} height={56} className="object-cover w-full h-full" unoptimized={p.images[0].imageUrl.startsWith('/api/')} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No img</div>
                    )}
                    <span className="absolute top-0.5 right-0.5 bg-amber-500 text-white text-[9px] font-semibold px-1 rounded">WS</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{p.title}</h3>
                    {p.category && <p className="text-[10px] text-gray-500">{p.category.name}</p>}
                    <p className="text-sm font-semibold text-amber-600">{formatPrice(p.discountPrice ?? p.price)}</p>
                  </div>
                  <button
                    onClick={() => setResellProduct(p)}
                    disabled={canListProducts === false || (levelInfo != null && products.length >= levelInfo.productLimit)}
                    className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded hover:bg-amber-600 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resell
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {resellProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setResellProduct(null)}>
          <form
            onSubmit={resell}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900">Resell: {resellProduct.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{formatPrice(resellProduct.discountPrice ?? resellProduct.price)}</p>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setResellProduct(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reselling}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50"
              >
                {reselling ? 'Adding...' : 'Add to my store'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
