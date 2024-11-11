import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stadium Seat Booking",
  description: "Book your seats in the stadium",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
