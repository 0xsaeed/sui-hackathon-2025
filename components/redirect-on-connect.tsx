"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function RedirectOnConnect() {
  const account = useCurrentAccount();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
  }, [account?.address, pathname, router]);

  return null;
}

