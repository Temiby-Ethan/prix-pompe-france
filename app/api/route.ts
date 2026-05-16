import { NextResponse } from "next/server";
import { mockStations } from "@/lib/mockStations";

export async function GET() {
  return NextResponse.json(mockStations);
}