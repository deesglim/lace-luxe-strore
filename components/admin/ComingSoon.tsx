export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-2xl text-espresso">{title}</h1>
      <p className="font-sans text-sm text-charcoal/70">
        This section is coming soon.
      </p>
    </div>
  );
}
