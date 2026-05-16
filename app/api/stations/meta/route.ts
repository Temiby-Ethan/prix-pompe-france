import { NextResponse } from "next/server";
import { getCachedStationsData } from "@/lib/stationsCache";

export async function GET() {
  try {
    const { bounds, fetchedAt } = await getCachedStationsData();

    return NextResponse.json(
      {
        bounds,
        fetchedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur API stations meta:", error);

    return NextResponse.json(
      { error: "Impossible de récupérer les métadonnées des stations" },
      { status: 500 }
    );
  }
}