type PagePlaceholderProps = {
  title: string;
  eyebrow?: string;
  // A word/phrase within `title` to render as an italic accent, matching
  // the homepage hero's "Lace Luxe *by Dee*" treatment. Only applied when
  // it's an exact substring match — falls back to the plain title otherwise.
  italicWord?: string;
};

/**
 * Temporary stand-in for sections that haven't been built yet.
 * Swap each usage out for the real page as that section is implemented.
 */
export default function PagePlaceholder({
  title,
  eyebrow,
  italicWord,
}: PagePlaceholderProps) {
  const parts = italicWord ? title.split(italicWord) : null;
  const hasAccent = parts !== null && parts.length === 2;

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 bg-ivory px-6 text-center">
      {eyebrow && (
        <span className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
          {eyebrow}
        </span>
      )}
      <h1 className="font-heading text-4xl font-medium text-espresso">
        {hasAccent ? (
          <>
            {parts![0]}
            <span className="italic text-bronze">{italicWord}</span>
            {parts![1]}
          </>
        ) : (
          title
        )}
      </h1>
      <p className="font-sans text-sm uppercase tracking-[0.2em] text-bronze">
        Coming Soon
      </p>
    </main>
  );
}
