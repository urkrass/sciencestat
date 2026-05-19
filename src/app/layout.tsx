import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Statistics for Scientific Claims",
    template: "%s | Statistics for Scientific Claims"
  },
  description:
    "Lecture notes and printable PDFs for scientific data analysis, statistics, and evidence reasoning in IB Biology and Chemistry."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
