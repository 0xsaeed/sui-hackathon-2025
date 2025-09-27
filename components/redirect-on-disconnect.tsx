"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function RedirectOnDisconnect() {
  const account = useCurrentAccount();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Add a small delay to allow the wallet to properly connect/hydrate
    const timeoutId = setTimeout(() => {
      const hasWalletCookie = typeof document !== 'undefined' && document.cookie.includes('mf_wallet=1');

      // Only redirect if there's no wallet cookie and no active account
      // and we're on a dashboard page
      if (!hasWalletCookie && !account?.address && pathname.startsWith("/dashboard")) {
        router.replace("/");
      }
    }, 1000); // 1 second delay to allow wallet connection to stabilize

    return () => clearTimeout(timeoutId);
  }, [account?.address, pathname, router]);

  return null;
}
