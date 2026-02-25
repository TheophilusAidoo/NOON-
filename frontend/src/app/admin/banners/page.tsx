'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiPhotograph, HiOfficeBuilding } from 'react-icons/hi';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<{ id: string; title?: string; imageUrl: string; linkUrl?: string }[]>([]);
  const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', position: 0 });
  const [loading, setLoading] = useState(false);
  const [sellersBanner, setSellersBanner] = useState({ imageUrl: '' });
  const [sellersSaving, setSellersSaving] = useState(false);

  const fetchBanners = () => {
    api.get('/admin/banners').then((res) => setBanners(res.data.data)).catch(() => {});
    api.get('/admin/banners/sellers-page').then((res) => setSellersBanner(res.data.data || { imageUrl: '' })).catch(() => {});
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/banners', form);
      setForm({ title: '', imageUrl: '', linkUrl: '', position: 0 });
      fetchBanners();
      toast.success('Banner added');
    } catch {
      toast.error('Failed to add banner');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      fetchBanners();
      toast.success('Banner removed');
    } catch {
      toast.error('Failed to remove banner');
    }
  };

  const saveSellersBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSellersSaving(true);
    try {
      await api.put('/admin/banners/sellers-page', { imageUrl: sellersBanner.imageUrl });
      toast.success('Sellers page banner saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSellersSaving(false);
    }
  };

  const handleImageUpload = (
    setter: (v: string) => void,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append('images', f);
    api.post('/upload', fd).then(({ data }) => {
      const url = data?.urls?.[0];
      if (url) setter(url);
    }).catch(() => toast.error('Upload failed'));
    e.target.value = '';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Website Banners</h1>
        <p className="text-sm text-gray-500 mt-1">Manage homepage hero carousel and Our Sellers page banner</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Our Sellers Page Banner - left */}
        <section className="lg:order-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center gap-3">
            <HiOfficeBuilding className="w-6 h-6 text-amber-600" />
            <div>
              <h2 className="font-semibold text-gray-900">Our Sellers Page Banner</h2>
              <p className="text-sm text-gray-500">Hero image at the top of /sellers page</p>
            </div>
          </div>
          <form onSubmit={saveSellersBanner} noValidate className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banner image</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="Paste URL or upload →"
                  value={sellersBanner.imageUrl}
                  onChange={(e) => setSellersBanner({ ...sellersBanner, imageUrl: e.target.value })}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                />
                <label className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl cursor-pointer shrink-0 flex items-center justify-center transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const fd = new FormData();
                      fd.append('images', f);
                      api.post('/upload', fd).then(({ data }) => {
                        const url = data?.urls?.[0];
                        if (url) setSellersBanner((s) => ({ ...s, imageUrl: url }));
                      }).catch(() => toast.error('Upload failed'));
                      e.target.value = '';
                    }}
                  />
                  Upload
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Paste image URL or upload a file</p>
            </div>
            {sellersBanner.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-[3/1] max-h-32">
                <img
                  src={sellersBanner.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="200"%3E%3Crect fill="%23e5e7eb" width="600" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EBroken image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            )}
            <button
              type="submit"
              disabled={sellersSaving}
              className="w-full px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium rounded-xl transition"
            >
              {sellersSaving ? 'Saving...' : 'Save Sellers Banner'}
            </button>
          </form>
        </section>

        {/* Add Banner - right */}
        <section className="lg:order-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <HiPlus className="w-6 h-6 text-amber-600" />
            <div>
              <h2 className="font-semibold text-gray-900">Add Homepage Banner</h2>
              <p className="text-sm text-gray-500">Paste URL or upload image for homepage hero</p>
            </div>
          </div>
          <form onSubmit={create} noValidate className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title (optional)</label>
              <input
                type="text"
                placeholder="e.g. Summer Sale"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner image <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="Paste URL or upload →"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                />
                <label className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl cursor-pointer shrink-0 flex items-center justify-center transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload((url) => setForm((f) => ({ ...f, imageUrl: url })), e)}
                  />
                  Upload
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Paste image URL or upload a file (JPG, PNG, GIF, WebP)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link URL (optional)</label>
              <input
                type="text"
                placeholder="https://example.com/promotion"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1.5">Where users go when they click the banner</p>
            </div>
            {form.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-[2.5/1] max-h-28">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="160"%3E%3Crect fill="%23e5e7eb" width="400" height="160"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EBroken image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !form.imageUrl.trim()}
              className="w-full px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition"
            >
              {loading ? 'Adding...' : 'Add Banner'}
            </button>
          </form>
        </section>
      </div>

      {/* Banner List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Homepage Banners <span className="text-gray-400 font-normal">({banners.length})</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="aspect-[2.5/1] bg-gray-100 relative overflow-hidden">
                {/* Use img for GIF support from any URL */}
                <img
                  src={b.imageUrl}
                  alt={b.title || 'Banner'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="160" viewBox="0 0 400 160"%3E%3Crect fill="%23e5e7eb" width="400" height="160"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif"%3EInvalid URL%3C/text%3E%3C/svg%3E';
                  }}
                />
                <button
                  type="button"
                  onClick={() => remove(b.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete banner"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <p className="font-medium text-gray-900 truncate">{b.title || 'Untitled'}</p>
                {b.linkUrl && (
                  <p className="text-sm text-gray-500 truncate mt-0.5">{b.linkUrl}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        {banners.length === 0 && (
          <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <HiPhotograph className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No banners yet. Add one above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
