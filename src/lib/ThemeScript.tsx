/**
 * Inline script component that sets data-theme before first paint to prevent
 * flash of unstyled content (FOUC). This runs synchronously in <head> before
 * any CSS paints. Content is a hardcoded, trusted string — no user input.
 */
export function ThemeScript({
  defaultTheme,
  storageKey,
}: {
  defaultTheme: string;
  storageKey: string;
}) {
  // This script reads localStorage and sets data-theme on <html> before paint.
  // The string is fully static/trusted — defaultTheme is a compile-time constant
  // ("dark" or "light"), and storageKey is derived from the admin-authored
  // workshop config id (alphanumeric+hyphens only).
  const script = `(function(){try{var t=localStorage.getItem("${storageKey}");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t)}else{document.documentElement.setAttribute("data-theme","${defaultTheme}")}}catch(e){document.documentElement.setAttribute("data-theme","${defaultTheme}")}})()`;

  return (
    <script
      // eslint-disable-next-line react/no-danger -- safe: hardcoded string, no user input
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}

/**
 * Mirrors ThemeScript for audience mode so builder/explorer content conditionals
 * paint with the correct visibility on first render. Without this, explorer
 * users would see a flash of builder-only blocks (code, terminals, deep dives)
 * before React hydrates AudienceProvider and hides them.
 */
export function AudienceScript({ storageKey }: { storageKey: string }) {
  // Sets data-audience on <html>. CSS can then gate builder/explorer blocks
  // via [data-audience="explorer"] rules that run before hydration.
  const script = `(function(){try{var m=localStorage.getItem("${storageKey}");if(m==="builder"||m==="explorer"){document.documentElement.setAttribute("data-audience",m)}}catch(e){}})()`;

  return (
    <script
      // eslint-disable-next-line react/no-danger -- safe: hardcoded string, no user input
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
