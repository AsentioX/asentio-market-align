/**
 * Lovable CDN assets are served from relative `/__l5e/assets-v1/...` paths,
 * which only resolve on Lovable-hosted origins. When the app is deployed
 * elsewhere (e.g. a custom domain on another host), those paths 404.
 *
 * This helper rewrites them to an absolute Lovable origin so images load
 * regardless of where the app is hosted.
 */
const LOVABLE_ASSET_ORIGIN = "https://asentio-website.lovable.app";

export function assetUrl(url: string): string {
  if (!url.startsWith("/__l5e/")) return url;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host.endsWith(".lovable.app") || host.endsWith(".lovableproject.com")) {
      return url;
    }
  }
  return `${LOVABLE_ASSET_ORIGIN}${url}`;
}
