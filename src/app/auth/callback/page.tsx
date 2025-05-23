"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DOMAIN } from "@/utils/shikiAPI";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      router.push("/");
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_SHIKIMORI_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_SHIKIMORI_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000/auth/callback";

    fetch(`${DOMAIN}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.access_token) {
          localStorage.setItem("shikimori_token", data.access_token);
          router.push("/");
        } else {
          throw new Error("Failed to get access token");
        }
      })
      .catch((error) => {
        console.error("Error during authentication:", error);
        router.push("/");
      });
  }, [code, router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Authenticating...</p>
    </div>
  );
} 