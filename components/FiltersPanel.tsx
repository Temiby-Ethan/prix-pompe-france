"use client";

import { FuelType } from "@/types/station";
import { FilterState } from "@/lib/filters";

type Props = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
};

const fuelOptions: FuelType[] = ["Gazole", "SP95", "SP98", "E10", "E85", "GPL"];

export default function FiltersPanel({ filters, onChange }: Props) {
  return (
    <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Filtres</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>Carburant</label>
        <br />
        <select
          value={filters.selectedFuel}
          onChange={(e) =>
            onChange({ ...filters, selectedFuel: e.target.value as FuelType })
          }
        >
          {fuelOptions.map((fuel) => (
            <option key={fuel} value={fuel}>
              {fuel}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Prix maximum</label>
        <br />
        <input
          type="number"
          step="0.01"
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
          placeholder="Ex: 1.80"
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Département</label>
        <br />
        <input
          type="text"
          value={filters.department}
          onChange={(e) => onChange({ ...filters, department: e.target.value })}
          placeholder="Ex: 75"
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Recherche</label>
        <br />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Ville, nom, code postal"
        />
      </div>

      <button
        onClick={() =>
          onChange({
            selectedFuel: "Gazole",
            maxPrice: "",
            department: "",
            search: "",
          })
        }
      >
        Réinitialiser
      </button>
    </div>
  );
}