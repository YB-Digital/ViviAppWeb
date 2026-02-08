'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { useCourseStore } from '@/store/courseStore';
import { paymentAPI, getAuthToken } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const { addToPurchased } = useCourseStore();
  // useEffect bağımlılıkları için öneri
  // Eğer fetchCart fonksiyonu varsa ve kullanılacaksa, aşağıdaki gibi eklenmeli:
  // useEffect(() => { fetchCart(); }, [fetchCart]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);

    const token = getAuthToken();
    if (!token) {
      alert('Lütfen önce giriş yapın.');
      setLoading(false);
      return;
    }

    try {
      const amount = Math.round(subtotal * 100); 
      const currency = 'usd';
      const courseList = items.map((item) => item.id);
      // Yeni API: cartId zorunlu, token header ile gönderilmeli
      const cartId = new URLSearchParams(window.location.search).get('cartId');
      if (!cartId) {
        alert('CartId bulunamadı!');
        setLoading(false);
        return;
      }
      await paymentAPI.createPaymentIntent(cartId, { amount, currency, courseList }, token);

      items.forEach(item => {
        addToPurchased(item);
      });
      clearCart();
      setSuccess(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Payment error:', error.message, error.stack);
        // Network error veya fetch hatası
        if (error.message === 'Failed to fetch' || error.message === 'NetworkError when attempting to fetch resource.') {
          console.error('Network error: Sunucuya ulaşılamıyor veya CORS hatası olabilir.');
        }
        // API'dan dönen response varsa
        if (error && typeof error === 'object' && 'response' in error) {
          console.error('API response:', (error as { response?: unknown }).response);
        }
        alert(error.message || 'Payment failed. Lütfen giriş yaptığınızdan ve sepetinizde kurs olduğundan emin olun.');
      } else {
        try {
           console.error('Payment error (raw):', JSON.stringify(error));
        } catch {
           console.error('Payment error (unstringifiable):', error);
        }
        alert('Payment failed. Lütfen giriş yaptığınızdan ve sepetinizde kurs olduğundan emin olun.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col items-center justify-center px-4 py-16 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
            <CheckCircle size={32} className="text-green-500" />
          </div>

          <h2 className="text-gray-900 text-xl font-bold mb-2 text-center">
            Payment Successful!
          </h2>

          <p className="text-gray-500 text-sm text-center mb-6">
            Thank you for your purchase. You can now access your courses.
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button onClick={() => router.push('/my-courses')} fullWidth>
              Go to My Courses
            </Button>
            <button
              onClick={() => router.push('/')}
              className="text-primary text-sm hover:underline"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <p className="text-gray-500 text-center mb-4">Your cart is empty</p>
          <Button onClick={() => router.push('/courses')}>
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Back Link */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </Link>

        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard size={18} className="text-primary" />
                  <h2 className="text-gray-900 font-semibold">Payment Details</h2>
                </div>

                {/* Card Number */}
                <div className="mb-4">
                  <label className="text-gray-700 text-sm font-medium mb-1.5 block">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                    required
                  />
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-1.5 block">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                      maxLength={5}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-1.5 block">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      maxLength={3}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-1.5 block">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Security Note */}
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Lock size={14} className="text-green-600" />
                <span>Your payment information is secure and encrypted</span>
              </div>

              {/* Submit Button */}
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Processing...' : `Pay $${subtotal.toFixed(2)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 sticky top-24">
              <h2 className="text-gray-900 font-semibold text-base mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-gray-900 text-sm font-medium truncate">{item.title}</p>
                      <p className="text-gray-500 text-xs">{item.author}</p>
                      {/* Next.js Image önerisi: */}
                      {/* <Image src={item.imagePath} alt={item.title} width={64} height={64} className="w-16 h-16 rounded-lg object-cover" /> */}
                      {item.imagePath && (
                        <img src={item.imagePath} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                      )}
                    </div>
                    <span className="text-gray-900 text-sm font-medium">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 text-sm">Subtotal</span>
                  <span className="text-gray-900 text-sm">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">Total</span>
                  <span className="text-gray-900 text-lg font-bold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

