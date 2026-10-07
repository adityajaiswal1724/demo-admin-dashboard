import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Demo · Customer Dashboard",
  description: "A frontend-only customer dashboard with fictional sample data.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
