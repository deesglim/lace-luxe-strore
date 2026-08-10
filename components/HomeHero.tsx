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
      className={`relative flex min-h-[75vh] items-center justify-center overflow-hidden px-6 text-center lg:min-h-[90vh] ${
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

      <div className="relative z-10 flex w-full max-w-[600px] flex-col items-center gap-6">
        <span className="font-sans text-nav font-medium uppercase tracking-brand text-bronze">
          EST. 2026
        </span>
        <h1
          className={`font-heading text-hero font-bold tracking-brand md:text-hero-md lg:text-hero-lg ${
            imageUrl ? "text-ivory" : "text-espresso"
          }`}
        >
          {heading}
        </h1>
        <div className="h-px w-24 bg-blush" />
        <p
          className={`font-sans text-body font-normal ${
            imageUrl ? "text-ivory/85" : "text-charcoal/70"
          }`}
        >
          {subheading}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/shop"
            className={`rounded-md px-8 py-3 font-sans text-button font-semibold uppercase tracking-brand transition ${
              imageUrl
                ? "bg-ivory text-espresso hover:bg-blush"
                : "bg-espresso text-ivory hover:bg-espresso/90"
            }`}
          >
            SHOP NOW
          </Link>
          <Link
            href="/shop"
            className={`rounded-md border px-8 py-3 font-sans text-button font-semibold uppercase tracking-brand transition ${
              imageUrl
                ? "border-ivory/60 text-ivory hover:bg-ivory/10"
                : "border-espresso text-espresso hover:bg-espresso hover:text-ivory"
            }`}
          >
            VIEW COLLECTION
          </Link>
        </div>
      </div>
    </section>
  );
}
