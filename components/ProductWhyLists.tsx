export function WhyChooseList({ points }: { points: string[] }) {
  if (points.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-xl text-espresso">
        Why Choose This Lace
      </h2>
      <ul className="flex flex-col gap-2">
        {points.map((point, index) => (
          <li
            key={index}
            className="flex items-start gap-2 font-sans text-sm text-charcoal/80"
          >
            <span aria-hidden className="text-green-700">
              ✓
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WhyNotChooseList({ points }: { points: string[] }) {
  if (points.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-xl text-espresso">
        Why Not Choose This Lace
      </h2>
      <ul className="flex flex-col gap-2">
        {points.map((point, index) => (
          <li
            key={index}
            className="flex items-start gap-2 font-sans text-sm text-charcoal/80"
          >
            <span aria-hidden className="text-charcoal/40">
              ✗
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
