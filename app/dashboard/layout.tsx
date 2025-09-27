import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "../dashboard.css";
import { RedirectOnDisconnect } from "@/components/redirect-on-disconnect";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard for analytics and management",
  generator: 'v0.app'
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`dashboard-scope ${geistMono.variable} antialiased`}>
      <RedirectOnDisconnect />
      {children}
    </div>
  );
}
