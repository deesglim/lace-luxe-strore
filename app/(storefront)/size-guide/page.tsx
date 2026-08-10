import Image from "next/image";

export default function SizeGuidePage() {
  return (
    <main className="flex min-h-screen flex-1 flex-col bg-ivory px-6 py-20">
      <div className="mx-auto w-full max-w-content">
        <header className="mb-12 text-center">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
            Fit & Measurements
          </span>
          <h1 className="mt-3 font-heading text-4xl font-medium text-espresso sm:text-5xl">
            Size <span className="italic text-bronze">Guide</span>
          </h1>
        </header>

        <div className="mx-auto w-full max-w-2xl">
          <Image
            src="/images/size-guide.png"
            alt="Lace size guide chart"
            width={1024}
            height={1536}
            sizes="(min-width: 768px) 640px, 100vw"
            className="h-auto w-full rounded-md border border-blush shadow-sm"
          />
        </div>
      </div>
    </main>
  );
}
