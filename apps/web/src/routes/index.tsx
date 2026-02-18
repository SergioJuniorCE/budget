import { createFileRoute, Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const FEATURES = [
  {
    color: "bg-blue-500",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/20",
    label: "Needs · 50%",
    title: "50/30/20 Rule Built In",
    description:
      "Automatically allocate your income across needs, wants, and savings. No spreadsheets, no manual math.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    color: "bg-amber-500",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/20",
    label: "1ra · 2da Quincena",
    title: "Quincena Tracking",
    description:
      "Split your monthly expenses across your two pay periods. Always know what's due and when.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
  },
  {
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/20",
    label: "Charts · Progress",
    title: "Visual Overview",
    description:
      "See your spending at a glance with live progress bars, donut charts, and a real-time budget breakdown.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    number: "01",
    title: "Add your income",
    description: "Enter your income sources for the month.",
  },
  {
    number: "02",
    title: "Assign expenses",
    description: "Categorize each expense as a need, want, or saving.",
  },
  {
    number: "03",
    title: "See your breakdown",
    description: "Watch your 50/30/20 dashboard update in real time.",
  },
];

function HomeComponent() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 md:pt-28 md:pb-24 flex-1">
        <div className="flex items-center gap-2 mb-6 text-xs font-medium tracking-widest uppercase text-muted-foreground border rounded-full px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Personal budget tracker
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-3xl">
          Budget smarter with the <span className="text-blue-400">50</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-amber-400">30</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-emerald-400">20</span> rule
        </h1>

        <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-8">
          Track needs, wants, and savings across your quincena. Know exactly where your money goes —
          every month, every pay period.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/dashboard" className={cn(buttonVariants({ size: "lg" }), "px-8")}>
            Get Started
          </Link>
          <Link
            to="/dashboard"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }), "px-8")}
          >
            Sign In
          </Link>
        </div>

        {/* Mini budget bar preview */}
        <div className="mt-14 w-full max-w-md">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Needs</span>
            <span>Wants</span>
            <span>Savings</span>
          </div>
          <div className="flex h-2 w-full rounded-full overflow-hidden gap-0.5">
            <div className="bg-blue-500" style={{ flex: 50 }} />
            <div className="bg-amber-500" style={{ flex: 30 }} />
            <div className="bg-emerald-500" style={{ flex: 20 }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
            <span>50%</span>
            <span>30%</span>
            <span>20%</span>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-4 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl md:text-3xl font-semibold mb-2">
            Everything you need
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-10">
            Built around how you actually get paid and spend money.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <Card key={f.title} className={`border ${f.borderColor}`}>
                <CardContent className="pt-6 pb-6 space-y-3">
                  <div
                    className={`inline-flex items-center justify-center h-9 w-9 rounded-lg ${f.color}/10 ${f.textColor}`}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <span className={`text-xs font-medium tracking-wide uppercase ${f.textColor}`}>
                      {f.label}
                    </span>
                    <h3 className="text-sm font-semibold mt-0.5">{f.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-center text-2xl md:text-3xl font-semibold mb-2">How it works</h2>
          <p className="text-center text-muted-foreground text-sm mb-10">
            Up and running in under a minute.
          </p>
          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <div key={step.number} className="flex gap-5 items-start">
                <span className="text-2xl font-bold tabular-nums text-muted-foreground/30 leading-none mt-0.5 w-8 shrink-0">
                  {step.number}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {i < STEPS.length - 1 && (
                      <div className="absolute ml-[-1.85rem] mt-7 h-6 w-px bg-border" />
                    )}
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 py-16 bg-muted/30 border-t">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">Ready to take control?</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Start tracking your budget today. Free, personal, and always real-time.
          </p>
          <Link to="/dashboard" className={cn(buttonVariants({ size: "lg" }), "px-10")}>
            Go to Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
