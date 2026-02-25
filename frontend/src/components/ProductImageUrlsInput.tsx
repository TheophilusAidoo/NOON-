'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/axios';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
};

export default function ProductImageUrlsInput({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }
      const { data } = await api.post('/upload', formData);
      const urls = data?.urls || [];
      onChange([...value, ...urls]);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
        id="product-image-upload"
      />
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="product-image-upload"
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
            uploading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-amber-400 hover:text-amber-700 cursor-pointer'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload images'}
        </label>
        <span className="text-xs text-gray-500">JPEG, PNG, GIF, WebP · max 5MB each</span>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {value.map((url, i) => (
            <div key={i} className="relative group">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23ddd" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" fill="%23999" text-anchor="middle" dy=".3em" font-size="10"%3E?%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600 shadow transition"
                title="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {value.length === 0 && !uploading && (
        <button
          type="button"
          onClick={() => onChange([DEFAULT_IMAGE])}
          className="text-sm text-amber-600 hover:text-amber-700 font-medium hover:underline transition"
        >
          Use default placeholder image
        </button>
      )}
    </div>
  );
}

export { DEFAULT_IMAGE };
