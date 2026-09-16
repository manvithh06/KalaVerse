import type { Motif } from "@/types";

/**
 * Photographs shown in place of the illustrated plates.
 *
 * Sacred and protected practices are deliberately missing: `daivaradhane` and
 * `sacred` keep their abstract plates, because the platform's own rule is that
 * protected practices are never depicted.
 *
 * Every source here is a Bing image link, so the hostnames must stay in step
 * with `images.remotePatterns` in next.config.ts.
 */
export interface Photo {
  src: string;
  alt: string;
  credit?: string;
  /** CSS object-position, for photos that should not be cropped from the centre. */
  focus?: string;
}

/**
 * Bing returns whatever size is asked for, so request about 3x the thumbnail.
 * These parameters crop to the requested box; the search-results ones (`pid=1.7`,
 * `rm=3`) pad with white instead, which shows as bands on a card.
 */
function bing(id: string, w: number, h: number): string {
  return `https://th.bing.com/th/id/${id}?w=${w}&h=${h}&c=7&rs=1&qlt=90&o=6&pid=ImgAns&rm=2`;
}

/** Used wherever a practice has no photo of its own. */
export const MOTIF_PHOTOS: Partial<Record<Motif, Photo>> = {
  yakshagana: {
    src: "https://www.bing.com/th/id/OIP.udjXE0aSrnY8WXWN3o9NEAHaJL?w=800&h=991&c=7&rs=1&qlt=90&o=6&pid=ImgAns&rm=2",
    alt: "A Yakshagana performer in a tall red and white fan crown and gold ornaments, dancing on stage beside a chende drummer",
    credit: "Prashanth Malyadi",
  },
  talamaddale: {
    src: bing("OIP.ZO0Bgt_aeLmvGCj7FbND4AHaEK", 912, 540),
    alt: "Performers on a lit stage during an evening performance",
  },
  kambala: {
    src: bing("OIP.wsIUZ_ACqPJ9UU12UUOJhwHaEK", 861, 540),
    alt: "Two buffaloes racing down a flooded paddy track with their runner",
  },
  krishi: {
    src: bing("OIP.AbODg7FtfgE0Tjt7UdBxLAHaE5", 726, 540),
    alt: "Paddy fields below wooded hills, with cattle on the field path",
  },
  cuisine: {
    src: bing("OIP.QIU-eNarWtY2a_kd2cUhkgHaD5", 870, 540),
    alt: "A banana leaf meal of rice with several coastal dishes",
  },
  handicrafts: {
    src: bing("OIP.x0wkJ0k4goBkPIzkKAq0fQHaEO", 957, 546),
    alt: "A stall of handmade coastal crafts in many colours",
  },
  kasuti: {
    src: bing("OIP.oK4DpR6XW70JvYoUZLU8NQHaJ3", 606, 807),
    alt: "Kasuti embroidery worked in white and yellow thread on grey cotton",
  },
  pottery: {
    src: bing("OIP.46uYJkcklYMtNKX6nNXr5QHaHa", 579, 576),
    alt: "Three hand-thrown terracotta pots",
  },
  weaving: {
    src: bing("OIP.T_puMLN4xokrfzTq6HP4pgHaLI", 606, 915),
    alt: "A handloom cotton saree with a gold border",
  },
  areca: {
    src: bing("OIP.p3769vrmieS7vT3OwSCwMwHaEo", 759, 540),
    alt: "Plates and bowls pressed from areca sheath",
  },
};

/** Keyed by tradition id, for the homepage panels that want their own photo. */
export const TRADITION_PHOTOS: Record<string, Photo> = {
  cuisine: {
    src: bing("OIP.5JGcbU5LOq4NobqdJ6bi7wHaFU", 753, 543),
    alt: "A coastal chicken curry served with a soft rice flatbread",
  },
};

/** Keyed by product id. */
export const PRODUCT_PHOTOS: Record<string, Photo> = {
  "kasuti-table-runner": {
    src: bing("OIP.oK4DpR6XW70JvYoUZLU8NQHaJ3", 606, 807),
    alt: "A grey cotton runner stitched with white and yellow Kasuti motifs",
  },
  "terracotta-water-pot": {
    src: bing("OIP.46uYJkcklYMtNKX6nNXr5QHaHa", 579, 576),
    alt: "Three hand-thrown terracotta water pots",
  },
  "udupi-handloom-saree": {
    src: bing("OIP.T_puMLN4xokrfzTq6HP4pgHaLI", 606, 915),
    alt: "A brown handloom cotton saree with a gold border",
  },
  "areca-sheath-set": {
    src: bing("OIP.p3769vrmieS7vT3OwSCwMwHaEo", 759, 540),
    alt: "Plates and bowls pressed from areca sheath, laid on a table",
  },
  "yakshagana-ornament-miniature": {
    src: bing("OIP.dKtgS9ymVYM_pD27nWwJugHaFF", 789, 543),
    alt: "Small carved and painted wooden figures",
  },
  "kasuti-cushion-cover": {
    src: bing("OIP.pyS5C827G2TcRKQj28WaywHaJ4", 606, 807),
    alt: "A pink cushion cover embroidered with a Kasuti chariot motif",
  },
  "clay-curry-pot": {
    src: bing("OIP.7xkBO3dEWg8fgKjWvrD5zwHaHa", 591, 591),
    alt: "A lidded terracotta curry pot",
  },
  "handwoven-cotton-stole": {
    src: bing("OIP.o_5UGV8xKvfeRYj_aI5c6wHaHa", 606, 606),
    alt: "A handwoven cotton stole in pink and grey",
  },
};
