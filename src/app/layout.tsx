import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marimuthu Rajagopal — Interactive Portfolio",
  description: "Realistic 3D interactive digital twin portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
