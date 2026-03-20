"use client";

import { useEffect, useState } from "react";

interface Country {
  cca3: string;
  name: { common: string; official: string };
  flags: { svg: string; png: string; alt?: string };
  capital?: string[];
  region: string;
  subregion?: string;
  population: number;
  area: number;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol: string }>;
  borders?: string[];
  timezones: string[];
  tld?: string[];
  continents: string[];
  independent?: boolean;
  unMember?: boolean;
  latlng: [number, number];
  maps: { googleMaps: string; openStreetMaps: string };
  coatOfArms?: { svg?: string };
}

const REGIONS = ["All", "Africa", "Americas", "Asia", "Europe", "Oceania"];

function formatNumber(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

async function fetchAllCountries(): Promise<Country[]> {
  const FIELDS_1 = "cca3,name,flags,capital,region,subregion,population,area,languages,currencies";
  const FIELDS_2 = "cca3,borders,timezones,tld,continents,independent,unMember,latlng,maps,coatOfArms";
  const [res1, res2] = await Promise.all([
    fetch(`https://restcountries.com/v3.1/all?fields=${FIELDS_1}`, { headers: { Accept: "application/json" } }),
    fetch(`https://restcountries.com/v3.1/all?fields=${FIELDS_2}`, { headers: { Accept: "application/json" } }),
  ]);
  if (!res1.ok) throw new Error(`HTTP ${res1.status}`);
  if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
  const [data1, data2]: [Country[], Country[]] = await Promise.all([res1.json(), res2.json()]);
  const map2 = new Map(data2.map((c) => [c.cca3, c]));
  const data = data1.map((c) => ({ ...c, ...map2.get(c.cca3) }));
  if (!Array.isArray(data)) throw new Error("Unexpected response format");
  return data as Country[];
}

export default function RestCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filtered, setFiltered] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [selected, setSelected] = useState<Country | null>(null);
  const [borderNames, setBorderNames] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<"name" | "population" | "area">("name");

  const loadCountries = () => {
    setLoading(true);
    setError(null);
    fetchAllCountries()
      .then((data) => { setCountries(data); setFiltered(data); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCountries(); }, []);

  useEffect(() => {
    let result = [...countries];
    if (region !== "All") result = result.filter((c) => c.region === region);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.common.toLowerCase().includes(q) ||
          c.name.official.toLowerCase().includes(q) ||
          c.capital?.some((cap) => cap.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => {
      if (sortBy === "population") return b.population - a.population;
      if (sortBy === "area") return (b.area ?? 0) - (a.area ?? 0);
      return a.name.common.localeCompare(b.name.common);
    });
    setFiltered(result);
  }, [search, region, sortBy, countries]);

  useEffect(() => {
    if (!selected?.borders?.length || !countries.length) return;
    const map: Record<string, string> = {};
    selected.borders.forEach((code) => {
      const match = countries.find((c) => c.cca3 === code);
      if (match) map[code] = match.name.common;
    });
    setBorderNames((prev) => ({ ...prev, ...map }));
  }, [selected, countries]);

  const openDetail = (country: Country) => {
    setSelected(country);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans text-slate-800">

      {/* Detail modal */}
      {selected && (
        <div className="fixed top-16 inset-x-0 bottom-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl shadow-slate-200 mb-10 border border-slate-100">

            {/* Header */}
            <div className="relative h-52 rounded-t-3xl overflow-hidden bg-slate-100">
              <img
                src={selected.flags.svg || selected.flags.png}
                alt={selected.flags.alt ?? selected.name.common}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-6 right-16">
                <h2 className="text-3xl font-black tracking-tight text-white drop-shadow">{selected.name.common}</h2>
                <p className="text-white/70 text-sm mt-0.5 truncate">{selected.name.official}</p>
              </div>
              {selected.coatOfArms?.svg && (
                <img src={selected.coatOfArms.svg} alt="Coat of arms" className="absolute bottom-4 right-6 h-14 w-14 object-contain drop-shadow-lg" />
              )}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 bg-black/20 hover:bg-white/40 backdrop-blur rounded-full w-9 h-9 flex items-center justify-center text-white transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Flag thumbnail */}
            <div className="px-6 -mt-5 mb-5 relative z-10">
              <img
                src={selected.flags.svg || selected.flags.png}
                alt={selected.flags.alt}
                className="w-20 h-14 object-cover rounded-xl border-4 border-white shadow-md"
              />
            </div>

            {/* Info grid */}
            <div className="px-6 pb-6 grid grid-cols-2 gap-3">
              {[
                { label: "🌍 Region", value: `${selected.region}${selected.subregion ? ` — ${selected.subregion}` : ""}` },
                { label: "🏙️ Capital", value: selected.capital?.join(", ") ?? "N/A" },
                { label: "👥 Population", value: selected.population.toLocaleString() },
                { label: "📐 Area", value: selected.area ? `${selected.area.toLocaleString()} km²` : "N/A" },
                { label: "🗣️ Languages", value: selected.languages ? Object.values(selected.languages).join(", ") : "N/A" },
                { label: "💰 Currencies", value: selected.currencies ? Object.values(selected.currencies).map((c) => `${c.name} (${c.symbol})`).join(", ") : "N/A" },
                { label: "🌐 TLD", value: selected.tld?.join(", ") ?? "N/A" },
                { label: "🕐 Timezones", value: selected.timezones.slice(0, 3).join(", ") + (selected.timezones.length > 3 ? "…" : "") },
                { label: "🇺🇳 UN Member", value: selected.unMember ? "Yes" : "No" },
                { label: "🗺️ Coordinates", value: `${selected.latlng[0].toFixed(2)}°, ${selected.latlng[1].toFixed(2)}°` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                  <p className="text-slate-400 text-[10px] font-mono tracking-widest uppercase mb-1">{label}</p>
                  <p className="text-sm font-semibold text-slate-700 leading-snug">{value}</p>
                </div>
              ))}

              {/* Borders */}
              {selected.borders && selected.borders.length > 0 && (
                <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                  <p className="text-slate-400 text-[10px] font-mono tracking-widest uppercase mb-2">🗺️ Borders</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.borders.map((code) => {
                      const neighbor = countries.find((c) => c.cca3 === code);
                      return (
                        <button
                          key={code}
                          onClick={() => neighbor && openDetail(neighbor)}
                          className="bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-700 rounded-lg px-3 py-1 text-xs font-mono transition-all cursor-pointer shadow-sm"
                        >
                          {borderNames[code] ?? code}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Map link */}
              <div className="col-span-2">
                <a
                  href={selected.maps.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 rounded-2xl py-3 text-white font-semibold text-sm transition-colors shadow-md shadow-indigo-200"
                >
                  🗺️ Open in Google Maps ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page */}
      <div className="max-w-7xl mx-auto px-5 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black tracking-tight text-slate-800">🌍 World Countries</h1>
          <p className="text-slate-400 font-mono text-xs tracking-widest uppercase mt-2">REST Countries API — v3.1</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or capital…"
            className="flex-1 min-w-[200px] bg-white border border-slate-200 shadow-sm rounded-2xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
          />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl px-4 py-2.5 text-sm font-mono text-slate-700 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "population" | "area")}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl px-4 py-2.5 text-sm font-mono text-slate-700 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="name">Sort: Name</option>
            <option value="population">Sort: Population</option>
            <option value="area">Sort: Area</option>
          </select>
        </div>

        {!loading && !error && (
          <p className="text-slate-400 font-mono text-xs mb-4">{filtered.length} countries</p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-24">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-100 border-t-indigo-500 animate-spin" />
            <p className="font-mono text-xs text-slate-400 tracking-widest uppercase">Loading countries…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="text-5xl">🌐</span>
            <p className="font-bold text-lg text-slate-700">Could not load countries</p>
            <p className="font-mono text-sm text-slate-400 max-w-sm">
              {error}. The REST Countries API requires valid fields params.
            </p>
            <button
              onClick={loadCountries}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs tracking-widest uppercase px-6 py-2.5 rounded-2xl transition-colors cursor-pointer shadow-md shadow-indigo-200"
            >
              Try Again
            </button>
            <a
              href="https://restcountries.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 font-mono text-xs underline underline-offset-4"
            >
              Check API status ↗
            </a>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((country) => (
              <button
                key={country.cca3}
                onClick={() => openDetail(country)}
                className="group bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-2xl overflow-hidden text-left transition-all cursor-pointer shadow-sm hover:shadow-md hover:shadow-indigo-100 hover:-translate-y-0.5"
              >
                <div className="aspect-[3/2] overflow-hidden bg-slate-100">
                  <img
                    src={country.flags.svg || country.flags.png}
                    alt={country.flags.alt ?? country.name.common}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm leading-tight truncate text-slate-800">{country.name.common}</p>
                  <p className="text-slate-400 text-[10px] font-mono mt-0.5 truncate">{country.capital?.[0] ?? "—"}</p>
                  <p className="text-slate-300 text-[10px] font-mono mt-1">👥 {formatNumber(country.population)}</p>
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-400 font-mono text-sm">
                No countries match your search.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}