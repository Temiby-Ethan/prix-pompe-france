export const BIG_CITIES = [
  "paris",
  "marseille",
  "lyon",
  "toulouse",
  "nice",
  "nantes",
  "strasbourg",
  "montpellier",
  "bordeaux",
  "lille",
  "rennes",
  "reims",
  "saint etienne",
  "toulon",
  "le havre",
  "grenoble",
  "dijon",
  "angers",
  "nimes",
  "villeurbanne",
  "clermont ferrand",
  "brest",
  "limoges",
  "tours",
  "amiens",
  "perpignan",
  "metz",
  "besancon",
  "orleans",
  "mulhouse",
  "rouen",
  "caen",
  "nancy",
  "poitiers",
] as const;

export const REGIONS: Record<string, string[]> = {
  "auvergne rhone alpes": ["01", "03", "07", "15", "26", "38", "42", "43", "63", "69", "73", "74"],
  "bourgogne franche comte": ["21", "25", "39", "58", "70", "71", "89", "90"],
  bretagne: ["22", "29", "35", "56"],
  "centre val de loire": ["18", "28", "36", "37", "41", "45"],
  corse: ["2A", "2B"],
  "grand est": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"],
  "hauts de france": ["02", "59", "60", "62", "80"],
  "ile de france": ["75", "77", "78", "91", "92", "93", "94", "95"],
  normandie: ["14", "27", "50", "61", "76"],
  "nouvelle aquitaine": ["16", "17", "19", "23", "24", "33", "40", "47", "64", "79", "86", "87"],
  occitanie: ["09", "11", "12", "30", "31", "32", "34", "46", "48", "65", "66", "81", "82"],
  "pays de la loire": ["44", "49", "53", "72", "85"],
  "provence alpes cote d azur": ["04", "05", "06", "13", "83", "84"],
  guadeloupe: ["971"],
  martinique: ["972"],
  guyane: ["973"],
  reunion: ["974"],
  mayotte: ["976"],
};

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/'/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toDisplayLabel(text: string): string {
  return text
    .split(" ")
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function findBigCityInSearch(search: string): string | null {
  const normalizedSearch = normalizeText(search);

  if (!normalizedSearch) return null;

  for (const city of BIG_CITIES) {
    if (normalizedSearch === city || normalizedSearch.startsWith(`${city} `)) {
      return city;
    }
  }

  return null;
}

export function findRegionInSearch(search: string): string | null {
  const normalizedSearch = normalizeText(search);

  if (!normalizedSearch) return null;

  const regionNames = Object.keys(REGIONS);

  for (const region of regionNames) {
    if (normalizedSearch === region || normalizedSearch.startsWith(`${region} `)) {
      return region;
    }
  }

  return null;
}