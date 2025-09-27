"use client";
import Link from "next/link";
import Image from "next/image";
import { MobileMenu } from "./mobile-menu";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { WalletPill } from "@/components/wallet-pill";

export const Header = () => {
  const account = useCurrentAccount();
  return (
    <div className="fixed z-50 top-0 left-0 w-full pt-6 md:pt-8">
      <header className="container flex items-center justify-between rounded-xl border border-border/60 bg-black/60 px-4 py-3 text-white backdrop-blur supports-[backdrop-filter]:bg-black/50">
        <Link href="/">
          <span className="flex items-center gap-3 md:gap-4">
            <Image
              src="/applogo-white.svg"
              alt="Matryofund"
              width={48}
              height={48}
              className="w-10 h-10 md:w-12 md:h-12"
              priority
            />
            <span className="font-semibold text-xl md:text-2xl">Matryofund</span>
          </span>
        </Link>
        <nav className="flex max-lg:hidden absolute left-1/2 -translate-x-1/2 items-center justify-center gap-x-10">
          {["About", "Dashboard", "Projects"].map((item) => (
            <Link
              className="uppercase inline-block font-mono text-white/70 hover:text-white duration-150 transition-colors ease-out"
              href={`/${item.toLowerCase()}`}
              key={item}
            >
              {item}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          {account?.address ? (
            <WalletPill />
          ) : (
            <ConnectButton />
          )}
        </div>
        <MobileMenu />
      </header>
    </div>
  );
};
