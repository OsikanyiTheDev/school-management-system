import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMIS — School Management Information System",
  description: "A production-oriented, cloud-based School Management Information System foundation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
