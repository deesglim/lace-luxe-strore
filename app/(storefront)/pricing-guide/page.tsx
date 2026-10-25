import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import BuyPricingGuideButton from "@/components/pricingGuide/BuyPricingGuideButton";
import SaleCountdown from "@/components/pricingGuide/SaleCountdown";
import { getCurrentProfile } from "@/lib/auth";
import {
  PRICING_GUIDE_USER_GUIDE_PDF,
  getPricingGuidePricing,
  hasPricingGuideAccess,
  type PricingGuidePricing,
} from "@/lib/pricingGuide";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hair Service Pricing Guide | Deesglim",
  description:
    "Stop guessing your prices. See what every hair service really costs you, the price to charge, and what to pay your staff.",
};

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const primaryBtn =
  "inline-block rounded-md bg-espresso px-8 py-4 text-center font-sans text-sm uppercase tracking-[0.2em] text-ivory transition hover:bg-espresso/90";
const secondaryBtn =
  "inline-block rounded-md border border-espresso px-8 py-4 text-center font-sans text-sm uppercase tracking-[0.2em] text-espresso transition hover:bg-espresso hover:text-ivory";

type BuyState = { signedIn: boolean; owned: boolean; pricing: PricingGuidePricing };

function PriceTag({ pricing, dark = false }: { pricing: PricingGuidePricing; dark?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline gap-3">
      {pricing.onSale && (
        <span className={`font-sans text-lg line-through ${dark ? "text-ivory/60" : "text-charcoal/50"}`}>
          {naira(pricing.regularPrice)}
        </span>
      )}
      <span className={`font-heading text-4xl ${dark ? "text-ivory" : "text-espresso"}`}>
        {naira(pricing.currentPrice)}
      </span>
      {pricing.onSale && (
        <span className="bg-bronze px-2 py-1 font-sans text-xs uppercase tracking-[0.15em] text-ivory">
          Launch price
        </span>
      )}
    </div>
  );
}

function BuyActions({ state, label = "Get the guide" }: { state: BuyState; label?: string }) {
  if (state.owned) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <a href="/pricing-guide/calculator" className={primaryBtn}>Open your calculator</a>
        <a href={PRICING_GUIDE_USER_GUIDE_PDF} className={secondaryBtn}>Download the user guide</a>
      </div>
    );
  }
  if (state.signedIn) {
    return <BuyPricingGuideButton label={`${label} · ${naira(state.pricing.currentPrice)}`} />;
  }
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link href="/signup?redirect=/pricing-guide" className={primaryBtn}>
        {label} · {naira(state.pricing.currentPrice)}
      </Link>
      <Link href="/login?redirect=/pricing-guide" className={secondaryBtn}>
        I have an account
      </Link>
    </div>
  );
}

function OfferBox({ state }: { state: BuyState }) {
  const { pricing } = state;
  return (
    <div className="flex flex-col gap-5 border border-blush bg-white/60 p-6 sm:p-8">
      {state.owned ? (
        <p className="font-heading text-2xl text-espresso">You own this guide</p>
      ) : (
        <>
          <PriceTag pricing={pricing} />
          {pricing.onSale && (
            <div className="flex flex-col gap-2">
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-bronze">
                Launch price ends in
              </p>
              <SaleCountdown endsAt={pricing.saleEndsAt} />
            </div>
          )}
          <p className="font-sans text-sm text-charcoal/70">
            One-time payment. No subscription. Use it on up to two devices.
          </p>
        </>
      )}
      <BuyActions state={state} />
    </div>
  );
}

function Section({ children, tint = false }: { children: ReactNode; tint?: boolean }) {
  return (
    <section className={`px-6 py-16 sm:py-20 ${tint ? "bg-blush/25" : "bg-ivory"}`}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">{children}</div>
    </section>
  );
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="font-heading text-3xl text-espresso sm:text-4xl">{children}</h2>;
}

function P({ children }: { children: ReactNode }) {
  return <p className="font-sans text-base leading-relaxed text-charcoal/85">{children}</p>;
}

const problems = [
  "You copied someone else's price list, but their rent, staff and costs are not yours.",
  "You “added small on top” of what you spend, but forgot the shampoo, the thread, the packaging and the fuel.",
  "You don't know how much commission you can really pay your workers without eating into your profit.",
  "You run promos without knowing if the discount is taking all your profit.",
];

const features: [string, string][] = [
  ["What every job really costs you", "Lace, thread, products, wig caps, packaging, even the wear on your tools. Listed once, worked out per job automatically."],
  ["Your share of the monthly bills", "Rent, light, fuel, data, salaries and marketing, shared fairly across every service you offer."],
  ["The lowest price you should charge", "For every size and every length. If your price is too low, you'll see it straight away."],
  ["What to pay your workers", "Already have a commission in mind? It tells you whether you can afford it. Not sure? It suggests one that keeps your profit safe."],
  ["Your profit on every service, in colour", "Green: you're making your target. Orange: making money, but not enough. Red: you're losing money on that job."],
  ["What a discount really costs you", "See your profit before and after any promo, so you only discount the services that can take it."],
  ["Your whole month at a glance", "Sales, staff pay and profit for each service and for your whole business."],
];

const services = ["Ventilation", "Wigmaking", "Revamping", "Installation", "Styling", "Layering", "Colouring", "Braiding"];

const steps: [string, string][] = [
  ["Add your monthly bills", "Rent, light, fuel, salaries, marketing."],
  ["Add your services", "What each job uses up, your sizes or lengths, and your prices."],
  ["See your numbers", "Your real profit, the right price, the right commission and safe discounts, worked out as you type."],
];

const example: [string, string][] = [
  ["Price", "₦30,000"],
  ["Materials (thread, needles, elastic band, cap, packaging)", "− ₦2,200"],
  ["Staff commission (20%)", "− ₦6,000"],
  ["Share of monthly bills", "− ₦4,777"],
];

const forYou = [
  "You offer hair services and want to know you're actually making money",
  "You pay staff per job and aren't sure what's fair, or affordable",
  "You're starting out and don't want to copy someone else's prices",
  "You want to run promos without running at a loss",
  "You're adding a new service and need to price it right from day one",
];

const included = [
  "The Hair Service Pricing Guide calculator, on your phone or laptop",
  "A 7-page step-by-step user guide (PDF), with a full worked example",
  "Use it on up to two devices",
  "Come back and update it any time your costs change",
];

const faqs: [string, string][] = [
  ["Do I need to be good with numbers?", "No. You type in what you spend and what you charge. The guide does all the calculations and shows the results in green, orange or red."],
  ["I only do one service. Will it work for me?", "Yes. Keep only the services you offer and remove the rest."],
  ["Does it tell me what to charge?", "It tells you the lowest price you should charge to cover your costs and keep the profit you want. You decide your final price from there."],
  ["Can I use it on my phone?", "Yes, it's made for your phone. You can use it on up to two devices."],
  ["Is this a monthly subscription?", "No. You pay once."],
  ["I pay my staff a fixed amount, not a percentage.", "That works. The guide shows you how to turn a fixed amount into a percentage in seconds."],
];

export default async function PricingGuidePage() {
  const { user } = await getCurrentProfile();
  const owned = user ? await hasPricingGuideAccess(user.id) : false;
  const pricing = getPricingGuidePricing();
  const state: BuyState = { signedIn: Boolean(user), owned, pricing };

  return (
    <main className="flex flex-1 flex-col bg-ivory">
      {/* Hero */}
      <section className="bg-espresso px-6 pb-16 pt-24 sm:pb-20 sm:pt-28">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-blush">
            For ventilators, wigmakers, stylists and every hair business
          </span>
          <h1 className="font-heading text-4xl leading-tight text-ivory sm:text-5xl">
            Stop guessing your prices. Start keeping your profit.
          </h1>
          <p className="font-sans text-base leading-relaxed text-ivory/80 sm:text-lg">
            The Hair Service Pricing Guide shows you exactly what every job costs you and the price
            you should be charging, so every service pays your staff, covers your bills and still
            leaves money in your pocket.
          </p>
          {!owned && <PriceTag pricing={pricing} dark />}
          {!owned && pricing.onSale && (
            <div className="flex flex-col gap-2">
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-blush">Launch price ends in</p>
              <SaleCountdown endsAt={pricing.saleEndsAt} tone="dark" />
            </div>
          )}
          <div className="[&_a]:border-ivory [&_a]:bg-ivory [&_a]:text-espresso [&_button]:bg-ivory [&_button]:text-espresso">
            <BuyActions state={state} />
          </div>
        </div>
      </section>

      <Section>
        <H2>You&apos;re busy. So why does the money never add up?</H2>
        <P>
          Your phone doesn&apos;t stop. Customers are sending hair for ventilation, wigmaking,
          revamps, installs. Your staff are working, the generator is running, and you&apos;re
          working late every night.
        </P>
        <P>
          Then the month ends, you pay rent, light, fuel, salaries and your workers… and what&apos;s
          left is small. Sometimes nothing.
        </P>
        <P>
          Most hair businesses don&apos;t have a customer problem.{" "}
          <strong className="text-espresso">They have a pricing problem.</strong>
        </P>
        <ul className="flex flex-col gap-3">
          {problems.map((item) => (
            <li key={item} className="flex gap-3 font-sans text-base text-charcoal/85">
              <span aria-hidden="true" className="text-bronze">✕</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="font-heading text-2xl text-espresso">
          Every job you price wrong is a job you&apos;re doing for free.
        </p>
      </Section>

      <Section tint>
        <span className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">The solution</span>
        <H2>Meet the Hair Service Pricing Guide</H2>
        <P>A simple calculator you fill in on your phone, plus a step-by-step guide that walks you through it.</P>
        <P>
          It&apos;s built from the same pricing system we use at <strong className="text-espresso">Deesglim</strong>{" "}
          to price our ventilation, wigmaking, revamping and styling, and to work out what we pay our team.
        </P>
      </Section>

      <Section>
        <H2>What it shows you</H2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(([title, body]) => (
            <div key={title} className="flex flex-col gap-2 border border-blush p-5">
              <h3 className="flex gap-2 font-heading text-xl text-espresso">
                <span aria-hidden="true" className="text-bronze">✓</span>
                {title}
              </h3>
              <p className="font-sans text-sm leading-relaxed text-charcoal/80">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tint>
        <H2>Works for any hair service</H2>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => (
            <span key={s} className="border border-espresso/30 px-3 py-1 font-sans text-sm text-espresso">{s}</span>
          ))}
          <span className="px-3 py-1 font-sans text-sm text-bronze">…or any service you offer</span>
        </div>
        <P>
          Name your own services, add your own sizes and lengths, and remove what you don&apos;t do.
          Whether you do only wigmaking, only ventilation, or everything, it fits your business.
        </P>
      </Section>

      <Section>
        <H2>How it works</H2>
        <ol className="flex flex-col gap-4">
          {steps.map(([title, body], i) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-espresso font-heading text-lg text-ivory">
                {i + 1}
              </span>
              <div>
                <p className="font-heading text-xl text-espresso">{title}</p>
                <p className="font-sans text-sm text-charcoal/80">{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <P>No spreadsheets. No formulas. If you can type a price on your phone, you can use it.</P>
      </Section>

      <Section tint>
        <H2>See it in action</H2>
        <p className="font-heading text-xl text-espresso">Closure wigmaking at ₦30,000</p>
        <div className="border border-blush bg-ivory">
          {example.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-blush px-4 py-3 font-sans text-sm text-charcoal">
              <span>{label}</span>
              <span className="whitespace-nowrap tabular-nums">{value}</span>
            </div>
          ))}
          <div className="flex justify-between gap-4 bg-espresso px-4 py-3 font-sans text-sm font-semibold text-ivory">
            <span>What you keep</span>
            <span className="whitespace-nowrap tabular-nums">₦17,023 · 57% ✓</span>
          </div>
        </div>
        <ul className="flex flex-col gap-2 font-sans text-sm text-charcoal/85">
          <li>The lowest price for this wig while keeping 50% profit: <strong>₦16,000</strong></li>
          <li>At 10% off you still keep <strong>₦15,100</strong>, so this promo is safe</li>
        </ul>
        <p className="font-sans text-xs italic text-charcoal/60">Example figures. Your numbers will be your own.</p>
      </Section>

      <Section>
        <H2>Who it&apos;s for</H2>
        <ul className="flex flex-col gap-3">
          {forYou.map((item) => (
            <li key={item} className="flex gap-3 font-sans text-base text-charcoal/85">
              <span aria-hidden="true" className="text-bronze">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <P>
          <strong className="text-espresso">It&apos;s not for you if</strong> you just want a list of
          prices to copy. This guide helps you work out <em>your</em> prices, from <em>your</em> costs.
        </P>
      </Section>

      <Section tint>
        <H2>What you get</H2>
        <ul className="flex flex-col gap-3">
          {included.map((item) => (
            <li key={item} className="flex gap-3 font-sans text-base text-charcoal/85">
              <span aria-hidden="true" className="text-bronze">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <OfferBox state={state} />
      </Section>

      <Section>
        <H2>Questions</H2>
        <div className="flex flex-col divide-y divide-blush border-y border-blush">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="cursor-pointer list-none font-heading text-lg text-espresso">
                <span className="mr-2 inline-block text-bronze transition group-open:rotate-45">+</span>
                {q}
              </summary>
              <p className="mt-2 font-sans text-sm leading-relaxed text-charcoal/80">{a}</p>
            </details>
          ))}
        </div>
      </Section>

      <section className="bg-espresso px-6 py-16 sm:py-20">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <h2 className="font-heading text-3xl text-ivory sm:text-4xl">
            Price it right, and every job pays you.
          </h2>
          <p className="font-sans text-base text-ivory/80">
            You&apos;re already doing the work. Make sure you&apos;re getting paid for it.
          </p>
          {!owned && <PriceTag pricing={pricing} dark />}
          {!owned && pricing.onSale && <SaleCountdown endsAt={pricing.saleEndsAt} tone="dark" />}
          <div className="[&_a]:border-ivory [&_a]:bg-ivory [&_a]:text-espresso [&_button]:bg-ivory [&_button]:text-espresso">
            <BuyActions state={state} label="Get the Hair Service Pricing Guide" />
          </div>
        </div>
      </section>
    </main>
  );
}
