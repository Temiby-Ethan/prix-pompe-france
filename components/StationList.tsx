"use client";

import { FuelType, Station } from "@/types/station";
import { getMarkerPriceColor, getPriceForFuel } from "@/lib/filters";

type Props = {
  stations: Station[];
  selectedFuel: FuelType;
};

export default function StationList({ stations, selectedFuel }: Props) {
  const visibleStations = stations.slice(0, 30);

  return (
    <section className="panel panel-section stations-panel">
      <div className="panel-heading">
        <h2>Stations</h2>
        <span className="panel-badge">{stations.length}</span>
      </div>

      {stations.length === 0 ? (
        <p className="empty-state">Aucune station trouvée.</p>
      ) : (
        <div className="station-list">
          {visibleStations.map((station) => {
            const price = getPriceForFuel(station, selectedFuel);
            const color = getMarkerPriceColor(price, selectedFuel);

            return (
              <article key={station.id} className="station-card">
                <div className="station-top">
                  <div>
                    <h3>{station.name}</h3>
                    <p className="station-city">
                      {station.city} ({station.postalCode})
                    </p>
                  </div>

                  <div className={`price-chip ${color}`}>
                    {price !== null ? `${price.toFixed(3)} €` : "N/A"}
                  </div>
                </div>

                <p className="station-address">{station.address}</p>
                <p className="station-meta">Département {station.department}</p>
              </article>
            );
          })}
        </div>
      )}

      {stations.length > 30 && (
        <p className="panel-footnote">
          Seules les 30 premières stations sont affichées dans cette liste.
        </p>
      )}
    </section>
  );
}