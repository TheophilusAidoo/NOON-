'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import ProductImageUrlsInput, { DEFAULT_IMAGE } from '@/components/ProductImageUrlsInput';
import { useFormatPrice } from '@/hooks/useFormatPrice';
import { HiPlus, HiX, HiCheck, HiPencil, HiTrash, HiStar, HiSearch } from 'react-icons/hi';

type Product = {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  isFeatured: boolean;
  images?: { imageUrl: string }[];
  category?: { name: string };
  brand?: { name: string };
};

const loadProducts = () =>
  api.get('/products', { params: { limit: 200 } }).then((res) => {
    const list = res.data.data?.products || [];
    return list;
  });

export default function AdminProductsPage() {
  const formatPrice = useFormatPrice();
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [sellers, setSellers] = useState<{ id: string; name: string; sellerProfile?: { storeName: string } }[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    categoryId: '',
    brandId: '',
    sellerId: '',
    imageUrls: [] as string[],
    sku: '',
    isFeatured: true,
    isWholesale: false,
  });

  useEffect(() => {
    loadProducts()
      .then((list) => {
        setProducts(list);
        setSelected(new Set(list.filter((p: Product) => p.isFeatured).map((p: Product) => p.id)));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showForm) {
      api.get('/categories').then((r) => setCategories(r.data.data || [])).catch(() => setCategories([]));
      api.get('/brands').then((r) => setBrands(r.data.data || [])).catch(() => setBrands([]));
      api.get('/admin/sellers/approved').then((r) => setSellers(r.data.data || [])).catch(() => setSellers([]));
    }
  }, [showForm]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((p) => p.filter((x) => x.id !== id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const selectAllFeatured = () => {
    setSelected(new Set(products.filter((p) => p.isFeatured).map((p) => p.id)));
  };

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q) ||
      p.brand?.name?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const saveFeatured = async () => {
    setSaving(true);
    try {
      await api.put('/admin/featured-products', { productIds: Array.from(selected) });
      setProducts((prev) =>
        prev.map((p) => ({ ...p, isFeatured: selected.has(p.id) }))
      );
      toast.success('Featured products updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const images = form.imageUrls.length ? form.imageUrls : [DEFAULT_IMAGE];
      await api.post('/admin/products', {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        stock: parseInt(form.stock),
        categoryId: form.categoryId,
        brandId: form.brandId,
        sellerId: form.sellerId || undefined,
        isWholesale: form.isWholesale,
        images,
        sku: form.sku || undefined,
        isFeatured: form.isFeatured,
      });
      setShowForm(false);
      setForm({ title: '', description: '', price: '', discountPrice: '', stock: '', categoryId: '', brandId: '', sellerId: '', imageUrls: [], sku: '', isFeatured: false, isWholesale: false });
      const list = await loadProducts();
      setProducts(list);
      setSelected(new Set(list.filter((p: Product) => p.isFeatured).map((p: Product) => p.id)));
      toast.success('Product created! Visit the homepage or Products page to see it.');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="h-24 flex-1 bg-white rounded-2xl border border-gray-200 animate-pulse" />
          <div className="h-24 flex-1 bg-white rounded-2xl border border-gray-200 animate-pulse" />
        </div>
        <div className="h-12 w-full max-w-sm bg-white rounded-xl border border-gray-200 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats & Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-amber-500 rounded-full" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products & Featured</h1>
          </div>
          <p className="text-gray-500 ml-4">Manage your catalog and homepage highlights</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              showForm
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg'
            }`}
          >
            {showForm ? <HiX className="w-4 h-4" /> : <HiPlus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add Product'}
          </button>
          <button
            onClick={selectAllFeatured}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 border-amber-500 text-amber-700 hover:bg-amber-50 bg-white transition-all"
          >
            <HiStar className="w-4 h-4" />
            Select featured
          </button>
          <button
            onClick={saveFeatured}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <HiCheck className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save featured'}
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total products</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/60 p-5 shadow-sm">
          <p className="text-sm font-medium text-amber-800">Featured on homepage</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{selected.size}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={createProduct} className="bg-white rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Create new product</h2>
            <button type="button" onClick={() => setShowForm(false)} className="p-2 -m-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition" aria-label="Close">
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Basic info */}
            <section>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                Basic information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product title</label>
                  <input
                    placeholder="e.g. Wireless Bluetooth Headphones"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    placeholder="Describe your product..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Pricing & inventory */}
            <section>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                Pricing & inventory
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount price</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.discountPrice}
                    onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input
                    placeholder="e.g. WH-001"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
                  />
                </div>
              </div>
            </section>

            {/* Catalog */}
            <section>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                Catalog
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <select
                    value={form.brandId}
                    onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
                  >
                    <option value="">Select brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Options */}
            <section>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                Options
              </h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 border-gray-200 hover:border-amber-300 cursor-pointer transition has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50">
                    <input
                      type="checkbox"
                      checked={form.isWholesale}
                      onChange={(e) => setForm({ ...form, isWholesale: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-400"
                    />
                    <span className="text-sm font-medium text-gray-700">Wholesale catalog</span>
                  </label>
                  <label className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 border-gray-200 hover:border-amber-300 cursor-pointer transition has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured on homepage</span>
                  </label>
                </div>
                {!form.isWholesale && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign to seller</label>
                    <select
                      value={form.sellerId}
                      onChange={(e) => setForm({ ...form, sellerId: e.target.value })}
                      className="w-full sm:max-w-xs px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
                    >
                      <option value="">Auto (first approved seller)</option>
                      {sellers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.sellerProfile?.storeName || s.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1.5">Product will appear in this seller&apos;s store</p>
                  </div>
                )}
              </div>
            </section>

            {/* Images */}
            <section>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                Product images
              </h3>
              <div className="p-4 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
                <ProductImageUrlsInput
                  value={form.imageUrls}
                  onChange={(urls) => setForm({ ...form, imageUrls: urls })}
                />
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-semibold shadow-md transition"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <HiPlus className="w-5 h-5" />
                )}
                {submitting ? 'Creating...' : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">Product catalog</h2>
            <div className="relative">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-72 pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 bg-white placeholder:text-gray-400 transition"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Click a product row to toggle featured. Edit and Delete work independently.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center border border-amber-100">
              <HiPlus className="w-10 h-10 text-amber-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">No products yet</p>
            <p className="text-gray-500 mt-1 mb-6 max-w-sm mx-auto">Create your first product to start selling</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <HiPlus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <HiSearch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">No matches for &quot;{search}&quot;</p>
            <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`flex items-center gap-5 px-5 py-4 cursor-pointer transition-all select-none ${
                  selected.has(p.id)
                    ? 'bg-gradient-to-r from-amber-50/90 to-orange-50/50 hover:from-amber-50 hover:to-orange-50'
                    : 'hover:bg-gray-50/80'
                }`}
              >
                <div className={`shrink-0 w-11 h-11 flex items-center justify-center rounded-xl transition ${
                  selected.has(p.id) ? 'bg-amber-500 text-white' : 'bg-gray-100 border border-gray-200'
                }`}>
                  {selected.has(p.id) ? <HiCheck className="w-6 h-6" /> : <div className="w-5 h-5 rounded-md border-2 border-gray-300" />}
                </div>
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex-shrink-0 ring-1 ring-gray-100">
                  {p.images?.[0]?.imageUrl ? (
                    <Image src={p.images[0].imageUrl} alt="" width={80} height={80} className="object-cover w-full h-full" unoptimized={p.images[0].imageUrl.startsWith('/api/')} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="font-semibold text-gray-900 truncate">{p.title}</p>
                    {selected.has(p.id) && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-amber-200/80 text-amber-900">
                        <HiStar className="w-3.5 h-3.5" />
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-base font-bold text-amber-600 mt-1">{formatPrice(p.discountPrice ?? p.price)}</p>
                  {(p.category || p.brand) && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {[p.category?.name, p.brand?.name].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 border border-amber-200/80 transition-all"
                  >
                    <HiPencil className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => removeProduct(p.id)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 border border-red-200/80 transition-all"
                  >
                    <HiTrash className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
