import "./globals.css";
import Link from "next/link";
import AuthNavClient from "./components/AuthNavClient";
import NavLinksClient from "./components/NavLinksClient";
import type { ReactNode } from "react";

export const metadata = {
  title: "AEGIS SME",
  description: "Minimal ESG training game with Supabase + Next.js + OpenAI"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <nav className="app-nav">
            <div className="container topbar">
              <div>
                <Link href="/" className="brand">
                  AGEIS SME GAME
                  <span className="brand-subtitle">Learn & act on ESG scenarios</span>
                </Link>
              </div>
              <div className="nav-links">
                <NavLinksClient />
              </div>
              <div className="text-sm">
                <AuthNavClient />
              </div>
            </div>
          </nav>

          <main className="container content-area">{children}</main>

          <footer className="footer">
            <div className="container">
              Built with love at SGT University · ESG Game © {new Date().getFullYear()}
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
