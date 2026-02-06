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
        const cartId = get().cartId;
        if (!cartId) return;
        set({ loading: true, error: null });
        try {
          const res = await cartAPI.getCart(cartId, get().subtotal);
          console.log('[Cart] fetchCart API response:', res);
          // Burada backend'den dönen cart içeriğine göre state güncellenir
          set({ items: res.cart.items || [], subtotal: res.cart.subtotal || 0 });
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
          let items = get().items;
          let subtotal = get().subtotal;
          console.log('[Cart] addToCart called. cartId:', cartId, 'courseId:', course.id);
          // Eğer sepet yoksa önce oluştur
          if (!cartId) {
            const res = await cartAPI.createCart([course.id], course.price);
            cartId = res.cartId;
            set({ cartId });
            console.log('[Cart] Cart created. cartId:', cartId, 'API response:', res);
            // Sepeti backend'den çek
            await get().fetchCart();
            return;
          }
          // Sepete ekle
          const addRes = await cartAPI.addToCart(cartId, [course.id]);
          console.log('[Cart] addToCart API response:', addRes);
          // Sepeti backend'den çek
          await get().fetchCart();
        } catch (e: any) {
          console.error('[Cart] addToCart error:', e);
          set({ error: e.message || 'Sepet oluşturulamadı!' });
        } finally {
          set({ loading: false });
        }
      },

      removeFromCart: async (courseId) => {
        const cartId = get().cartId;
        set({ loading: true, error: null });
        try {
          if (cartId) {
            await cartAPI.removeFromCart(cartId, courseId);
            await get().fetchCart();
          }
        } catch (e: any) {
          set({ error: e.message || 'Sepetten çıkarılamadı!' });
        } finally {
          set({ loading: false });
        }
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

