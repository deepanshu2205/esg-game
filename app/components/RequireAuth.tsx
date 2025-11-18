"use client";

import { useEffect, useState, PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RequireAuth({ children }: PropsWithChildren) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = (data as any)?.user ?? null;
        if (!user) {
          router.push("/login");
        }
      } catch (e) {
        router.push("/login");
      } finally {
        setChecking(false);
      }
    })();
  }, [router]);

  if (checking) return null;
  return <>{children}</>;
}
