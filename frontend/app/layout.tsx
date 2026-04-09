import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Convyr — WhatsApp Automation for African Businesses",
  description:
    "Automate your WhatsApp Business in under 5 minutes. Auto-replies, order management, and customer follow-ups — all from a simple dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/favicon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
