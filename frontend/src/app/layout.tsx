import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pulkit Chaudhary — Quant × Data Science",
  description:
    "Portfolio of Pulkit Chaudhary: data science, quantitative finance, ML systems, and high-throughput engineering at Rutgers.",
  openGraph: {
    title: "Pulkit Chaudhary",
    description:
      "Quantitative researcher profile — Rutgers Data Science, CS, Math & Stats.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${space.variable} ${mono.variable} font-sans min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
