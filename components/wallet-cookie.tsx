"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect } from "react";

export function WalletCookieSync() {
  const account = useCurrentAccount();
  useEffect(() => {
    if (account?.address) {
      document.cookie = `mf_wallet=1; path=/; max-age=${60 * 60 * 24 * 30}`;
    } else {
      // Clear cookie when disconnected
      document.cookie = `mf_wallet=; path=/; max-age=0`;
    }
  }, [account?.address]);
  return null;
}

