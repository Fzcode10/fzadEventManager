import { CalendarDays, ShieldCheck, UserCheck, Mail, ScanLine, Ticket, Sparkles, ArrowRight, CircleDashed } from "lucide-react";

const guideBlocks = [
  {
    icon: UserCheck,
    title: "Visitor journey",
    description:
      "Register for an event, wait for approval, and open your pass once the payment status becomes success.",
    points: ["Register with your email and event", "Track pending, approved, or rejected status", "Open your QR pass only after approval"],
  },
  {
    icon: ShieldCheck,
    title: "Host workflow",
    description:
      "Create events, review registrations, send invitations, and manage approvals from the host dashboard.",
    points: ["Create events with slots and details", "Send invites directly to attendees", "Approve or reject visitors based on availability"],
  },
  {
    icon: ScanLine,
    title: "Security check-in",
    description:
      "Security users can scan QR passes and verify whether a visitor is allowed to enter the venue.",
    points: ["Scan the visitor QR code", "Confirm event and registration data", "Allow fast entry without manual searching"],
  },
];

const quickTips = [
  "Use the same email for signup and event registration.",
  "Check the host approval status before generating a pass.",
  "Keep your profile updated so tickets stay easy to verify.",
  "Monitor remaining slots before approving visitors.",
];

export default function Features() {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
      <div className="absolute top-[-5%] left-[-8%] w-105 h-105 bg-violet-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[8%] right-[-8%] w-105 h-105 bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <section className="relative overflow-hidden rounded-4xl border border-slate-800/80 bg-slate-900/45 backdrop-blur-xl px-6 py-10 md:px-10 md:py-14 shadow-2xl shadow-black/20">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/40 to-transparent" />
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-[10px] font-black tracking-[0.2em] uppercase mb-5">
                <Sparkles size={10} /> System Guide
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] text-white">
                How Event Manager works across every role.
              </h1>
              <p className="mt-4 text-sm md:text-base leading-relaxed text-slate-400 max-w-2xl">
                This page explains the app flow for visitors, hosts, and security so each team knows what to do at every step.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
              {[
                ["Visitor", "Register and wait"],
                ["Host", "Approve and invite"],
                ["Security", "Scan QR pass"],
                ["Slots", "Track capacity"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 min-w-37.5">
                  <p className="text-[10px] font-black tracking-[0.22em] uppercase text-slate-500">{label}</p>
                  <p className="mt-1 text-sm font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {guideBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <article key={block.title} className="group rounded-[1.75rem] border border-slate-800/80 bg-slate-900/55 p-6 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/70 text-cyan-400">
                    <Icon size={22} />
                  </div>
                  <CircleDashed size={18} className="text-slate-700 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h2 className="text-xl font-extrabold text-white">{block.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{block.description}</p>
                <ul className="mt-5 space-y-3 text-sm text-slate-300">
                  {block.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <ArrowRight size={14} className="mt-1 shrink-0 text-cyan-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/55 p-6 md:p-8 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-300">
                <CalendarDays size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.22em] uppercase text-slate-500">Recommended flow</p>
                <h3 className="text-xl font-extrabold text-white">Typical event lifecycle</h3>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                "The host creates a new event with date, location, category, and slot count.",
                "Visitors register using the same email they used during signup.",
                "Hosts review visitors and update payment status to free, success, or rejected.",
                "Approved visitors open their QR pass, and security scans it at entry.",
              ].map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-black text-sm">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/55 p-6 md:p-8 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.22em] uppercase text-slate-500">Quick tips</p>
                <h3 className="text-xl font-extrabold text-white">Small rules that prevent issues</h3>
              </div>
            </div>

            <ul className="space-y-3">
              {quickTips.map((tip) => (
                <li key={tip} className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-300 leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100 leading-relaxed">
              If a visitor is rejected, the pass stays locked and the UI shows a clear rejected state instead of a QR button.
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}