import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prix à la pompe France",
  description: "Comparatif des stations-service sur une carte de France",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}