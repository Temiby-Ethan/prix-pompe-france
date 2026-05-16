import { FuelType, Station } from "@/types/station";
import { findBigCityInSearch, findRegionInSearch } from "@/lib/locationTargets";

export type FilterState = {
  selectedFuel: FuelType;
  maxPrice: string;
  department: string;
  search: string;
};

export type FuelThresholds = {
  greenMax: number;
  orangeMax: number;
};

function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getPriceForFuel(station: Station, fuel: FuelType): number | null {
  const fuelData = station.prices.find((p) => p.fuelType === fuel);
  return fuelData ? fuelData.price : null;
}

export function getFuelPriceThresholds(fuel: FuelType): FuelThresholds {
  switch (fuel) {
    case "Gazole":
      return { greenMax: 1.9, orangeMax: 2.1 };

    case "SP95":
      return { greenMax: 2.0, orangeMax: 2.2 };

    case "SP98":
      return { greenMax: 2.05, orangeMax: 2.25 };

    case "E10":
      return { greenMax: 1.95, orangeMax: 2.15 };

    case "E85":
      return { greenMax: 1.1, orangeMax: 1.3 };

    case "GPLc":
      return { greenMax: 1.05, orangeMax: 1.2 };

    default:
      return { greenMax: 1.9, orangeMax: 2.1 };
  }
}

export function getMarkerPriceColor(
  price: number | null,
  fuel: FuelType
): "green" | "orange" | "red" | "gray" {
  if (price === null) return "gray";

  const { greenMax, orangeMax } = getFuelPriceThresholds(fuel);

  if (price < greenMax) return "green";
  if (price < orangeMax) return "orange";
  return "red";
}

export function filterStations(stations: Station[], filters: FilterState): Station[] {
  const { selectedFuel, maxPrice, department, search } = filters;
  const normalizedSearch = normalizeSearchText(search);

  const searchTargetsLargeArea =
    !!findBigCityInSearch(search) || !!findRegionInSearch(search);

  return stations.filter((station) => {
    const price = getPriceForFuel(station, selectedFuel);

    if (price === null) return false;

    if (maxPrice && price > Number(maxPrice)) return false;

    if (department && station.department !== department.trim().toUpperCase()) {
      return false;
    }

    if (normalizedSearch && !searchTargetsLargeArea) {
      const haystack = normalizeSearchText(
        `${station.name} ${station.address} ${station.city} ${station.postalCode} ${station.department}`
      );

      if (!haystack.includes(normalizedSearch)) return false;
    }

    return true;
  });
}

export function sortStationsByFuelPrice(stations: Station[], fuel: FuelType): Station[] {
  return [...stations].sort((a, b) => {
    const priceA = getPriceForFuel(a, fuel);
    const priceB = getPriceForFuel(b, fuel);

    if (priceA === null && priceB === null) return 0;
    if (priceA === null) return 1;
    if (priceB === null) return -1;

    return priceA - priceB;
  });
}