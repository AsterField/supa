// app/api/weather/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.OPENWEATHER_API_KEY!;
const BASE = "https://api.openweathermap.org/data/2.5";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");      // "weather" | "forecast" | "air"
  const city = searchParams.get("city");
  const lat  = searchParams.get("lat");
  const lon  = searchParams.get("lon");
  const units = searchParams.get("units") ?? "metric";

  if (!type) return NextResponse.json({ error: "Missing type" }, { status: 400 });

  try {
    let url = "";

    if (type === "weather" && city) {
      url = `${BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}`;
    } else if (type === "forecast" && city) {
      url = `${BASE}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}&cnt=40`;
    } else if (type === "air" && lat && lon) {
      url = `${BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    } else {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message ?? "API error" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}