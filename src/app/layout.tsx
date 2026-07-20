import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marimuthu Rajagopal — Embedded Systems Engineer",
  description:
    "Embedded firmware engineer building for battery energy storage — MCU development, CAN/RS485/Modbus communication stacks, and EMS/BMS control logic. Also a playable 3D office you can walk through.",
  openGraph: {
    title: "Marimuthu Rajagopal — Embedded Systems Engineer",
    description:
      "Firmware for battery energy storage systems, presented as both a portfolio site and a playable 3D office.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070a",
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
