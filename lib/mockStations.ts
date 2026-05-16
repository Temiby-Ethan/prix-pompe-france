import { Station } from "@/types/station";

export const mockStations: Station[] = [
  {
    id: "1",
    name: "TotalEnergies Paris",
    address: "10 Rue Exemple",
    city: "Paris",
    postalCode: "75015",
    department: "75",
    lat: 48.841,
    lon: 2.292,
    prices: [
      { fuelType: "Gazole", price: 1.78 },
      { fuelType: "SP98", price: 1.91 },
      { fuelType: "E10", price: 1.84 },
    ],
  },
  {
    id: "2",
    name: "Carrefour Lyon",
    address: "25 Avenue Test",
    city: "Lyon",
    postalCode: "69003",
    department: "69",
    lat: 45.760,
    lon: 4.857,
    prices: [
      { fuelType: "Gazole", price: 1.74 },
      { fuelType: "SP95", price: 1.86 },
      { fuelType: "E85", price: 0.92 },
    ],
  },
  {
    id: "3",
    name: "Intermarché Marseille",
    address: "5 Boulevard Demo",
    city: "Marseille",
    postalCode: "13008",
    department: "13",
    lat: 43.280,
    lon: 5.370,
    prices: [
      { fuelType: "Gazole", price: 1.76 },
      { fuelType: "SP98", price: 1.90 },
      { fuelType: "GPL", price: 0.99 },
    ],
  },
];