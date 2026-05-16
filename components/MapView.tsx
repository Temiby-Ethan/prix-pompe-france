"use client";

import { useEffect } from "react";
import L, { DivIcon } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { FuelType, Station } from "@/types/station";
import { getMarkerPriceColor, getPriceForFuel } from "@/lib/filters";
import "leaflet/dist/leaflet.css";

type Props = {
  stations: Station[];
  selectedFuel: FuelType;
};

function createPriceIcon(price: number | null, color: "green" | "orange" | "red" | "gray"): DivIcon {
  const label = price !== null ? price.toFixed(3) : "N/A";

  return L.divIcon({
    className: "custom-price-marker-wrapper",
    html: `
      <div class="custom-price-marker ${color}">
        <span>${label}</span>
      </div>
    `,
    iconSize: [58, 28],
    iconAnchor: [29, 28],
    popupAnchor: [0, -28],
  });
}

function createClusterIcon(count: number): DivIcon {
  let sizeClass = "small";
  if (count >= 50) sizeClass = "large";
  else if (count >= 20) sizeClass = "medium";

  return L.divIcon({
    className: "cluster-icon-wrapper",
    html: `
      <div class="cluster-icon ${sizeClass}">
        <span>${count}</span>
      </div>
    `,
    iconSize: [48, 48],
  });
}

function FitToStations({ stations }: { stations: Station[] }) {
  const map = useMap();

  useEffect(() => {
    if (stations.length === 0) {
      map.setView([46.603354, 1.888334], 6);
      return;
    }

    if (stations.length === 1) {
      map.setView([stations[0].lat, stations[0].lon], 12);
      return;
    }

    const bounds = L.latLngBounds(
      stations.map((station) => [station.lat, station.lon] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, stations]);

  return null;
}

export default function MapView({ stations, selectedFuel }: Props) {
  return (
    <div className="map-shell">
      <MapContainer
        center={[46.603354, 1.888334]}
        zoom={6}
        scrollWheelZoom
        className="map-root"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitToStations stations={stations} />

        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          spiderfyOnMaxZoom
          maxClusterRadius={45}
          iconCreateFunction={(cluster: { getChildCount: () => number }) =>createClusterIcon(cluster.getChildCount())}
        >
          {stations.map((station) => {
            const selectedPrice = getPriceForFuel(station, selectedFuel);
            const color = getMarkerPriceColor(selectedPrice, selectedFuel);

            return (
              <Marker
                key={`${station.id}-${selectedFuel}`}
                position={[station.lat, station.lon]}
                icon={createPriceIcon(selectedPrice, color)}
              >
                <Popup>
                  <div className="popup-content">
                    <h3>{station.name}</h3>
                    <p>{station.address}</p>
                    <p>
                      {station.city} ({station.postalCode}) — Dép. {station.department}
                    </p>

                    <div className="popup-selected-price">
                      <span>{selectedFuel}</span>
                      <strong>
                        {selectedPrice !== null ? `${selectedPrice.toFixed(3)} €` : "Indisponible"}
                      </strong>
                    </div>

                    <div className="popup-prices">
                      {station.prices.map((price) => (
                        <div key={price.fuelType} className="popup-price-row">
                          <span>{price.fuelType}</span>
                          <strong>{price.price.toFixed(3)} €</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}