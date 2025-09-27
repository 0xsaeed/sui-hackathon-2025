import type { Metadata } from "next";
import "../home.css";
import { Header } from "@/components/header";
import { RedirectOnConnect } from "@/components/redirect-on-connect";

export const metadata: Metadata = {
  title: "Matryofund",
  description: "Sui Hackathon 2025",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="home-scope">
      <RedirectOnConnect />
      <Header />
      {children}
    </div>
  );
}
