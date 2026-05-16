"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import FiltersPanel from "@/components/FiltersPanel";
import StationList from "@/components/StationList";
import { Station } from "@/types/station";
import { FuelBounds } from "@/types/stationMeta";
import { FilterState, filterStations, sortStationsByFuelPrice } from "@/lib/filters";
import {
  findBigCityInSearch,
  findRegionInSearch,
  toDisplayLabel,
} from "@/lib/locationTargets";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

function getDefaultBounds(): FuelBounds {
  return {
    Gazole: { min: 0, max: 3 },
    SP95: { min: 0, max: 3 },
    SP98: { min: 0, max: 3 },
    E10: { min: 0, max: 3 },
    E85: { min: 0, max: 2 },
    GPLc: { min: 0, max: 2 },
  };
}

export default function HomePage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debouncedDepartment, setDebouncedDepartment] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priceBounds, setPriceBounds] = useState<FuelBounds | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    selectedFuel: "Gazole",
    maxPrice: "",
    department: "",
    search: "",
  });

  useEffect(() => {
    async function fetchMeta() {
      try {
        const res = await fetch("/api/stations/meta");

        if (!res.ok) {
          throw new Error("Impossible de charger les métadonnées");
        }

        const data = await res.json();
        setPriceBounds(data.bounds);
      } catch (err) {
        console.error(err);
        setPriceBounds(getDefaultBounds());
      }
    }

    fetchMeta();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedDepartment(filters.department.trim());
    }, 700);

    return () => clearTimeout(timeout);
  }, [filters.department]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 700);

    return () => clearTimeout(timeout);
  }, [filters.search]);

  useEffect(() => {
    const bounds = priceBounds?.[filters.selectedFuel];
    if (!bounds) return;

    const numericMaxPrice = Number(filters.maxPrice);

    if (
      filters.maxPrice === "" ||
      Number.isNaN(numericMaxPrice) ||
      numericMaxPrice < bounds.min ||
      numericMaxPrice > bounds.max
    ) {
      setFilters((prev) => ({
        ...prev,
        maxPrice: bounds.max.toFixed(3),
      }));
    }
  }, [filters.selectedFuel, priceBounds]);

  useEffect(() => {
    async function fetchStations() {
      try {
        setLoading(true);
        setError("");

        let url = "/api/stations";

        if (debouncedDepartment) {
          url = `/api/stations?department=${encodeURIComponent(debouncedDepartment)}`;
        } else {
          const matchedCity = findBigCityInSearch(debouncedSearch);
          const matchedRegion = findRegionInSearch(debouncedSearch);

          if (matchedCity || matchedRegion) {
            url = `/api/stations?search=${encodeURIComponent(debouncedSearch)}`;
          }
        }

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("Impossible de charger les stations");
        }

        const data = await res.json();
        setStations(data);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    }

    fetchStations();
  }, [debouncedDepartment, debouncedSearch]);

  const filteredStations = useMemo(() => {
    const filtered = filterStations(stations, filters);
    return sortStationsByFuelPrice(filtered, filters.selectedFuel);
  }, [stations, filters]);

  function getResultsContext(): string {
    if (debouncedDepartment) {
      return `Département ${debouncedDepartment}`;
    }

    const matchedCity = findBigCityInSearch(debouncedSearch);
    if (matchedCity) {
      return `Ville : ${toDisplayLabel(matchedCity)}`;
    }

    const matchedRegion = findRegionInSearch(debouncedSearch);
    if (matchedRegion) {
      return `Région : ${toDisplayLabel(matchedRegion)}`;
    }

    return "Échantillon national";
  }

  const lowestPrice =
    filteredStations.length > 0
      ? filteredStations[0].prices.find((p) => p.fuelType === filters.selectedFuel)?.price ?? null
      : null;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="topbar-copy">
          <p className="eyebrow">Comparateur carburant</p>
          <h1>Carte des stations et prix à la pompe</h1>
          <p className="subtitle">
            Recherchez par département, grande ville ou région, puis comparez rapidement les prix.
          </p>
        </div>

        <div className="topbar-stats">
          <div className="stat-card">
            <span className="stat-label">Résultats</span>
            <strong>{filteredStations.length}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Contexte</span>
            <strong>{getResultsContext()}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Prix le plus bas</span>
            <strong>{lowestPrice !== null ? `${lowestPrice.toFixed(3)} €` : "N/A"}</strong>
          </div>
        </div>
      </header>

      {error && <p className="error-banner">{error}</p>}

      <section className="map-page">
        <MapView stations={filteredStations} selectedFuel={filters.selectedFuel} />

        <aside className="floating-sidebar">
          <FiltersPanel
            filters={filters}
            onChange={setFilters}
            loading={loading}
            priceBounds={priceBounds}
          />
          <StationList stations={filteredStations} selectedFuel={filters.selectedFuel} />
        </aside>
      </section>
    </main>
  );
}