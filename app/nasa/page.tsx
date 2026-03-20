"use client";

import { useEffect, useState } from "react";

const NASA_API_KEY = "lcc9F2jPNJsNABc865Gtw1Q36x8O18xvfWo2Bdny"; // Replace with your key from https://api.nasa.gov

interface APOD {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: "image" | "video";
  copyright?: string;
}

export default function NasaImageAPOD() {
  const [apod, setApod] = useState<APOD | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [visible, setVisible] = useState(false);

  const fetchAPOD = async (selectedDate = "") => {
    setLoading(true);
    setError(null);
    setVisible(false);
    try {
      const url = new URL("https://api.nasa.gov/planetary/apod");
      url.searchParams.set("api_key", NASA_API_KEY);
      if (selectedDate) url.searchParams.set("date", selectedDate);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`NASA API error: ${res.status}`);
      const data: APOD = await res.json();
      setApod(data);
      setTimeout(() => setVisible(true), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAPOD();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    if (e.target.value) fetchAPOD(e.target.value);
  };

  return (
    <main className="relative min-h-screen text-[#e8e4d9] font-serif overflow-x-hidden">

      {/* Header */}
      <header className="relative z-10 flex flex-wrap items-center gap-5 px-8 py-7 border-b border-[#c8a96e]/20 bg-gradient-to-b from-[#050608] to-transparent">
        <div className="bg-[#c8a96e] rounded px-3 py-1.5 shrink-0">
          <span className="font-sans font-black text-xl tracking-[3px] text-[#050608]">NASA</span>
        </div>

        <div>
          <h1 className="font-sans font-black text-3xl tracking-[4px] text-[#e8e4d9] leading-none uppercase">
            Astronomy Picture
          </h1>
          <p className="font-mono text-[11px]  tracking-[5px] uppercase mt-0.5">
            of the Day
          </p>
        </div>

        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          max={new Date().toISOString().split("T")[0]}
          min="1995-06-16"
          style={{ colorScheme: "dark" }}
          className="ml-auto bg-transparent border border-[#c8a96e]/30 rounded-md px-3.5 py-2 text-[#e8e4d9] font-mono text-sm cursor-pointer focus:outline-none focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20 transition-all"
        />
      </header>

      {/* Content */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12 pb-20">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-5 pt-32">
            <div className="w-12 h-12 rounded-full border-2 border-[#c8a96e]/20 border-t-[#c8a96e] animate-spin" />
            <p className="font-mono text-xs text-[#6a6660] tracking-[3px] uppercase">
              Reaching into the cosmos…
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center gap-4 pt-24 text-center">
            <span className="text-4xl text-[#c8a96e]">⚠</span>
            <p className="font-mono text-sm text-[#a09890] max-w-sm">{error}</p>
            <button
              onClick={() => fetchAPOD(date)}
              className="mt-2 border border-[#c8a96e] text-[#c8a96e] font-mono text-xs tracking-[2px] uppercase px-6 py-2.5 rounded hover:bg-[#c8a96e]/10 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Card */}
        {!loading && !error && apod && (
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
            className="rounded-xl overflow-hidden border border-[#c8a96e]/10 bg-[#0a0c10] shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
          >
            {/* Media */}
            <div className="relative w-full overflow-hidden bg-black">
              {apod.media_type === "video" ? (
                <iframe
                  src={apod.url}
                  title={apod.title}
                  className="w-full h-[480px] border-0 block"
                  allowFullScreen
                />
              ) : (
                <img
                  src={apod.hdurl ?? apod.url}
                  alt={apod.title}
                  className="w-full max-h-[600px] object-cover block"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#0a0c10] to-transparent pointer-events-none" />
            </div>

            {/* Info */}
            <div className="px-10 pt-8 pb-10">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="font-mono text-[11px] tracking-[3px] uppercase text-[#c8a96e] bg-[#c8a96e]/10 border border-[#c8a96e]/20 px-3 py-1 rounded">
                  {apod.date}
                </span>
                {apod.copyright && (
                  <span className="font-mono text-[11px] text-[#5a5650] tracking-wide">
                    © {apod.copyright.trim()}
                  </span>
                )}
              </div>

              <h2 className="font-sans font-black text-5xl tracking-[2px] leading-tight text-[#e8e4d9] mb-5 uppercase">
                {apod.title}
              </h2>

              <p className="text-[17px] leading-relaxed text-[#b0aa9e] font-light max-w-3xl mb-7">
                {apod.explanation}
              </p>

              {apod.hdurl && apod.media_type === "image" && (
                <a
                  href={apod.hdurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-mono text-xs tracking-[2px] text-[#c8a96e] border-b border-[#c8a96e]/30 pb-0.5 hover:opacity-70 transition-opacity"
                >
                  View Full Resolution ↗
                </a>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}