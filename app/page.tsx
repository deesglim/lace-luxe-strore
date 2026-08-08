export default function Home() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 bg-ivory px-6 text-center">
      <span className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
        Est. 2026
      </span>
      <h1 className="font-heading text-5xl font-medium tracking-wide text-espresso sm:text-7xl">
        Lace Luxe <span className="italic text-bronze">by Dee</span>
      </h1>
      <div className="h-px w-24 bg-blush" />
      <p className="max-w-md font-sans text-base text-charcoal/70 sm:text-lg">
        Coming Soon
      </p>
    </main>
  );
}
