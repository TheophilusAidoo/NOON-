'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/store/hooks';
import { setCurrency } from '@/store/slices/settingsSlice';
import { HiCog, HiCurrencyDollar, HiTrendingUp, HiLocationMarker, HiPhone } from 'react-icons/hi';

type LevelConfig = { rechargeRequired: number; productLimit: number; profitMargin: number };
type SellerLevels = { C: LevelConfig; B: LevelConfig; A: LevelConfig; S: LevelConfig };
type FooterSettings = { tagline: string; address: string; phone: string };

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const DEFAULT_LEVELS: SellerLevels = {
  C: { rechargeRequired: 1000, productLimit: 20, profitMargin: 15 },
  B: { rechargeRequired: 10000, productLimit: 50, profitMargin: 20 },
  A: { rechargeRequired: 50000, productLimit: 100, profitMargin: 25 },
  S: { rechargeRequired: 100000, productLimit: 200, profitMargin: 30 },
};

const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-500 outline-none';

export default function AdminSettingsPage() {
  const dispatch = useAppDispatch();
  const [currency, setCurrencyState] = useState({ code: 'USD', symbol: '$' });
  const [sellerLevels, setSellerLevelsState] = useState<SellerLevels>(DEFAULT_LEVELS);
  const [footer, setFooter] = useState<FooterSettings>({
    tagline: 'Your trusted multi-vendor marketplace. Electronics, fashion, home & more — all in one place.',
    address: '123 Commerce Street, Retail City',
    phone: '+1 234 567 8900',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api
      .get('/admin/settings')
      .then((res) => {
        const d = res.data.data;
        if (d?.currency?.code && d?.currency?.symbol) setCurrencyState(d.currency);
        if (d?.sellerLevels) setSellerLevelsState({ ...DEFAULT_LEVELS, ...d.sellerLevels });
        if (d?.footer) setFooter((prev) => ({ ...prev, ...d.footer }));
      })
      .catch(() => toast.error('Could not load settings'))
      .finally(() => setFetching(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/admin/settings', { currency, sellerLevels, footer });
      dispatch(setCurrency(currency));
      toast.success('Settings saved.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const updateLevel = (level: keyof SellerLevels, field: keyof LevelConfig, value: number) => {
    setSellerLevelsState((prev) => ({
      ...prev,
      [level]: { ...prev[level], [field]: value },
    }));
  };

  const selectCurrency = (c: (typeof CURRENCIES)[0]) => {
    setCurrencyState({ code: c.code, symbol: c.symbol });
  };

  const levelRowBg: Record<string, string> = {
    C: 'bg-amber-50/50',
    B: 'bg-emerald-50/50',
    A: 'bg-blue-50/50',
    S: 'bg-purple-50/50',
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-8">
        <HiCog className="w-8 h-8 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage currency, store levels, and site-wide options</p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-8">
        {/* Currency */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <HiCurrencyDollar className="w-6 h-6 text-amber-500" />
            <div>
              <h2 className="font-semibold text-gray-900">Currency</h2>
              <p className="text-sm text-gray-500">Display currency across the store</p>
            </div>
          </div>
          <div className="p-6">
            {fetching ? (
              <div className="h-24 flex items-center text-gray-500">Loading...</div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => selectCurrency(c)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all w-full ${
                        currency.code === c.code
                          ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-2xl font-bold">{c.symbol}</span>
                      <span className="text-left">
                        <span className="block font-medium">{c.code}</span>
                        <span className="block text-xs text-gray-500">{c.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-500">Selected: <strong className="text-gray-900">{currency.symbol} {currency.code}</strong></p>
              </>
            )}
          </div>
        </section>

        {/* Store Levels */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HiTrendingUp className="w-6 h-6 text-amber-500" />
              <div>
                <h2 className="font-semibold text-gray-900">Store Levels</h2>
                <p className="text-sm text-gray-500">Recharge thresholds, product limits, and seller profit margins</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> C
              </span>
              <span className="text-gray-300">→</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> B
              </span>
              <span className="text-gray-300">→</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> A
              </span>
              <span className="text-gray-300">→</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> S
              </span>
            </div>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                    Level
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Recharge ($)
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product limit
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Profit margin (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {(['C', 'B', 'A', 'S'] as const).map((lvl) => (
                  <tr key={lvl} className={`border-b border-gray-100 last:border-0 ${levelRowBg[lvl]}`}>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-lg font-bold text-white ${
                        lvl === 'C' ? 'bg-amber-500' :
                        lvl === 'B' ? 'bg-emerald-500' :
                        lvl === 'A' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}>
                        {lvl}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="number"
                        min={0}
                        value={sellerLevels[lvl].rechargeRequired}
                        onChange={(e) => updateLevel(lvl, 'rechargeRequired', Number(e.target.value))}
                        className={`${inputClass} max-w-[140px]`}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="number"
                        min={1}
                        value={sellerLevels[lvl].productLimit}
                        onChange={(e) => updateLevel(lvl, 'productLimit', Number(e.target.value))}
                        className={`${inputClass} max-w-[120px]`}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={sellerLevels[lvl].profitMargin}
                        onChange={(e) => updateLevel(lvl, 'profitMargin', Number(e.target.value))}
                        className={`${inputClass} max-w-[100px]`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm text-gray-500 mt-6 pt-4 border-t border-gray-100">
              Sellers deposit to upgrade through levels. Profit margin is the percentage the seller keeps per sale.
            </p>
          </div>
        </section>

        {/* Footer */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <HiLocationMarker className="w-6 h-6 text-amber-500" />
            <div>
              <h2 className="font-semibold text-gray-900">Footer Content</h2>
              <p className="text-sm text-gray-500">Tagline, address, and phone shown in the site footer</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {fetching ? (
              <div className="h-20 flex items-center text-gray-500">Loading...</div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={footer.tagline}
                    onChange={(e) => setFooter((f) => ({ ...f, tagline: e.target.value }))}
                    className={`${inputClass}`}
                    placeholder="Your trusted multi-vendor marketplace..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={footer.address}
                    onChange={(e) => setFooter((f) => ({ ...f, address: e.target.value }))}
                    className={`${inputClass}`}
                    placeholder="123 Commerce Street, Retail City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <HiPhone className="w-4 h-4" /> Phone
                  </label>
                  <input
                    type="text"
                    value={footer.phone}
                    onChange={(e) => setFooter((f) => ({ ...f, phone: e.target.value }))}
                    className={`${inputClass}`}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </>
            )}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || fetching}
            className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
