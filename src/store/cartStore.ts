import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Course } from '@/types';
import { cartAPI } from '@/lib/api';

interface CartState {
  items: Course[];
  subtotal: number;
  cartId: string | null;
  loading: boolean;
  error: string | null;
  addToCart: (course: Course) => Promise<void>;
  removeFromCart: (courseId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (courseId: string) => boolean;
  fetchCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      cartId: null,
      loading: false,
      error: null,

      fetchCart: async () => {
        set({ loading: true, error: null });
        try {
          const res = await cartAPI.getMyActiveCart();
          console.log(res)
          if (res && Array.isArray(res.items) && typeof res.subtotal === 'number' && typeof res.id === 'string') {
            set({ items: res.items, subtotal: res.subtotal, cartId: res.id });
          } else {
            set({ items: [], subtotal: 0, cartId: null });
          }
        } catch (e: any) {
          set({ error: e.message || 'Sepet getirilemedi!' });
        } finally {
          set({ loading: false });
        }
      },

      addToCart: async (course) => {
        set({ loading: true, error: null });
        try {
          let cartId = get().cartId;
          if (!cartId) {
            // Sepet yoksa oluştur
            const res = await cartAPI.createCart(course.price, [course.id]);
            if (res && typeof res.id === 'string') {
              cartId = res.id;
              set({ cartId });
            }
            await get().fetchCart();
            return;
          }
          // Sepete ekle
          await cartAPI.addToCart(course.id);
          await get().fetchCart();
        } catch (e: any) {
          console.error('[Cart] addToCart error:', e);
          set({ error: e.message || 'Sepet oluşturulamadı!' });
        } finally {
          set({ loading: false });
        }
      },

      removeFromCart: async (courseId) => {
        // Yeni API'da remove fonksiyonu yok, sadece fetchCart ile güncellenebilir veya eklenirse burada kullanılabilir.
        set({ error: 'Kurs sepetten çıkarma API fonksiyonu backendde yok!' });
      },

      clearCart: async () => {
        set({ items: [], subtotal: 0, cartId: null });
      },

      isInCart: (courseId) => get().items.some((item) => item.id === courseId),
    }),
    {
      name: 'vivi-cart-storage',
    }
  )
);

