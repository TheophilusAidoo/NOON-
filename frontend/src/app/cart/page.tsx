'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useFormatPrice } from '@/hooks/useFormatPrice';
import { fetchCart, updateCartItem, removeFromCart } from '@/store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function CartPage() {
  const formatPrice = useFormatPrice();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { items, total } = useAppSelector((s) => s.cart);

  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [user, dispatch]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-600">Please login to view your cart.</p>
        <Link href="/login" className="text-amber-600 mt-2 inline-block">Login</Link>
      </div>
    );
  }

  const handleUpdate = async (itemId: string, quantity: number) => {
    try {
      await dispatch(updateCartItem({ itemId, quantity })).unwrap();
      dispatch(fetchCart());
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') ? (err as { message: string }).message : 'Failed';
      toast.error(msg);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      dispatch(fetchCart());
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') ? (err as { message: string }).message : 'Failed';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div>
          <p className="text-gray-600">Your cart is empty.</p>
          <Link href="/products" className="text-amber-600 mt-2 inline-block">Continue Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 bg-white rounded-lg shadow"
            >
              <div className="w-24 h-24 relative shrink-0 bg-gray-100 rounded">
                {item.product.images?.[0]?.imageUrl ? (
                  <Image
                    src={item.product.images[0].imageUrl}
                    alt={item.product.title}
                    fill
                    className="object-cover rounded"
                    unoptimized={item.product.images[0].imageUrl.startsWith('/api/')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No img</div>
                )}
              </div>
              <div className="flex-1">
                <Link href={`/products/${item.productId}`} className="font-medium hover:text-amber-600">
                  {item.product.title}
                </Link>
                <p className="text-amber-600 font-bold">{formatPrice(item.effectivePrice)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => handleUpdate(item.id, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 border rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity + 1)}
                    className="w-8 h-8 border rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-500 text-sm ml-4"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="font-bold">{formatPrice(item.subtotal)}</div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-xl font-bold">Total: {formatPrice(total)}</span>
            <Link
              href="/checkout"
              className="px-6 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
