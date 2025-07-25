import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitRekt | Dangerously Simple Repository Management",
  description: "Manage your Git repositories without the handholding",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 bg-background">
              {children}
            </main>
            <Analytics />
          </div>
        </Providers>
      </body>
    </html>
  );
}
