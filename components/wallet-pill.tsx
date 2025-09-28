"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useDisconnectWallet } from "@mysten/dapp-kit";
import Image from "next/image";

export function WalletPill({ className = "" }: { className?: string }) {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  if (!account?.address) return null;
  const short = `${account.address.slice(0, 6)}...${account.address.slice(-4)}`;

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          className={`inline-flex items-center gap-2 rounded-md border border-border/60 px-3 py-1.5 text-sm ${className}`}
        >
          <Image src="/sui-logo-black.svg" alt="SUI" width={16} height={16} className="block dark:hidden opacity-100" />
          <Image src="/sui-logo-white.svg" alt="SUI" width={16} height={16} className="hidden dark:block opacity-100" />
          <span className="font-mono">{short}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          className="z-50 rounded-md border border-border/60 bg-black px-5 py-2 shadow-md"
        >
          <DropdownMenu.Item
            className="cursor-pointer select-none rounded-sm px-3 py-2 text-sm hover:bg-muted focus:bg-muted outline-none"
            onSelect={() => navigator.clipboard.writeText(account.address)}
          >
            Copy address
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            className="cursor-pointer select-none rounded-sm px-3 py-2 text-sm text-red-600 hover:bg-muted focus:bg-muted outline-none"
            onSelect={() => disconnect()}
          >
            Disconnect
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
