import { ArrowRight, Check, CircleDollarSign, ListChecks } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_landing/")({
  component: HomeComponent,
});

const ALLOCATIONS = [
  { label: "Needs", ratio: "50%", amount: "$12,500", className: "bg-needs", width: "50%" },
  { label: "Wants", ratio: "30%", amount: "$7,500", className: "bg-wants", width: "30%" },
  { label: "Savings", ratio: "20%", amount: "$5,000", className: "bg-savings", width: "20%" },
] as const;

const PAYDAY_POINTS = [
  "Split every expense between the first and second quincena.",
  "Check off payments without losing the monthly view.",
  "See what remains before the next payday arrives.",
] as const;

function HomeComponent() {
  return (
    <div className="overflow-hidden">
      <section className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:py-16 lg:gap-20 lg:px-8">
        <div className="landing-reveal max-w-xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            A budget for both paydays
          </p>
          <h1 className="font-display text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
            Your money, clear by payday.
          </h1>
          <p className="mt-6 max-w-[34rem] text-base leading-relaxed text-muted-foreground sm:text-lg">
            Plan each quincena, keep the 50/30/20 rule visible, and know what is truly left.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard"
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-sm")}
            >
              Start budgeting
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              to="/sign-in"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-5 text-sm",
              )}
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="landing-image-reveal relative md:justify-self-end">
          <div className="absolute -left-5 bottom-10 hidden w-40 rounded-lg border border-border/70 bg-card/95 p-4 shadow-lg backdrop-blur md:block lg:-left-10">
            <p className="text-xs text-muted-foreground">Monthly view</p>
            <p className="mt-1 font-display text-2xl font-semibold tracking-tight">One plan</p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Two paydays, kept in context.
            </p>
          </div>
          <img
            src="/images/budget-ritual.webp"
            alt="Notebook, calculator, receipts, and pencil arranged for a monthly budget review"
            width={1122}
            height={1402}
            fetchPriority="high"
            className="h-[36dvh] min-h-64 w-full rounded-lg object-cover shadow-[0_28px_80px_oklch(0.16_0.02_70/0.18)] md:aspect-[4/5] md:h-auto md:max-h-[74dvh] md:max-w-[34rem]"
          />
        </div>
      </section>

      <section className="border-y border-border/70 bg-card/45 px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div className="max-w-md">
            <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
              A useful rule, already worked out.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Enter your income once. Better Track keeps the recommended split visible while you
              plan the month.
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-background p-5 shadow-sm sm:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Example monthly income</p>
                <p className="mt-1 font-display text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                  $25,000 MXN
                </p>
              </div>
              <CircleDollarSign className="size-7 text-primary" aria-hidden="true" />
            </div>
            <div
              className="mt-8 flex h-3 overflow-hidden rounded-full"
              aria-label="50 percent needs, 30 percent wants, 20 percent savings"
            >
              {ALLOCATIONS.map((item) => (
                <span key={item.label} className={item.className} style={{ width: item.width }} />
              ))}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {ALLOCATIONS.map((item) => (
                <div
                  key={item.label}
                  className="border-l-2 border-border pl-3 first:border-needs sm:[&:nth-child(2)]:border-wants sm:[&:nth-child(3)]:border-savings"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {item.ratio}
                    </span>
                  </div>
                  <p className="mt-1 text-sm tabular-nums text-muted-foreground">{item.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-[1.08fr_0.92fr] md:items-center lg:px-8 lg:py-28">
        <img
          src="/images/two-paydays.webp"
          alt="Two green folders, receipts, and a monthly calendar arranged for two pay periods"
          width={1536}
          height={1024}
          loading="lazy"
          className="aspect-[3/2] w-full rounded-lg object-cover shadow-[0_24px_70px_oklch(0.16_0.02_70/0.16)]"
        />
        <div className="max-w-lg md:pl-6">
          <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            The month, in two calmer halves.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Organize due dates around the way you are paid without losing sight of the full month.
          </p>
          <ul className="mt-8 space-y-5">
            {PAYDAY_POINTS.map((point) => (
              <li key={point} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-primary px-4 py-16 text-primary-foreground sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            <ListChecks className="mb-6 size-8 opacity-75" aria-hidden="true" />
            <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
              Make the next payday feel expected.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/75">
              Build a plan you can update in minutes, then return to whenever money moves.
            </p>
          </div>
          <Link
            to="/dashboard"
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "h-11 w-fit bg-background px-5 text-sm text-foreground hover:bg-background/90",
            )}
          >
            Start budgeting
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
