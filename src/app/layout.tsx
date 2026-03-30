import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Twilio Voice AI Workshop",
  description:
    "Build a voice AI agent with Twilio ConversationRelay in 90 minutes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
