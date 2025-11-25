import Link from "next/link";

const featureCards = [
  {
    title: "Live ESG Scenarios",
    body: "Tackle carbon, profit and reputation trade-offs through guided mini-games and AI simulations.",
  },
  {
    title: "AI Advisor",
    body: "Run quick benchmark analysis or supplier vetting with guard‑railed OpenAI prompts.",
  },
  {
    title: "Team Leaderboards",
    body: "Track ESG scores across sessions and celebrate badge unlocks for top performers.",
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="hero-grid">
        <div className="card card-animated" style={{ background: "linear-gradient(140deg,#1b1f2a, #111624)" }}>
          <p className="text-sm uppercase tracking-[0.6em] text-white/60">Interactive learning</p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight mt-4">
            Make ESG decisions.
            <br />
            See the impact instantly.
          </h1>
          <p className="text-white/70 mt-4 max-w-2xl">
            AEGIS SME combines Supabase auth, real-time KPIs, and AI-powered simulations so your team can practice
            sustainability strategy in a safe sandbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link href="/login" className="btn btn-primary text-center">
              Get Started
            </Link>
            <Link href="/dashboard" className="btn btn-ghost text-center">
              View Dashboard
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-white/70">
            <div>
              <p className="text-3xl font-bold text-white">1.2k+</p>
              <p>Simulations run</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">98%</p>
              <p>Player satisfaction</p>
            </div>
          </div>
        </div>

        <div className="card card-animated">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Mobile-first</p>
              <h2 className="text-2xl font-semibold mt-2">Play anywhere</h2>
              <p className="text-white/70 mt-1">
                Responsive panels, touch-friendly controls, and concise summaries ensure sessions feel great on phones,
                tablets, and desktops.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-3xl font-bold text-white">5 min</p>
                <p className="text-sm text-white/70">Average round length</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-3xl font-bold text-accent">+24%</p>
                <p className="text-sm text-white/70">ESG literacy lift</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-grid">
        {featureCards.map((card) => (
          <div key={card.title} className="card card-animated">
            <h3 className="text-xl font-semibold">{card.title}</h3>
            <p className="text-white/70 mt-2">{card.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}