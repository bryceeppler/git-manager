import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Git Manager - Repository Management Tool",
  description: "Manage and cleanup your local Git repositories with ease",
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
          </div>
        </Providers>
      </body>
    </html>
  );
}
