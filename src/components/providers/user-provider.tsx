"use client"

import { userAPI } from "@/lib/api";
import { useUserStore } from "@/store/userStore";
import { useEffect } from "react";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useUserStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userAPI.getUser();
setUser({
          id: res.id,
          name: res.fullName,
          email: res.email,
        });
      } catch (error) {
        setUser(null);
      }
    };

    fetchUser();
  }, [setUser]);

  return <>{children}</>;
}