export type FuelType = "Gazole" | "SP95" | "SP98" | "E10" | "E85" | "GPLc";

export type FuelPrice = {
  fuelType: FuelType;
  price: number;
  updatedAt?: string;
};

export type Station = {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  department: string;
  lat: number;
  lon: number;
  prices: FuelPrice[];
};