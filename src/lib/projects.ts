import { PHOTOS } from "./photos";

// Placeholder projects. Replace with the studio's own work.
// One list feeds the Projects gallery and the About section's lead photograph and caption, so the two never disagree.
export const PROJECTS = [
  {
    name: "Highgate House",
    place: "Highgate, London",
    kind: "Full interior",
    year: "2024",
    id: PHOTOS.highgate.id,
    alt: PHOTOS.highgate.alt,
  },
  {
    name: "Cadogan Flat",
    place: "Chelsea, London",
    kind: "Apartment",
    year: "2024",
    id: PHOTOS.cadogan.id,
    alt: PHOTOS.cadogan.alt,
  },
  {
    name: "Kew Green House",
    place: "Richmond, London",
    kind: "Kitchen and dining",
    year: "2022",
    id: PHOTOS.kew.id,
    alt: PHOTOS.kew.alt,
  },
] as const;
