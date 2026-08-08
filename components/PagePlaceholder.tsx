type PagePlaceholderProps = {
  title: string;
};

/**
 * Temporary stand-in for sections that haven't been built yet.
 * Swap each usage out for the real page as that section is implemented.
 */
export default function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 bg-ivory px-6 text-center">
      <h1 className="font-heading text-4xl font-medium text-espresso">
        {title}
      </h1>
      <p className="font-sans text-sm uppercase tracking-[0.2em] text-bronze">
        Coming Soon
      </p>
    </main>
  );
}
