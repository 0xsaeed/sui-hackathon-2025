"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function RedirectOnConnect() {
  const account = useCurrentAccount();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Disable auto-redirect to allow users to visit home page even when connected
    // if (account?.address && pathname === "/") {
    //   router.push("/dashboard");
    // }
  }, [account?.address, pathname, router]);

  return null;
}

