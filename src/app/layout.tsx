import type { Metadata } from "next";
import workshopConfig from "@/workshop.config";
import { ThemeScript, AudienceScript } from "@/lib/ThemeScript";
import SlidesHost from "@/components/SlidesHost";
import "./globals.css";

export const metadata: Metadata = {
  title: workshopConfig.title,
  description: workshopConfig.description,
};

const defaultTheme = workshopConfig.defaultTheme ?? "dark";
const themeStorageKey = `workshop-${workshopConfig.id}-theme`;
const audienceStorageKey = `workshop-${workshopConfig.id}-audience-mode`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // SlidesHost fetches the embed URL from /api/slides-url on mount. Reading
  // process.env here would force the layout to be dynamic, disabling static
  // generation for every page in the app.
  return (
    <html lang="en" className="h-full antialiased" data-theme={defaultTheme} suppressHydrationWarning>
      <head>
        <ThemeScript defaultTheme={defaultTheme} storageKey={themeStorageKey} />
        <AudienceScript storageKey={audienceStorageKey} />
        <noscript>
          <style>{`[style*="opacity: 0"], [style*="opacity:0"] { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
      </head>
      <body className="min-h-full">
        {children}
        <SlidesHost />
      </body>
    </html>
  );
}
