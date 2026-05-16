"use client";

import { FuelType, Station } from "@/types/station";
import { getPriceForFuel } from "@/lib/filters";

type Props = {
  stations: Station[];
  selectedFuel: FuelType;
};

export default function StationList({ stations, selectedFuel }: Props) {
  return (
    <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Stations ({stations.length})</h2>

      {stations.length === 0 ? (
        <p>Aucune station trouvée.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {stations.map((station) => {
            const price = getPriceForFuel(station, selectedFuel);

            return (
              <li
                key={station.id}
                style={{
                  marginBottom: "1rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                <strong>{station.name}</strong>
                <br />
                {station.city} ({station.postalCode})
                <br />
                {price !== null ? (
                  <span>
                    {selectedFuel} : <strong>{price.toFixed(3)} €</strong>
                  </span>
                ) : (
                  <span>Prix indisponible</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}