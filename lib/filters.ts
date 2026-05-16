import { FuelType, Station } from "@/types/station";

export type FilterState = {
  selectedFuel: FuelType;
  maxPrice: string;
  department: string;
  search: string;
};

export function getPriceForFuel(station: Station, fuel: FuelType): number | null {
  const fuelData = station.prices.find((p) => p.fuelType === fuel);
  return fuelData ? fuelData.price : null;
}

export function filterStations(stations: Station[], filters: FilterState): Station[] {
  const { selectedFuel, maxPrice, department, search } = filters;

  return stations.filter((station) => {
    const fuelPrice = getPriceForFuel(station, selectedFuel);

    if (fuelPrice === null) return false;

    if (maxPrice && fuelPrice > Number(maxPrice)) return false;

    if (department && station.department !== department) return false;

    if (search) {
      const text = `${station.name} ${station.city} ${station.postalCode}`.toLowerCase();
      if (!text.includes(search.toLowerCase())) return false;
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