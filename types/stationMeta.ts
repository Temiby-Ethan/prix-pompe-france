import { FuelType } from "@/types/station";

export type FuelBounds = Record<FuelType, { min: number; max: number }>;