import { createFileRoute, Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_landing/")({
  component: HomeComponent,
});

const FEATURES = [
  {
    label: "Needs",
    pct: "50%",
    color: "bg-needs",
    textColor: "text-needs",
    title: "50/30/20 built in",
    description:
      "Automatically allocate income across needs, wants, and savings. No spreadsheets, no manual math.",
  },
  {
    label: "Quincenas",
    pct: "1ra / 2da",
    color: "bg-wants",
    textColor: "text-wants",
    title: "Quincena tracking",
    description: "Split expenses across your two pay periods. Always know what's due and when.",
  },
  {
    label: "Visual",
    pct: "Live",
    color: "bg-savings",
    textColor: "text-savings",
    title: "Real-time breakdown",
    description: "Progress bars, donut charts, and budget stats that update as you add entries.",
  },
];

function HomeComponent() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-16 pb-12 md:pt-24 md:pb-16">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 max-w-3xl leading-tight">
          Know where your money goes{" "}
          <span className="text-muted-foreground font-normal">
            with the <span className="text-needs font-semibold">50</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-wants font-semibold">30</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-savings font-semibold">20</span> rule
          </span>
        </h1>

        <p className="text-sm md:text-base text-muted-foreground max-w-lg mb-8 leading-relaxed">
          Track needs, wants, and savings across your quincena. See exactly where your money goes
          every month, every pay period.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/dashboard" className={cn(buttonVariants({ size: "lg" }), "px-8")}>
            Get started
          </Link>
          <Link
            to="/sign-in"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }), "px-8")}
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Budget bar showcase */}
      <section className="px-4 pb-16 md:pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-xl shadow-sm p-6 md:p-8">
            {/* Mock income header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Monthly income
                </p>
                <p className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums mt-0.5">
                  $25,000.00
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Remaining
                </p>
                <p className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums text-savings mt-0.5">
                  $7,500.00
                </p>
              </div>
            </div>

            {/* Large budget bar */}
            <div className="space-y-1 mb-6">
              <div className="flex h-4 w-full rounded-full overflow-hidden gap-1">
                <div className="bg-needs rounded-l-full" style={{ flex: 50 }} />
                <div className="bg-wants" style={{ flex: 30 }} />
                <div className="bg-savings rounded-r-full" style={{ flex: 20 }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-needs" />
                  <span>Needs</span>
                  <span className="tabular-nums font-medium text-foreground">$12,500</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-wants" />
                  <span>Wants</span>
                  <span className="tabular-nums font-medium text-foreground">$7,500</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-savings" />
                  <span>Savings</span>
                  <span className="tabular-nums font-medium text-foreground">$5,000</span>
                </div>
              </div>
            </div>

            {/* Mock category rows */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Needs", items: ["Renta", "Groceries", "Transport"], color: "text-needs" },
                {
                  label: "Wants",
                  items: ["Dining out", "Streaming", "Shopping"],
                  color: "text-wants",
                },
                {
                  label: "Savings",
                  items: ["Emergency fund", "Investments"],
                  color: "text-savings",
                },
              ].map((cat) => (
                <div key={cat.label} className="space-y-1.5">
                  <p className={cn("text-xs font-semibold", cat.color)}>{cat.label}</p>
                  {cat.items.map((item) => (
                    <div key={item} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground truncate">{item}</span>
                      <span className="text-muted-foreground/60 tabular-nums ml-2">$—</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 bg-muted/30 border-y">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-xl md:text-2xl font-semibold tracking-tight mb-2">
            Built around how you actually get paid
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-10">
            No spreadsheets, no manual math, no guesswork.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={cn("inline-block h-2 w-2 rounded-full", f.color)} />
                  <span
                    className={cn("text-xs font-semibold uppercase tracking-wider", f.textColor)}
                  >
                    {f.label}
                  </span>
                </div>
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 py-16">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-3">
            Take control of your budget
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Free, personal, and updates in real time.
          </p>
          <Link to="/dashboard" className={cn(buttonVariants({ size: "lg" }), "px-10")}>
            Open dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
