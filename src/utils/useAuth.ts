"use client";

import { useCallback, useEffect, useState } from "react";
import { DOMAIN } from "./shikiAPI";

const CLIENT_ID = process.env.NEXT_PUBLIC_SHIKIMORI_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_SHIKIMORI_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000/auth/callback";

interface ShikimoriUser {
  id: number;
  nickname: string;
  avatar: string;
  image: {
    x160: string;
    x148: string;
    x80: string;
    x64: string;
    x48: string;
    x32: string;
    x16: string;
  };
  last_online_at: string;
  url: string;
}

export function useAuth() {
  const [user, setUser] = useState<ShikimoriUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(() => {
    const authUrl = `${DOMAIN}/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=user_rates+comments+topics`;
    window.location.href = authUrl;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("shikimori_token");
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("shikimori_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${DOMAIN}/api/users/whoami`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((userData) => {
        setUser(userData);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        localStorage.removeItem("shikimori_token");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { user, loading, login, logout };
} 