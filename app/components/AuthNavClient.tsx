"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

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
    return <Link href="/login">Login</Link>;
  }

  return (
    <div className="flex items-center gap-3">
      <span>{user.email}</span>
      <button onClick={signOut} className="underline">Sign out</button>
    </div>
  );
}
