import type { ReactNode } from "react";

// Shared shell for the static info pages (Shipping, Returns, FAQ, Terms) —
// same header treatment as /contact and /size-guide, with a left-aligned
// content column below for prose/lists rather than a single hero block.
export function PolicyPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-1 flex-col bg-ivory px-6 py-20">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-12 text-center">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
            {eyebrow}
          </span>
          <h1 className="mt-3 font-heading text-4xl font-medium text-espresso sm:text-5xl">
            {title}
          </h1>
        </header>

        <div className="flex flex-col gap-10">{children}</div>
      </div>
    </main>
  );
}

export function PolicySection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-xl text-espresso">{heading}</h2>
      {children}
    </section>
  );
}

export function PolicyParagraph({ children }: { children: ReactNode }) {
  return (
    <p className="font-sans text-sm leading-relaxed text-charcoal/80">{children}</p>
  );
}

export function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5 pl-5 font-sans text-sm leading-relaxed text-charcoal/80 [list-style-type:disc]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
