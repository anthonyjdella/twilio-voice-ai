export const metadata = {
  title: "Slides — Voice AI Workshop",
};

// The slide deck itself is rendered by <SlidesHost /> mounted in the root
// layout. Keeping the iframe there (rather than here) means navigating away
// and back doesn't reset the current slide -- the iframe stays alive and
// Google's player keeps its state. See src/components/SlidesHost.tsx.
//
// This page only handles the unconfigured-URL fallback. When the env var is
// set, it renders nothing visible -- SlidesHost covers the viewport via a
// fixed overlay.
export default function SlidesPage() {
  const raw = process.env.WORKSHOP_SLIDES_EMBED_URL;

  if (!raw) {
    return (
      <div className="min-h-screen bg-black text-white p-10 font-display">
        <h1 className="text-2xl font-extrabold mb-4">Slides not configured</h1>
        <p className="text-white/70 mb-6">
          Set <code className="text-twilio-red">WORKSHOP_SLIDES_EMBED_URL</code> in your environment to the
          Google Slides publish-to-web embed URL.
        </p>
        <ol className="text-white/70 list-decimal ml-6 space-y-2">
          <li>In Google Slides, open File &rarr; Share &rarr; Publish to web.</li>
          <li>Choose the Embed tab, click Publish, and copy the <code>src</code> URL from the iframe.</li>
          <li>Set <code className="text-twilio-red">WORKSHOP_SLIDES_EMBED_URL=&lt;that URL&gt;</code> and restart the server.</li>
        </ol>
      </div>
    );
  }

  return null;
}
