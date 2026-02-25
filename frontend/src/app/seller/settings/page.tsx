'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { HiCog, HiPhotograph } from 'react-icons/hi';

type Profile = {
  storeName: string;
  storeDescription?: string | null;
  logo?: string | null;
  banner?: string | null;
};

export default function SellerSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    storeName: '',
    storeDescription: '',
    logo: '',
    banner: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/seller/profile')
      .then((res) => {
        const p = res.data.data;
        setProfile(p);
        setForm({
          storeName: p.storeName || '',
          storeDescription: p.storeDescription || '',
          logo: p.logo || '',
          banner: p.banner || '',
        });
      })
      .catch(() => toast.error('Could not load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append('images', f);
    api
      .post('/upload', fd)
      .then(({ data }) => {
        const url = data?.urls?.[0];
        if (url) setForm((s) => ({ ...s, logo: url }));
      })
      .catch(() => toast.error('Upload failed'));
    e.target.value = '';
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append('images', f);
    api
      .post('/upload', fd)
      .then(({ data }) => {
        const url = data?.urls?.[0];
        if (url) setForm((s) => ({ ...s, banner: url }));
      })
      .catch(() => toast.error('Upload failed'));
    e.target.value = '';
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/seller/profile', {
        storeName: form.storeName.trim(),
        storeDescription: form.storeDescription.trim() || undefined,
        logo: form.logo || undefined,
        banner: form.banner || undefined,
      });
      setProfile({
        ...profile,
        storeName: form.storeName.trim(),
        storeDescription: form.storeDescription.trim() || null,
        logo: form.logo || null,
        banner: form.banner || null,
      } as Profile);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 animate-pulse">
            <div className="h-12 bg-gray-100 rounded-xl" />
            <div className="h-24 bg-gray-100 rounded-xl" />
            <div className="h-24 w-24 bg-gray-100 rounded-xl" />
            <div className="h-32 bg-gray-100 rounded-xl" />
          </div>
          <div className="hidden lg:block h-[280px] bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <HiCog className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your store name, branding, and description</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        {/* Form - left */}
        <form onSubmit={save} className="space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-900">Basic information</h2>
              <p className="text-sm text-gray-500 mt-0.5">Your store name and description</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store name</label>
                <input
                  type="text"
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  required
                  placeholder="e.g. Tech Paradise"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store description</label>
                <textarea
                  value={form.storeDescription}
                  onChange={(e) => setForm({ ...form, storeDescription: e.target.value })}
                  placeholder="Tell customers about your store, products, and why they should shop with you..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none transition resize-none"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-900">Branding</h2>
              <p className="text-sm text-gray-500 mt-0.5">Logo and banner shown on your store page</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Store logo</label>
                <div className="flex items-start gap-4">
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                  <label
                    htmlFor="logo-upload"
                    className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 hover:border-amber-400 hover:bg-amber-50/30 cursor-pointer flex flex-col items-center justify-center gap-2 shrink-0 transition"
                  >
                    {form.logo ? (
                      <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <HiPhotograph className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">Upload</span>
                      </>
                    )}
                  </label>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">Square image recommended</p>
                    <p className="text-xs text-gray-500 mt-0.5">e.g. 200×200px • PNG, JPG, WebP</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Store banner</label>
                <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" id="banner-upload" />
                <label
                  htmlFor="banner-upload"
                  className="block w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 hover:border-amber-400 hover:bg-amber-50/30 cursor-pointer transition"
                >
                  {form.banner ? (
                    <div className="aspect-[3/1] min-h-[100px]">
                      <img src={form.banner} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-[3/1] min-h-[100px] flex flex-col items-center justify-center gap-2">
                      <HiPhotograph className="w-10 h-10 text-gray-400" />
                      <span className="text-sm text-gray-500 font-medium">Click to upload banner</span>
                      <span className="text-xs text-gray-400">Wide image (e.g. 1200×300px)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md transition"
          >
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </form>

        {/* Live preview - right */}
        <div className="lg:sticky lg:top-6 self-start">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <p className="text-sm font-semibold text-gray-900">Live preview</p>
              <p className="text-xs text-gray-500">How your store header will look</p>
            </div>
            <div className="p-0">
              <div className="relative overflow-hidden rounded-b-2xl">
                {/* Banner */}
                <div className="aspect-[2/1] min-h-[140px] bg-gradient-to-br from-gray-800 to-gray-900">
                  {form.banner ? (
                    <img src={form.banner} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
                  )}
                </div>
                {/* Logo + name overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex items-end gap-3 overflow-hidden">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white ring-2 ring-white shadow-lg shrink-0 flex-shrink-0">
                      {form.logo ? (
                        <img src={form.logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-amber-100 flex items-center justify-center">
                          <HiPhotograph className="w-7 h-7 text-amber-600" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden pb-0.5">
                      <h3 className="font-bold text-white text-lg truncate">
                        {form.storeName || 'Store name'}
                      </h3>
                      {form.storeDescription && (
                        <p className="text-sm text-gray-300 line-clamp-2 mt-0.5 break-words">
                          {form.storeDescription}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
