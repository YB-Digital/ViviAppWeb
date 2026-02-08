"use client"

import { userAPI } from "@/lib/api";
import { useUserStore } from "@/store/userStore";
import { useEffect } from "react";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useUserStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userAPI.getMe();
        if (res) {
          setUser({
            id: res.id,
            name: res.fullName,
            email: res.email,
            role: res.role,
          });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    fetchUser();
  }, [setUser]);

  return <>{children}</>;
}