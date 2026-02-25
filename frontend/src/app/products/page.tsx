'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProducts } from '@/store/slices/productSlice';
import ProductCard from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/Skeleton';
import { api } from '@/lib/axios';
import {
  HiSearch,
  HiFilter,
  HiX,
  HiChevronLeft,
  HiChevronRight,
  HiAdjustments,
} from 'react-icons/hi';

const inputClass =
  'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#e61502]/20 focus:border-[#e61502] outline-none transition';

function ProductsContent() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { products, pagination, loading } = useAppSelector((s) => s.products);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    flash: searchParams.get('flash') === 'true',
    minPrice: '',
    maxPrice: '',
    sort: searchParams.get('sort') || '',
    order: searchParams.get('order') || 'desc',
    page: 1,
  });

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data)).catch(() => {});
    api.get('/brands').then((res) => setBrands(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setFilters((f) => ({
      ...f,
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      brand: searchParams.get('brand') || '',
      flash: searchParams.get('flash') === 'true',
      sort: searchParams.get('sort') || '',
      order: searchParams.get('order') || 'desc',
      page: 1,
    }));
  }, [searchParams]);

  useEffect(() => {
    const params: Record<string, string | number | boolean> = { page: filters.page };
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.brand) params.brand = filters.brand;
    if (filters.flash) params.flash = true;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.sort) {
      params.sort = filters.sort;
      params.order = filters.order;
    }
    dispatch(fetchProducts(params));
  }, [filters, dispatch]);

  const applyFilters = () => {
    setFilters((f) => ({ ...f, page: 1 }));
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      flash: false,
      minPrice: '',
      maxPrice: '',
      sort: '',
      order: 'desc',
      page: 1,
    });
  };

  const hasActiveFilters =
    filters.search || filters.category || filters.brand || filters.flash || filters.minPrice || filters.maxPrice;

  const FiltersSidebar = () => (
    <aside className="space-y-5">
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          placeholder="Search products..."
          className={`${inputClass} pl-10`}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className={inputClass}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Brand
        </label>
        <select
          value={filters.brand}
          onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
          className={inputClass}
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Price range
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={filters.flash}
          onChange={(e) => setFilters({ ...filters, flash: e.target.checked, page: 1 })}
          className="w-4 h-4 rounded border-gray-300 text-[#e61502] focus:ring-[#e61502]/30"
        />
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
          Flash Deals only
        </span>
      </label>

      <div className="flex gap-2 pt-1">
        <button
          onClick={applyFilters}
          className="flex-1 py-2.5 bg-[#e61502] text-white text-sm font-semibold rounded-xl hover:bg-[#c91201] transition shadow-sm"
        >
          Apply
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            <HiX className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Page header */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Products
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                {loading
                  ? 'Loading...'
                  : `${pagination.total} product${pagination.total !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <HiAdjustments className="w-5 h-5" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#e61502] shrink-0" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-32 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <HiFilter className="w-5 h-5 text-[#e61502]" />
                <h2 className="font-semibold text-gray-900">Filters</h2>
              </div>
              <FiltersSidebar />
            </div>
          </aside>

          {/* Mobile filters overlay */}
          {filtersOpen && (
            <div
              className="fixed inset-0 z-50 lg:hidden"
              onClick={() => setFiltersOpen(false)}
            >
              <div
                className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl p-6 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-gray-900">Filters</h2>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                </div>
                <FiltersSidebar />
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-gray-500">Active:</span>
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-medium">
                    Search
                  </span>
                )}
                {filters.category && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-medium">
                    {categories.find((c) => c.id === filters.category)?.name || 'Category'}
                  </span>
                )}
                {filters.brand && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-medium">
                    {brands.find((b) => b.id === filters.brand)?.name || 'Brand'}
                  </span>
                )}
                {filters.flash && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-medium">
                    Flash Deals
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                {Array(15)
                  .fill(0)
                  .map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                  {products.map((p, i) => (
                    <div
                      key={p.id}
                      className="animate-fade-in-up opacity-0 h-full"
                      style={{
                        animationDelay: `${Math.min(i * 0.03, 0.4)}s`,
                        animationFillMode: 'forwards',
                      }}
                    >
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                      disabled={filters.page <= 1}
                      className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <HiChevronLeft className="w-5 h-5" />
                      Previous
                    </button>
                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const start =
                          pagination.totalPages <= 5
                            ? 1
                            : Math.min(
                                Math.max(1, filters.page - 2),
                                pagination.totalPages - 4
                              );
                        const page = start + i;
                        return (
                          <button
                            key={page}
                            onClick={() => setFilters((f) => ({ ...f, page }))}
                            className={`w-10 h-10 rounded-xl text-sm font-medium transition ${
                              filters.page === page
                                ? 'bg-[#e61502] text-white'
                                : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                      disabled={filters.page >= pagination.totalPages}
                      className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                      <HiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <HiSearch className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">No products found</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                  Try adjusting your filters or search terms to find what you&apos;re looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 bg-[#e61502] text-white text-sm font-medium rounded-xl hover:bg-[#c91201] transition"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
              ))}
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
