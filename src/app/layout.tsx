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
  // Normalize the Google Slides URL here so SlidesHost (a client component)
  // never sees the raw env var. /pub and /embed both accepted.
  const rawSlidesUrl = process.env.WORKSHOP_SLIDES_EMBED_URL;
  const slidesEmbedUrl = rawSlidesUrl
    ? rawSlidesUrl.replace("/pub?", "/embed?").replace(/\/pub$/, "/embed")
    : null;

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
        <SlidesHost embedUrl={slidesEmbedUrl ?? null} />
      </body>
    </html>
  );
}
