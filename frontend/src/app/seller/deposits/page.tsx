'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { useFormatPrice } from '@/hooks/useFormatPrice';
import toast from 'react-hot-toast';
import { HiCurrencyDollar, HiTrendingUp, HiClock, HiCreditCard, HiClipboardCopy, HiX } from 'react-icons/hi';

type LevelInfo = {
  storeLevel: string;
  cumulativeRecharge: number;
  nextLevel: {
    level: string;
    rechargeRequired: number;
    remaining: number;
    productLimit: number;
    profitMargin: number;
  } | null;
};

type PaymentMethod = {
  id: string;
  cryptoName: string;
  walletAddress: string;
  qrCodeUrl?: string | null;
};

const LEVEL_COLORS: Record<string, string> = {
  C: 'bg-amber-500',
  B: 'bg-emerald-500',
  A: 'bg-blue-500',
  S: 'bg-purple-500',
};

export default function SellerDepositsPage() {
  const formatPrice = useFormatPrice();
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [deposits, setDeposits] = useState<{ id: string; amount: number; status: string; createdAt: string }[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const copyAddress = (addr: string, name: string) => {
    navigator.clipboard.writeText(addr);
    toast.success(`${name} address copied`);
  };

  const load = () => {
    api
      .get('/seller/deposits')
      .then((res) => {
        setDeposits(res.data.data?.deposits || []);
        setLevelInfo(res.data.data?.profile || null);
      })
      .catch(() => toast.error('Could not load deposits'))
      .finally(() => setFetching(false));
  };

  useEffect(() => load(), []);

  useEffect(() => {
    api.get('/payment-methods').then((res) => setPaymentMethods(res.data.data || [])).catch(() => {});
  }, []);

  const submitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      await api.post('/seller/deposits', { amount: amt });
      toast.success('Deposit request submitted. Admin will approve and credit your account.');
      setAmount('');
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Failed to submit deposit');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-gray-500">Loading...</div>;

  const progressPercent = levelInfo?.nextLevel
    ? Math.min(100, ((levelInfo.cumulativeRecharge ?? 0) / (levelInfo.nextLevel.rechargeRequired || 1)) * 100)
    : 0;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Deposit / Recharge</h1>
        <p className="text-sm text-gray-500 mt-0.5">Deposit to upgrade your store level and unlock more products & profit margins.</p>
      </div>

      {levelInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Level */}
          <div className="bg-white border-l-4 border-l-amber-500 rounded border border-gray-200 p-4">
            <p className="text-xs uppercase text-gray-500 mb-1">Current Level</p>
            <div className="flex items-center gap-3">
              <span className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl ${LEVEL_COLORS[levelInfo.storeLevel] || 'bg-gray-500'}`}>
                {levelInfo.storeLevel}
              </span>
              <div>
                <p className="font-semibold text-gray-900">Level {levelInfo.storeLevel}</p>
                <p className="text-sm text-gray-500">Recharged: {formatPrice(levelInfo.cumulativeRecharge)}</p>
              </div>
            </div>
          </div>

          {/* Next Level */}
          {levelInfo.nextLevel && (
            <div className="bg-white border-l-4 border-l-emerald-500 rounded border border-gray-200 p-4">
              <p className="text-xs uppercase text-gray-500 mb-2">Next: Level {levelInfo.nextLevel.level}</p>
              <p className="text-sm font-medium text-gray-900">
                Need {formatPrice(levelInfo.nextLevel.remaining)} more to upgrade
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <HiTrendingUp className="w-3.5 h-3.5" />
                {levelInfo.nextLevel.productLimit} products · {levelInfo.nextLevel.profitMargin}% profit margin
              </p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Request Deposit - button opens modal */}
      <div className="bg-white rounded border border-gray-200 p-4 max-w-lg">
        <div className="flex items-center gap-2 mb-3">
          <HiCurrencyDollar className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-gray-900">Request Deposit</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Submit a deposit request. Admin will approve and credit your account once you pay.
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600"
        >
          Request Deposit
        </button>
      </div>

      {/* Modal - pops up when Request Deposit is clicked */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalOpen(false)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Request Deposit</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <form onSubmit={submitDeposit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
                  />
                </div>

                {paymentMethods.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <HiCreditCard className="w-4 h-4 text-gray-500" />
                      <h4 className="text-sm font-semibold text-gray-700">Pay via</h4>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Send your deposit to one of the following, then submit the request.</p>
                    <div className="space-y-4">
                      {paymentMethods.map((pm) => (
                        <div key={pm.id} className="flex flex-col gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                          {/* QR code on top */}
                          {pm.qrCodeUrl && (
                            <div className="flex flex-col items-center gap-2">
                              <p className="text-xs font-medium text-gray-600">{pm.cryptoName} – Scan QR Code</p>
                              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-lg border-2 border-gray-300 bg-white p-2 shadow-sm overflow-hidden">
                                <img src={pm.qrCodeUrl} alt={`${pm.cryptoName} QR`} className="w-full h-full object-contain" />
                              </div>
                            </div>
                          )}
                          {/* Wallet address below */}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-500 uppercase">{pm.cryptoName} Address</p>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-sm text-gray-800 truncate flex-1">{pm.walletAddress}</code>
                              <button
                                type="button"
                                onClick={() => copyAddress(pm.walletAddress, pm.cryptoName)}
                                className="p-1.5 rounded hover:bg-gray-200 text-gray-600 shrink-0"
                                title="Copy"
                              >
                                <HiClipboardCopy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Deposit History */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <HiClock className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-gray-900 text-sm">Deposit History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2.5 text-left font-medium text-gray-600">Amount</th>
                <th className="px-4 py-2.5 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-2.5 text-left font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500 text-sm">
                    No deposits yet
                  </td>
                </tr>
              ) : (
                deposits.map((d) => (
                  <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium">{formatPrice(d.amount)}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          d.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
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
