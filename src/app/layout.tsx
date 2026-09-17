import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "./StoreProvider";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Siheyuan Project OS",
  description:
    "Sistema vivo para proteger e realizar a intenção arquitetônica da cidadela doméstica siheyuan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-mineral-50 text-mineral-800 antialiased">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
