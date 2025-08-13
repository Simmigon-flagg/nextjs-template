// app/AutoLogoutWatcher.js
"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export default function AutoLogoutWatcher() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.expires) return;

    const expiryTime = new Date(session.expires).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    if (timeUntilExpiry <= 0) {
      signOut();
      return;
    }

    // Timer to sign out at exact expiration
    const logoutTimer = setTimeout(() => {
      signOut({ callbackUrl: "/login" });
    }, timeUntilExpiry);

    return () => clearTimeout(logoutTimer);
  }, [session]);

  return null;
}
