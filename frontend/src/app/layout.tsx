import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import PickleCursor from "@/components/PickleCursor";
import IntroServe from "@/components/IntroServe";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pulkit Chaudhary — Data Science, quant & ML",
  description:
    "Pulkit Chaudhary: Rutgers Data Science, CS, Math & Statistics. Quant research, ML systems, high-throughput analytics. Court side.",
  openGraph: {
    title: "Pulkit Chaudhary",
    description:
      "Rutgers Data Science, CS, Math & Statistics — quant research, ML systems, high-throughput analytics.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} min-h-screen`}>
        {/* No smooth-scroll library. Lenis moved scrolling onto the main
            thread with a 1.05s ease, which reads as input lag and defeats the
            display's native refresh rate. Native scroll is compositor-driven
            and cannot stutter from JavaScript. */}
        <PickleCursor />
        <IntroServe />
        {children}
      </body>
    </html>
  );
}
