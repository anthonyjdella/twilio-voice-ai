// Returns the Google Slides embed URL from the server's env var. Read at
// request time so it picks up the Azure Container App secret value, which is
// only populated after the Docker image is built. Also normalizes /pub URLs
// (which Google sends with X-Frame-Options: SAMEORIGIN and can't be iframed)
// to their iframeable /embed equivalent.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const raw = process.env.WORKSHOP_SLIDES_EMBED_URL;
  const embedUrl = raw
    ? raw.replace("/pub?", "/embed?").replace(/\/pub$/, "/embed")
    : null;

  return Response.json({ embedUrl });
}
