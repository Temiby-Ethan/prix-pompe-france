"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import FiltersPanel from "@/components/FiltersPanel";
import StationList from "@/components/StationList";
import { Station } from "@/types/station";
import { FilterState, filterStations, sortStationsByFuelPrice } from "@/lib/filters";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function HomePage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    selectedFuel: "Gazole",
    maxPrice: "",
    department: "",
    search: "",
  });

  useEffect(() => {
    async function fetchStations() {
      try {
        const res = await fetch("/api/stations");
        const data = await res.json();
        setStations(data);
      } catch (error) {
        console.error("Erreur chargement stations :", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStations();
  }, []);

  const filteredStations = useMemo(() => {
    const filtered = filterStations(stations, filters);
    return sortStationsByFuelPrice(filtered, filters.selectedFuel);
  }, [stations, filters]);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Carte des prix à la pompe en France</h1>
      <p>Comparatif des stations-service avec filtres dynamiques.</p>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "1rem",
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: "1rem" }}>
            <FiltersPanel filters={filters} onChange={setFilters} />
            <StationList
              stations={filteredStations}
              selectedFuel={filters.selectedFuel}
            />
          </div>

          <MapView
            stations={filteredStations}
            selectedFuel={filters.selectedFuel}
          />
        </div>
      )}
    </main>
  );
}