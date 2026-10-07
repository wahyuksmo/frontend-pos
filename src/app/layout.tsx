import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Preloader } from "@/components/layout/Preloader";

export const metadata: Metadata = {
  title: "Admin Starter Kit - Velzon Galaxy Rebrand",
  description: "Modern Admin Dashboard Starter Kit with Next.js App Router, Tailwind CSS, and Mint Teal Rebranding",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Preloader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
