'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useFormatPrice } from '@/hooks/useFormatPrice';
import { HiCheckCircle, HiCreditCard, HiLockClosed } from 'react-icons/hi';

type Withdrawal = {
  id: string;
  amount: number;
  status: string;
  walletAddress?: string | null;
  cryptoName?: string | null;
  createdAt: string;
};

export default function SellerWithdrawalsPage() {
  const [data, setData] = useState<{
    availableBalance: number;
    totalEarnings: number;
    totalWithdrawn: number;
    withdrawals: Withdrawal[];
    walletAddress: string;
    cryptoName: string;
  } | null>(null);
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [cryptoName, setCryptoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingWallet, setSavingWallet] = useState(false);
  const formatPrice = useFormatPrice();

  const fetchData = () => {
    api.get('/seller/withdrawals').then((res) => {
      const d = res.data.data;
      setData(d);
      setWalletAddress(d?.walletAddress ?? '');
      setCryptoName(d?.cryptoName ?? '');
    }).catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveWalletDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const wa = (walletAddress || '').trim();
    const cn = (cryptoName || '').trim();
    if (!wa || !cn) {
      toast.error('Enter both wallet address and crypto name');
      return;
    }
    setSavingWallet(true);
    try {
      await api.put('/seller/profile', { cryptoWalletAddress: wa, cryptoName: cn });
      toast.success('Wallet details saved');
      fetchData();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSavingWallet(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (!password.trim()) {
      toast.error('Enter your password to confirm');
      return;
    }
    const wa = (data?.walletAddress ?? '').trim();
    const cn = (data?.cryptoName ?? '').trim();
    if (!wa || !cn) {
      toast.error('Set your wallet address and crypto name first');
      return;
    }
    setLoading(true);
    try {
      await api.post('/seller/withdrawal', { amount: val, password });
      setAmount('');
      setPassword('');
      fetchData();
      toast.success('Withdrawal request submitted');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div className="text-slate-500 py-12">Loading...</div>;

  const canWithdraw = (data.walletAddress ?? '').trim() !== '' && (data.cryptoName ?? '').trim() !== '';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Withdrawals</h1>
        <p className="text-slate-500 text-sm mt-1">Withdraw your earnings to your crypto wallet</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/60 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-emerald-800 uppercase tracking-wide">Available</p>
          <p className="text-2xl font-bold text-emerald-700 mt-0.5">{formatPrice(data.availableBalance)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Earnings</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{formatPrice(data.totalEarnings)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Withdrawn</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{formatPrice(data.totalWithdrawn)}</p>
        </div>
      </div>

      {/* Step 1 & 2: Two-column layout on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet details */}
        <form onSubmit={saveWalletDetails} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${canWithdraw ? 'bg-emerald-100' : 'bg-amber-100'}`}>
              {canWithdraw ? <HiCheckCircle className="w-6 h-6 text-emerald-600" /> : <HiCreditCard className="w-6 h-6 text-amber-600" />}
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Step 1 — Wallet details</h2>
              <p className="text-xs text-slate-500">{canWithdraw ? 'Configured' : 'Required before withdrawal'}</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Crypto</label>
              <input
                type="text"
                placeholder="e.g. USDT, BTC, ETH"
                value={cryptoName}
                onChange={(e) => setCryptoName(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Wallet address</label>
              <input
                type="text"
                placeholder="0x... or your wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={savingWallet}
              className="w-full py-2.5 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {savingWallet ? 'Saving...' : 'Save wallet'}
            </button>
          </div>
        </form>

        {/* Request withdrawal */}
        <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <HiLockClosed className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Step 2 — Request withdrawal</h2>
              <p className="text-xs text-slate-500">Enter amount and confirm with password</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {!canWithdraw && (
              <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                Complete Step 1 first.
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-slate-900"
              />
              <p className="text-xs text-slate-500 mt-1.5">Max {formatPrice(data.availableBalance)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={loading || data.availableBalance <= 0 || !canWithdraw}
              className="w-full py-3 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Submitting...' : 'Withdraw'}
            </button>
          </div>
        </form>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">History</h2>
          <p className="text-xs text-slate-500 mt-0.5">Your withdrawal requests</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left font-semibold text-slate-600">Amount</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">No withdrawal requests yet</td>
                </tr>
              ) : (
                data.withdrawals.map((w) => (
                  <tr key={w.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">{formatPrice(w.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        w.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{new Date(w.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
