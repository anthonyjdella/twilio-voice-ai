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
