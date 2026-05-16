import AdmZip from "adm-zip";
import { XMLParser } from "fast-xml-parser";
import { Station, FuelType } from "@/types/station";

type RawPrice = {
  "@_nom"?: string;
  "@_valeur"?: string;
  "@_maj"?: string;
};

type RawPdv = {
  "@_id"?: string;
  "@_latitude"?: string;
  "@_longitude"?: string;
  "@_cp"?: string;
  adresse?: string;
  ville?: string;
  prix?: RawPrice | RawPrice[];
};

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeFuelName(name: string): FuelType | null {
  const cleaned = name.trim();

  if (cleaned === "Gazole") return "Gazole";
  if (cleaned === "SP95") return "SP95";
  if (cleaned === "SP98") return "SP98";
  if (cleaned === "E10") return "E10";
  if (cleaned === "E85") return "E85";
  if (cleaned === "GPLc") return "GPLc";

  return null;
}

function postalToDepartment(postalCode: string): string {
  if (!postalCode) return "";

  if (postalCode.startsWith("97") || postalCode.startsWith("98")) {
    return postalCode.slice(0, 3);
  }

  return postalCode.slice(0, 2);
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/’/g, "'")
    .trim();
}

function toDisplayCase(text: string): string {
  return cleanText(text)
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function detectBrand(address: string): string {
  const a = normalizeText(address);

  if (a.includes("totalenergies") || a.includes("total energies") || a.includes("total")) {
    return "TotalEnergies";
  }

  if (a.includes("intermarche")) {
    return "Intermarché";
  }

  if (a.includes("carrefour")) {
    return "Carrefour";
  }

  if (a.includes("leclerc") || a.includes("e.leclerc") || a.includes("centre leclerc")) {
    return "E.Leclerc";
  }

  if (a.includes("auchan")) {
    return "Auchan";
  }

  if (
    a.includes("super u") ||
    a.includes("hyper u") ||
    a.includes("u express") ||
    a.includes("systeme u")
  ) {
    return "Système U";
  }

  if (a.includes("casino") || a.includes("geant casino")) {
    return "Casino";
  }

  if (a.includes("bp")) {
    return "BP";
  }

  if (a.includes("esso")) {
    return "Esso";
  }

  if (a.includes("avia")) {
    return "Avia";
  }

  if (a.includes("access")) {
    return "Access";
  }

  return "";
}

function buildStationName(address: string, city: string, id: string): string {
  const brand = detectBrand(address);

  if (brand && city) {
    return `${brand} - ${city}`;
  }

  if (brand) {
    return brand;
  }

  if (city && id) {
    return `Station ${id} - ${city}`;
  }

  if (city) {
    return city;
  }

  if (id) {
    return `Station ${id}`;
  }

  return "Station";
}

export async function fetchOfficialStations(): Promise<Station[]> {
  const response = await fetch("https://donnees.roulez-eco.fr/opendata/instantane_ruptures", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Erreur téléchargement données : ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const zip = new AdmZip(Buffer.from(arrayBuffer));

  const entries = zip.getEntries();
  if (entries.length === 0) {
    throw new Error("ZIP vide");
  }

  const xmlEntry = entries.find((entry) => entry.entryName.endsWith(".xml")) ?? entries[0];

  // IMPORTANT : le flux officiel est en ISO-8859-1, pas en UTF-8
  const xmlContent = xmlEntry.getData().toString("latin1");

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const parsed = parser.parse(xmlContent);
  const pdvs = toArray(parsed?.pdv_liste?.pdv);

  const stations: Station[] = pdvs
    .map((pdv: RawPdv) => {
      const postalCode = cleanText(String(pdv["@_cp"] ?? ""));
      const latRaw = Number(pdv["@_latitude"] ?? 0);
      const lonRaw = Number(pdv["@_longitude"] ?? 0);
      const id = cleanText(String(pdv["@_id"] ?? ""));
      const address = toDisplayCase(String(pdv.adresse ?? ""));
      const city = toDisplayCase(String(pdv.ville ?? ""));

      const prices = toArray(pdv.prix)
        .map((price) => {
          const fuel = normalizeFuelName(String(price["@_nom"] ?? ""));
          const value = Number(price["@_valeur"]);

          if (!fuel || Number.isNaN(value)) return null;

          return {
            fuelType: fuel,
            price: value,
            updatedAt: price["@_maj"] ?? undefined,
          };
        })
        .filter(Boolean) as Station["prices"];

      if (!postalCode || !latRaw || !lonRaw || prices.length === 0) {
        return null;
      }

      return {
        id,
        name: buildStationName(address, city, id),
        address,
        city,
        postalCode,
        department: postalToDepartment(postalCode),
        lat: latRaw / 100000,
        lon: lonRaw / 100000,
        prices,
      };
    })
    .filter(Boolean) as Station[];

  return stations;
}