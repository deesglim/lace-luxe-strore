import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

// Headings — weight 500 is the luxury design system's default, but the
// full range stays loaded so any pre-existing font-semibold/font-bold
// heading usage elsewhere still renders with a real loaded weight instead
// of the browser's faux-bold fallback.
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Body copy only now — nav and category/eyebrow labels moved to Montserrat
// (see below). Weight range kept broad for the same faux-bold reason as
// Playfair above.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Nav links + category/eyebrow-style labels — weight 500 per spec.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500"],
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
      className={`${playfairDisplay.variable} ${inter.variable} ${montserrat.variable} ${cormorantGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-charcoal font-sans">
        {children}
      </body>
    </html>
  );
}
