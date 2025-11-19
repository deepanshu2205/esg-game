"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type NavItem = { href: string; label: string };

const AUTH_LINKS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/game", label: "Game" },
  { href: "/ai", label: "AI Advisor" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/scenarios", label: "Scenarios" },
];

const PUBLIC_LINKS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login / Sign up" },
];

export default function NavLinksClient() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser((data as any)?.user ?? null);
      } catch {
        setUser(null);
      }
    })();
  }, []);

  const links = user ? AUTH_LINKS : PUBLIC_LINKS;

  const closeMenu = () => setOpen(false);

  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("supabase signOut", err);
    }
    try {
      await fetch("/api/auth/clear-cookie", { method: "POST" });
    } catch (err) {
      console.error("failed to clear cookie", err);
    }
    setUser(null);
    setOpen(false);
    router.push("/login");
  }, [router]);

  return (
    <>
      <nav className="nav-links">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        aria-label="Open navigation menu"
        className="mobile-nav-toggle"
        onClick={() => setOpen(true)}
      >
        <span className="mobile-nav-toggle-bars" />
      </button>

      {open && (
        <div className="mobile-nav-panel">
          <div className="mobile-nav-panel-header">
            <div>
              <p className="mini-game-label">Navigation</p>
              <h4 className="mini-game-title">ESG Game</h4>
            </div>
            <button className="mobile-nav-close" onClick={closeMenu} aria-label="Close menu">
              ✕
            </button>
          </div>

          <div className="mobile-nav-panel-links">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeMenu}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mobile-nav-panel-footer">
            {user ? (
              <button onClick={handleSignOut} className="btn btn-ghost text-center">
                Sign out
              </button>
            ) : (
              <Link href="/login" onClick={closeMenu} className="btn btn-primary text-center">
                Login / Sign up
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
