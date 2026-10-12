// The loader behind every next/image on the site (see images.loaderFile in next.config.ts).
//
// The photographs sit on Unsplash's image CDN, which already resizes and encodes them. This loader asks it for the
// width a given screen needs, so the browser gets a real srcset and picks the right file, instead of one oversized
// file for everybody. The proportions of a crop (w and h in the URL) are kept as the width changes.
type Args = { src: string; width: number; quality?: number };

export default function imageLoader({ src, width, quality }: Args): string {
  if (!src.startsWith("https://images.unsplash.com/")) return src; // a local file is served as it is
  const url = new URL(src);
  const w0 = Number(url.searchParams.get("w"));
  const h0 = Number(url.searchParams.get("h"));
  url.searchParams.set("w", String(width));
  if (w0 > 0 && h0 > 0) url.searchParams.set("h", String(Math.round((width * h0) / w0)));
  url.searchParams.set("q", String(quality ?? 75));
  return url.toString();
}
