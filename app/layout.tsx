import "@mysten/dapp-kit/dist/index.css";
import "@/app/globals.css";
import { Providers } from "../components/providers/sui";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sui dApp Starter</title>
      </head>
      <body>
            <div className="bg-slate-50 min-h-screen">
        <Providers>
          <Navbar />
          {children}
          </Providers>
          </div>
      </body>
    </html>
  );
}
