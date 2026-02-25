'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { register } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';
import { HiPhotograph } from 'react-icons/hi';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>('CUSTOMER');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    storeName: '',
    storeDescription: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setLogoFile(f);
      setLogoPreview(URL.createObjectURL(f));
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setBannerFile(f);
      setBannerPreview(URL.createObjectURL(f));
    } else {
      setBannerFile(null);
      setBannerPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(
        register({
          ...form,
          role,
          storeName: role === 'SELLER' ? form.storeName || undefined : undefined,
          storeDescription: role === 'SELLER' ? form.storeDescription || undefined : undefined,
          logo: role === 'SELLER' && logoFile ? logoFile : undefined,
          banner: role === 'SELLER' && bannerFile ? bannerFile : undefined,
        })
      ).unwrap();
      toast.success(role === 'SELLER' ? 'Registered! Awaiting admin approval.' : 'Registered successfully!');
      router.push('/');
    } catch (err: unknown) {
      const msg =
        typeof err === 'string'
          ? err
          : err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
            ? (err as { message: string }).message
            : 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-500 outline-none transition';

  const canSubmitSeller = role === 'SELLER' ? form.storeName.trim() && logoFile && bannerFile : true;

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-100">
        <img
          src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200"
          alt="Online shopping"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center p-12">
          <Link href="/" className="text-2xl font-bold text-white mb-12 drop-shadow-lg">
            Rakuten
          </Link>
          <h2 className="text-3xl font-bold text-white leading-tight drop-shadow-lg">Join Rakuten</h2>
          <p className="mt-4 text-white text-lg max-w-sm drop-shadow-md">
            Create an account to shop or start selling to thousands of customers.
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="text-xl font-bold text-amber-600">
              Rakuten
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Sign up</h1>
          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Register as</label>
              <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('CUSTOMER')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    role === 'CUSTOMER' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('SELLER')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    role === 'SELLER' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Seller
                </button>
              </div>
              {role === 'SELLER' && (
                <p className="mt-1.5 text-xs text-amber-600">
                  Requires admin approval. Logo and banner are required.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} className={inputClass} />
            </div>
            {role === 'SELLER' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Name *</label>
                  <input type="text" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} required className={inputClass} placeholder="My Store" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Logo *</label>
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm"
                    >
                      <HiPhotograph className="w-5 h-5 text-amber-500" />
                      {logoFile ? logoFile.name : 'Upload logo'}
                    </button>
                    {logoPreview && (
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden border shrink-0">
                        <Image src={logoPreview} alt="Logo" fill className="object-cover" unoptimized />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Square image recommended (e.g. 200×200px)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Banner *</label>
                  <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm"
                    >
                      <HiPhotograph className="w-5 h-5 text-amber-500" />
                      {bannerFile ? bannerFile.name : 'Upload banner'}
                    </button>
                    {bannerPreview && (
                      <div className="relative w-full h-24 rounded-lg overflow-hidden border bg-gray-100">
                        <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Wide image (e.g. 1200×300px)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Description</label>
                  <textarea value={form.storeDescription} onChange={(e) => setForm({ ...form, storeDescription: e.target.value })} className={inputClass} rows={2} placeholder="Tell customers about your store..." />
                </div>
              </>
            )}
            <button
              type="submit"
              disabled={loading || !canSubmitSeller}
              className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-amber-600 hover:text-amber-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
