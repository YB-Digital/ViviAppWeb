"use client";

import { useCartStore } from "@/store/cartStore";
import { useEffect } from "react";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return <>{children}</>;
}
