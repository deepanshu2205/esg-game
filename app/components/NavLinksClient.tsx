"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NavLinksClient() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser((data as any)?.user ?? null);
      } catch (e) {
        setUser(null);
      }
    })();
  }, []);

  if (!user) {
    return (
      <div className="nav-links">
        <Link href="/login" className="text-sm">Login / Sign up</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <nav className="nav-links">
        <Link href="/dashboard" className="text-sm">Dashboard</Link>
        <Link href="/ai" className="text-sm">AI Advisor</Link>
      </nav>

      <button aria-label="Menu" className="mobile-menu btn btn-ghost" onClick={() => setOpen(!open)}>
        ☰
      </button>

      {open && (
        <div className="absolute right-4 top-14 bg-black/60 p-3 rounded-md shadow-lg z-50">
          <div className="flex flex-col gap-2">
            <Link href="/dashboard" className="text-sm">Dashboard</Link>
            <Link href="/ai" className="text-sm">AI Advisor</Link>
            <Link href="/login" className="text-sm">Account</Link>
          </div>
        </div>
      )}
    </div>
  );
}
