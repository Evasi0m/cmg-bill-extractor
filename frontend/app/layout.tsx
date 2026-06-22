import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMG Bill JSON Extractor",
  description: "Extract CMG invoice images into TIMES POS bill JSON."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}

