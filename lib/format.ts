const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

export function formatNaira(amount: number): string {
  return nairaFormatter.format(amount);
}
