import { PHOTOS, unsplash } from "./photos";

// The About section's photograph shows the studio at work: a hand drawing a house elevation, which is what the copy
// beside it says ("we build each from our own drawings"). The hero video morphs into this exact image, so the hero and
// the About slot must use the same URL, the same `sizes` and the same aspect ratio (so the browser picks the same
// file for both). Replace with a real photograph of the studio's own drawing table.
export const ABOUT_IMAGE_ASPECT = 1.4; // width / height of the crop requested below
export const ABOUT_IMAGE = unsplash(PHOTOS.studio.id, [7, 5], PHOTOS.studio.focal);
export const ABOUT_IMAGE_ALT = PHOTOS.studio.alt;
// The museum label under the photograph (placeholder wording)
export const ABOUT_CAPTION = { title: "A house in Highgate, drawn by hand", meta: "Elevation, scale 1:50" } as const;
// The crop is landscape (1.4) and shown in a portrait frame, so the file must be about 1.7 times as wide as the frame
// to stay sharp: hence 50vw for a frame that is 30vw wide.
export const ABOUT_IMAGE_SIZES = "(min-width: 768px) 50vw, 100vw";
