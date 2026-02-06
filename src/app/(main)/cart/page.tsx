'use client';

import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useCartStore } from '@/store/cartStore';
import { cartAPI } from '@/lib/api';

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, removeFromCart } = useCartStore();

  const handleCheckout = async () => {
    try {
      const courseList = items.map((item) => item.id);
      const amount = subtotal;
      const cart = await cartAPI.createCart(courseList, amount);
      if (cart && cart.id) {
        router.push(`/checkout?cartId=${cart.id}`);
      } else {
        alert('Sepet oluşturulamadı!');
      }
    } catch (err) {
      alert('Sepet oluşturulurken hata oluştu!');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart size={48} />}
            title="Your cart is empty"
            description="Add some courses to your cart to get started!"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4"
                >
                  {/* Course Image */}
                  <div className="w-20 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    {item.imagePath ? (
                      <img src={item.imagePath} alt={item.title} className="w-full h-full object-cover rounded" />
                    ) : (
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-medium text-sm truncate">{item.title}</h3>
                    <p className="text-gray-500 text-xs">{item.trainerName}</p>
                    <p className="text-primary font-semibold text-sm mt-1">${item.price.toFixed(2)}</p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 sticky top-24">
                <h2 className="text-gray-900 font-semibold text-base mb-4">Order Summary</h2>
                
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <span className="text-gray-600 text-sm">Subtotal ({items.length} items)</span>
                  <span className="text-gray-900 font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-900 font-medium">Total</span>
                  <span className="text-gray-900 text-xl font-bold">${subtotal.toFixed(2)}</span>
                </div>

                <Button fullWidth onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

