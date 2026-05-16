import { Station, FuelType } from "@/types/station";
import { FuelBounds } from "@/types/stationMeta";
import { fetchOfficialStations } from "@/lib/fetchStations";

type CachedData = {
  stations: Station[];
  bounds: FuelBounds;
  fetchedAt: number;
};

let cache: CachedData | null = null;
let pendingPromise: Promise<CachedData> | null = null;

const CACHE_DURATION_MS = 5 * 60 * 1000;

const ALL_FUELS: FuelType[] = ["Gazole", "SP95", "SP98", "E10", "E85", "GPLc"];

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function getPaddingForFuel(fuel: FuelType): { lower: number; upper: number } {
  switch (fuel) {
    case "E85":
      return { lower: 0.05, upper: 0.08 };
    case "GPLc":
      return { lower: 0.04, upper: 0.06 };
    default:
      return { lower: 0.08, upper: 0.12 };
  }
}

function computeBounds(stations: Station[]): FuelBounds {
  const bounds = {} as FuelBounds;

  for (const fuel of ALL_FUELS) {
    const prices: number[] = [];

    for (const station of stations) {
      const price = station.prices.find((p) => p.fuelType === fuel)?.price;
      if (typeof price === "number" && !Number.isNaN(price)) {
        prices.push(price);
      }
    }

    if (prices.length === 0) {
      bounds[fuel] = { min: 0, max: 3 };
      continue;
    }

    const rawMin = Math.min(...prices);
    const rawMax = Math.max(...prices);
    const padding = getPaddingForFuel(fuel);

    bounds[fuel] = {
      min: round3(Math.max(0, rawMin - padding.lower)),
      max: round3(rawMax + padding.upper),
    };
  }

  return bounds;
}

async function buildCache(): Promise<CachedData> {
  const stations = await fetchOfficialStations();
  const bounds = computeBounds(stations);

  return {
    stations,
    bounds,
    fetchedAt: Date.now(),
  };
}

export async function getCachedStationsData(): Promise<CachedData> {
  const now = Date.now();

  if (cache && now - cache.fetchedAt < CACHE_DURATION_MS) {
    return cache;
  }

  if (pendingPromise) {
    return pendingPromise;
  }

  pendingPromise = buildCache()
    .then((data) => {
      cache = data;
      return data;
    })
    .finally(() => {
      pendingPromise = null;
    });

  return pendingPromise;
}