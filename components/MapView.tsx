"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { Station, FuelType } from "@/types/station";
import { getPriceForFuel } from "@/lib/filters";
import "leaflet/dist/leaflet.css";

type Props = {
  stations: Station[];
  selectedFuel: FuelType;
};

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView({ stations, selectedFuel }: Props) {
  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={[46.603354, 1.888334]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", borderRadius: "8px" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map((station) => {
          const price = getPriceForFuel(station, selectedFuel);

          return (
            <Marker key={station.id} position={[station.lat, station.lon]}>
              <Popup>
                <div>
                  <strong>{station.name}</strong>
                  <br />
                  {station.address}
                  <br />
                  {station.city} ({station.postalCode})
                  <br />
                  <br />
                  {price !== null ? (
                    <span>
                      {selectedFuel} : <strong>{price.toFixed(3)} €</strong>
                    </span>
                  ) : (
                    <span>Prix indisponible</span>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}