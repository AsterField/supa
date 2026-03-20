// app/api/dns/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.SECURITYTRAILS_API_KEY!;
const BASE    = "https://api.securitytrails.com/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const record = searchParams.get("record"); // a | aaaa | mx | ns | txt | soa | cname

  if (!domain) return NextResponse.json({ error: "Missing domain" }, { status: 400 });
  if (!record) return NextResponse.json({ error: "Missing record type" }, { status: 400 });

  try {
    const url = `${BASE}/history/${encodeURIComponent(domain)}/dns/${record}`;
    const res  = await fetch(url, {
      headers: { apikey: API_KEY, "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message ?? data.error ?? `SecurityTrails error ${res.status}` },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}