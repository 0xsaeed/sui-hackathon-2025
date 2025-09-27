import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SuiProviders } from "@/components/providers/sui";
import "@mysten/dapp-kit/dist/index.css";
import { WalletCookieSync } from "@/components/wallet-cookie";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Matryofund",
  description: "Sui Hackathon 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <SuiProviders>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <WalletCookieSync />
            {children}
          </ThemeProvider>
        </SuiProviders>
      </body>
    </html>
  );
}
