'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import CheckoutForm from '@/components/CheckoutForm';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { HiCreditCard, HiCash, HiOutlineCheck, HiCurrencyDollar, HiClipboardCopy } from 'react-icons/hi';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY || '';
const stripePromise = stripeKey && !stripeKey.includes('placeholder') ? loadStripe(stripeKey) : null;

type ManualMethod = { id: string; cryptoName: string; walletAddress: string; qrCodeUrl: string | null };

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [manualMethods, setManualMethods] = useState<ManualMethod[]>([]);
  const [step, setStep] = useState<'address' | 'method' | 'payment'>('address');
  const [selectedMethod, setSelectedMethod] = useState<'cod' | 'manual' | 'stripe' | null>(null);
  const [selectedManualId, setSelectedManualId] = useState<string | null>(null);

  const stripeAvailable = !!stripePromise;

  useEffect(() => {
    api.get('/payment-methods').then((r) => setManualMethods(r.data?.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    api
      .get('/orders/last-address')
      .then((r) => {
        const addr = r.data?.data?.defaultAddress;
        if (addr && typeof addr === 'string') setAddress(addr);
      })
      .catch(() => {});
  }, [user]);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setStep('method');
  };

  const handlePlaceOrderCOD = async () => {
    setLoading(true);
    try {
      await api.post('/orders', {
        shippingAddress: address.trim(),
        couponCode: couponCode.trim() || undefined,
      });
      toast.success('Order placed! Pay on delivery.');
      router.push('/orders');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrderManual = async () => {
    if (!selectedManualId) return;
    setLoading(true);
    try {
      await api.post('/orders', {
        shippingAddress: address.trim(),
        couponCode: couponCode.trim() || undefined,
      });
      toast.success('Order placed! Complete payment using the wallet details.');
      router.push('/orders');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToStripe = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payment/create-payment-intent', {
        shippingAddress: { line1: address },
        couponCode: couponCode.trim() || '',
      });
      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Could not initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  if (step === 'address') {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-500 text-sm mb-6">
          {address ? "We've pre-filled your last used address. Change it if needed." : "Enter your shipping details, then choose how you'd like to pay"}
        </p>
        <form onSubmit={handleAddressSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-500 outline-none"
              rows={3}
              placeholder="Full address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon (optional)</label>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition"
          >
            Proceed to Payment
          </button>
        </form>
      </div>
    );
  }

  if (step === 'method') {
    const canPlace = selectedMethod === 'cod' || (selectedMethod === 'manual' && selectedManualId);
    const showStripe = selectedMethod === 'stripe';

    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <button type="button" onClick={() => setStep('address')} className="text-sm text-amber-600 hover:underline mb-4">
          ← Back to address
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Payment Method</h1>
        <p className="text-gray-500 text-sm mb-6">Shipping to: {address}</p>

        <div className="space-y-3 mb-8">
          {/* Pay after delivery */}
          <button
            type="button"
            onClick={() => setSelectedMethod('cod')}
            className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition ${
              selectedMethod === 'cod' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-200'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <HiCash className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Pay after delivery</p>
              <p className="text-sm text-gray-500">Pay when your order arrives</p>
            </div>
            {selectedMethod === 'cod' && <HiOutlineCheck className="w-5 h-5 text-amber-500 ml-auto" />}
          </button>

          {/* Manual payment methods from admin */}
          {manualMethods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setSelectedMethod('manual');
                setSelectedManualId(m.id);
              }}
              className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition ${
                selectedMethod === 'manual' && selectedManualId === m.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-200'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                <HiCurrencyDollar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{m.cryptoName}</p>
                <p className="text-xs font-mono text-gray-500 truncate max-w-[200px]">{m.walletAddress}</p>
              </div>
              {selectedMethod === 'manual' && selectedManualId === m.id && <HiOutlineCheck className="w-5 h-5 text-amber-500 ml-auto" />}
            </button>
          ))}

          {/* Stripe (card) */}
          {stripeAvailable && (
            <button
              type="button"
              onClick={() => setSelectedMethod('stripe')}
              className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition ${
                selectedMethod === 'stripe' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-200'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <HiCreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Pay with card</p>
                <p className="text-sm text-gray-500">Credit / debit card</p>
              </div>
              {selectedMethod === 'stripe' && <HiOutlineCheck className="w-5 h-5 text-amber-500 ml-auto" />}
            </button>
          )}

          {manualMethods.length === 0 && !stripeAvailable && (
            <p className="text-sm text-gray-500 italic">No online payment methods configured. You can pay after delivery.</p>
          )}
        </div>

        {/* Show wallet/QR when manual selected */}
        {selectedMethod === 'manual' && selectedManualId && (
          <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
            {(() => {
              const m = manualMethods.find((x) => x.id === selectedManualId);
              if (!m) return null;
              const copyAddress = () => {
                navigator.clipboard.writeText(m.walletAddress);
                toast.success('Wallet address copied');
              };
              return (
                <div>
                  <p className="font-medium text-gray-900 mb-2">Send {m.cryptoName} to:</p>
                  {m.qrCodeUrl && (
                    <div className="mb-3 flex justify-center">
                      <img src={m.qrCodeUrl} alt="QR Code" className="w-32 h-32 object-contain bg-white p-2 rounded-lg border" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <p className="flex-1 font-mono text-sm bg-white p-3 rounded-lg break-all border border-gray-200">{m.walletAddress}</p>
                    <button
                      type="button"
                      onClick={copyAddress}
                      className="shrink-0 p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-gray-600 hover:text-amber-600 transition"
                      title="Copy wallet address"
                    >
                      <HiClipboardCopy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <div className="flex gap-3">
          {showStripe ? (
            <button
              type="button"
              onClick={handleProceedToStripe}
              disabled={loading}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-xl transition"
            >
              {loading ? 'Loading...' : 'Continue to card payment'}
            </button>
          ) : (
            <button
              type="button"
              onClick={selectedMethod === 'cod' ? handlePlaceOrderCOD : handlePlaceOrderManual}
              disabled={!canPlace || loading}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-xl transition"
            >
              {loading ? 'Placing order...' : 'Place order'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button type="button" onClick={() => setStep('method')} className="text-sm text-amber-600 hover:underline mb-4">
        ← Back to payment methods
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Card Payment</h1>
      <p className="text-sm text-gray-500 mb-4">Shipping to: {address}</p>
      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm shippingAddress={address} />
        </Elements>
      )}
    </div>
  );
}
