import type { Metadata } from "next";
import workshopConfig from "@/workshop.config";
import { ThemeScript } from "@/lib/ThemeScript";
import "./globals.css";

export const metadata: Metadata = {
  title: workshopConfig.title,
  description: workshopConfig.description,
};

const defaultTheme = workshopConfig.defaultTheme ?? "dark";
const themeStorageKey = `workshop-${workshopConfig.id}-theme`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-theme={defaultTheme}>
      <head>
        <ThemeScript defaultTheme={defaultTheme} storageKey={themeStorageKey} />
        <noscript>
          <style>{`[style*="opacity: 0"], [style*="opacity:0"] { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
