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
        if (res && res.data) {
          setUser({
            id: res.data.id,
            name: res.data.fullName,
            email: res.data.email,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      }
    };

    fetchUser();
  }, [setUser]);

  return <>{children}</>;
}