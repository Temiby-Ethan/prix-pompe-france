import { NextRequest, NextResponse } from "next/server";
import { getCachedStationsData } from "@/lib/stationsCache";
import {
  findBigCityInSearch,
  findRegionInSearch,
  normalizeText,
  REGIONS,
} from "@/lib/locationTargets";

function matchesCity(stationCity: string, searchedCity: string): boolean {
  const normalizedStationCity = normalizeText(stationCity);
  const normalizedSearchedCity = normalizeText(searchedCity);

  return (
    normalizedStationCity === normalizedSearchedCity ||
    normalizedStationCity.startsWith(`${normalizedSearchedCity} `) ||
    normalizedSearchedCity.startsWith(`${normalizedStationCity} `)
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = (searchParams.get("department") || "").trim().toUpperCase();
    const search = (searchParams.get("search") || "").trim();

    const { stations } = await getCachedStationsData();

    if (department) {
      const filtered = stations.filter(
        (station) => station.department.toUpperCase() === department
      );

      return NextResponse.json(filtered.slice(0, 600), { status: 200 });
    }

    if (search) {
      const matchedCity = findBigCityInSearch(search);
      if (matchedCity) {
        const filtered = stations.filter((station) =>
          matchesCity(station.city, matchedCity)
        );

        return NextResponse.json(filtered.slice(0, 1200), { status: 200 });
      }

      const matchedRegion = findRegionInSearch(search);
      if (matchedRegion) {
        const departmentCodes = REGIONS[matchedRegion] ?? [];

        const filtered = stations.filter((station) =>
          departmentCodes.includes(station.department)
        );

        return NextResponse.json(filtered.slice(0, 1800), { status: 200 });
      }
    }

    return NextResponse.json(stations.slice(0, 2600), { status: 200 });
  } catch (error) {
    console.error("Erreur API stations:", error);

    return NextResponse.json(
      { error: "Impossible de récupérer les données carburant" },
      { status: 500 }
    );
  }
}