// The site's photographs, in one place, so the whole set can be swapped for the studio's own in a single edit.
//
// Art direction for these placeholders: real photographs rather than 3D renders, warm natural light, plaster, timber
// and stone, no saturated colour. Every picture also gets the same colour grade from the image host (see GRADE), so
// they read as one body of work. All of them are hotlinked from Unsplash: replace them with the studio's own project
// photography before launch.

/** One grade for every photograph: 20% less saturation and a touch of warmth, applied by the image host in the URL. */
export const GRADE = "&sat=-20&sepia=10";

/**
 * A photograph on the image host. The width and quality are filled in by the image loader (src/lib/image-loader.ts)
 * for each screen. `ratio` fixes the shape of the crop: any two numbers in the proportion you want, such as [3, 2].
 * `focal` zooms the crop in on a point (x and y from 0 to 1 across and down the original, z the zoom).
 */
export const unsplash = (
  id: string,
  ratio?: readonly [number, number],
  focal?: { readonly x: number; readonly y: number; readonly z: number },
) => {
  const crop = ratio ? `&w=${ratio[0] * 200}&h=${ratio[1] * 200}` : "";
  const zoom = focal ? `&crop=focalpoint&fp-x=${focal.x}&fp-y=${focal.y}&fp-z=${focal.z}` : "";
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop${crop}${zoom}${GRADE}`;
};

export const PHOTOS = {
  // The three projects
  highgate: {
    id: "1564078516393-cf04bd966897",
    alt: "Living room at dusk, with tall windows, a deep corner sofa and a large triptych on a warm wall",
  },
  cadogan: {
    id: "1552558636-f6a8f071c2b3",
    alt: "Bedroom with a raw concrete wall, soft linen bedding and low sun",
  },
  kew: {
    id: "1610177534644-34d881503b83",
    alt: "Kitchen with warm oak cabinetry and a dark stone island",
  },
  // The studio at work: a hand drawing a house elevation, shown in About. The original also shows a company logo on the
  // man's shirt, so the crop is zoomed in on the hand and the drawing (the focal point); keep that if you swap the file.
  studio: {
    id: "1503387762-592deb58ef4e",
    alt: "An architect's hand drawing a house elevation in pencil, beside a scale rule and a roll of drawings on an oak desk",
    focal: { x: 0.42, y: 0.78, z: 1.5 },
  },
  // Two more homes, shown as thumbnails in the testimonials
  wren: {
    id: "1507652313519-d4e9174996dd",
    alt: "Stone bathroom with a freestanding bath and a palm against a textured wall",
  },
  marlow: {
    id: "1604578762246-41134e37f9cc",
    alt: "Dining room opening to a garden, with a long timber table",
  },
  // The room in the Process section, and two calm pictures
  room: {
    id: "1599696848652-f0ff23bc911f",
    alt: "Living room with a fluted timber wall, a concrete column and a low sofa with rust cushions",
  },
  calm: {
    id: "1519710164239-da123dc03ef4",
    alt: "A pale corner with a round table, a curved lamp and tall plants against sheer curtains",
  },
  minimal: {
    id: "1567016376408-0226e4d0c1ea",
    alt: "A plaster archway opening onto a pale room with a low sofa",
  },
} as const;
