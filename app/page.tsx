import Link from "next/link";


export default function Home() {
return (
<div className="space-y-6">
<h1 className="text-3xl font-bold">ESG Game — Minimal Full</h1>
<p className="text-white/80">
Learn ESG by making small operational choices. This template uses Supabase for Auth & DB and OpenAI for the advisor.
</p>


<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<Link href="/login" className="card">Login / Sign up</Link>
</div>
</div>
);
}