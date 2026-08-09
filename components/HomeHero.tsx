import Link from "next/link";

export default function HomeHero({
  imageUrl,
  heading,
  subheading,
}: {
  imageUrl: string | null;
  heading: string;
  subheading: string;
}) {
  return (
    <section
      className={`relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 text-center sm:min-h-[85vh] ${
        imageUrl ? "" : "bg-ivory"
      }`}
    >
      {imageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-espresso/55" />
        </>
      )}

      <div className="relative z-10 flex max-w-2xl flex-col items-center gap-6">
        <span className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
          Est. 2026
        </span>
        <h1
          className={`font-heading text-5xl font-medium tracking-wide sm:text-7xl ${
            imageUrl ? "text-ivory" : "text-espresso"
          }`}
        >
          {heading}
        </h1>
        <div className="h-px w-24 bg-blush" />
        <p
          className={`max-w-md font-sans text-base sm:text-lg ${
            imageUrl ? "text-ivory/85" : "text-charcoal/70"
          }`}
        >
          {subheading}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/shop"
            className={`rounded-md px-8 py-3 font-sans text-sm uppercase tracking-[0.2em] transition ${
              imageUrl
                ? "bg-ivory text-espresso hover:bg-blush"
                : "bg-espresso text-ivory hover:bg-espresso/90"
            }`}
          >
            Shop Now
          </Link>
          <Link
            href="/shop#offers"
            className={`rounded-md border px-8 py-3 font-sans text-sm uppercase tracking-[0.2em] transition ${
              imageUrl
                ? "border-ivory/60 text-ivory hover:bg-ivory/10"
                : "border-espresso text-espresso hover:bg-espresso hover:text-ivory"
            }`}
          >
            View Offers
          </Link>
        </div>
      </div>
    </section>
  );
}
