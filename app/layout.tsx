import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

// Headings (main + sub) — kept at the full weight range rather than just the
// new 600/700 the rebrand calls for, so any existing font-medium(500) usage
// elsewhere in the app keeps rendering with a real loaded weight instead of
// the browser's faux-bold fallback. Later phases can move specific headings
// to font-semibold/font-bold as they're redesigned.
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Body/nav/buttons/price — replaces Roboto. Same reasoning as above: loads
// every weight already in use (font-medium) plus the new semibold/bold the
// rebrand needs for nav, buttons, and price text.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Logo only — SemiBold per the rebrand spec.
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lace Luxe by Dee",
  description: "Lace Luxe by Dee — a new luxury lace fashion storefront.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${inter.variable} ${cormorantGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-charcoal font-sans">
        {children}
      </body>
    </html>
  );
}
