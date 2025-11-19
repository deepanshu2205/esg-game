"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

function initialsFromEmail(email?: string | null) {
  if (!email) return "U";
  const [name] = email.split("@");
  const parts = name.split(/[.\-_]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function AuthNavClient() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser((data as any).user ?? null);
      } catch (e) {
        console.error("supabase getUser error", e);
      }
    })();
  }, []);

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("supabase signOut error", e);
    }
    try {
      await fetch("/api/auth/clear-cookie", { method: "POST" });
    } catch (err) {
      console.error("failed to clear cookie", err);
    }
    router.push("/login");
  }

  if (!mounted) return null;

  if (!user) {
    return (
      <Link href="/login" className="btn btn-ghost text-sm">
        Login
      </Link>
    );
  }

  const initials = initialsFromEmail(user.email);

  return (
    <div className="auth-chip">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
        {initials}
      </span>
      <div className="hidden sm:flex flex-col leading-tight">
        <span className="text-xs text-white/60">Signed in</span>
        <span className="text-sm font-medium max-w-[140px] truncate">{user.email}</span>
      </div>
      <button onClick={signOut} className="btn btn-ghost text-xs px-3 py-1 whitespace-nowrap">
        Sign out
      </button>
    </div>
  );
}

