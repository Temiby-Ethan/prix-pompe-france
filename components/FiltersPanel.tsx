"use client";

import { FuelType } from "@/types/station";
import { FuelBounds } from "@/types/stationMeta";
import { FilterState, getFuelPriceThresholds } from "@/lib/filters";

type Props = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  loading: boolean;
  priceBounds: FuelBounds | null;
};

const fuelOptions: FuelType[] = ["Gazole", "SP95", "SP98", "E10", "E85", "GPLc"];

export default function FiltersPanel({
  filters,
  onChange,
  loading,
  priceBounds,
}: Props) {
  const thresholds = getFuelPriceThresholds(filters.selectedFuel);
  const currentBounds = priceBounds?.[filters.selectedFuel] ?? { min: 0, max: 3 };

  const sliderValue =
    filters.maxPrice !== ""
      ? Number(filters.maxPrice)
      : currentBounds.max;

  return (
    <section className="panel panel-section">
      <div className="panel-heading">
        <h2>Filtres</h2>
        {loading && <span className="panel-badge">Chargement...</span>}
      </div>

      <div className="field-group">
        <label htmlFor="fuel">Carburant</label>
        <select
          id="fuel"
          value={filters.selectedFuel}
          onChange={(e) =>
            onChange({
              ...filters,
              selectedFuel: e.target.value as FuelType,
            })
          }
        >
          {fuelOptions.map((fuel) => (
            <option key={fuel} value={fuel}>
              {fuel}
            </option>
          ))}
        </select>
      </div>

      <div className="field-group">
        <div className="slider-header">
          <label htmlFor="price-max">Prix maximum</label>
          <strong>{sliderValue.toFixed(3)} €</strong>
        </div>

        <input
          id="price-max"
          type="range"
          min={currentBounds.min}
          max={currentBounds.max}
          step={0.001}
          value={sliderValue}
          onChange={(e) =>
            onChange({
              ...filters,
              maxPrice: Number(e.target.value).toFixed(3),
            })
          }
        />

        <div className="slider-scale">
          <span>{currentBounds.min.toFixed(3)} €</span>
          <span>{currentBounds.max.toFixed(3)} €</span>
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="department">Département</label>
        <input
          id="department"
          type="text"
          value={filters.department}
          onChange={(e) => onChange({ ...filters, department: e.target.value.toUpperCase() })}
          placeholder="Ex : 75"
          maxLength={3}
        />
      </div>

      <div className="field-group">
        <label htmlFor="search">Recherche</label>
        <input
          id="search"
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Ville, région, adresse, code postal"
        />
      </div>

      <div className="legend-block">
        <div className="legend-title">Légende des prix</div>

        <div className="legend-row">
          <span className="legend-dot green" />
          <span>Bas</span>
          <strong>{`< ${thresholds.greenMax.toFixed(3)} €`}</strong>
        </div>

        <div className="legend-row">
          <span className="legend-dot orange" />
          <span>Intermédiaire</span>
          <strong>
            {`${thresholds.greenMax.toFixed(3)} € - ${thresholds.orangeMax.toFixed(3)} €`}
          </strong>
        </div>

        <div className="legend-row">
          <span className="legend-dot red" />
          <span>Élevé</span>
          <strong>{`≥ ${thresholds.orangeMax.toFixed(3)} €`}</strong>
        </div>
      </div>

      <button
        className="secondary-button"
        onClick={() =>
          onChange({
            selectedFuel: "Gazole",
            maxPrice: currentBounds.max.toFixed(3),
            department: "",
            search: "",
          })
        }
      >
        Réinitialiser
      </button>
    </section>
  );
}