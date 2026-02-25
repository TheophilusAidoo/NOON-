'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CheckoutForm({ shippingAddress }: { shippingAddress?: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
          receipt_email: undefined,
          payment_method_data: {
            billing_details: {
              address: { line1: shippingAddress || '' },
            },
          },
        },
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
      } else {
        toast.success('Order placed!');
        router.push('/orders');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-2 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
