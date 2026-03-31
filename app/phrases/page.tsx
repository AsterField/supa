"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";

type Phrase = {
  id: string;
  text: string;
  category: string | null;
  learned: boolean;
  created_at: string;
};

export default function PhrasesPage() {
  const supabase = createClient();

  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function fetchPhrases() {
    const { data, error } = await supabase
      .from("phrases")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setPhrases(data ?? []);
  }

  useEffect(() => {
    fetchPhrases();
  }, []);

  async function addPhrase() {
    if (!text.trim()) return;
    setError(null);

    const { error } = await supabase.from("phrases").insert({
      text: text.trim(),
      category: category.trim() || null,
    });

    if (error) {
      setError(error.message);
    } else {
      setText("");
      setCategory("");
      fetchPhrases();
    }
  }

  async function deletePhrase(id: string) {
    const { error } = await supabase.from("phrases").delete().eq("id", id);
    if (error) setError(error.message);
    else fetchPhrases();
  }

  async function toggleLearned(id: string, current: boolean) {
    const { error } = await supabase
      .from("phrases")
      .update({ learned: !current })
      .eq("id", id);
    if (error) setError(error.message);
    else fetchPhrases();
  }

  const [filter, setFilter] = useState<"all" | "learned" | "unlearned">("all");

  const filtered = phrases.filter((p) => {
    const matchesSearch =
      p.text.toLowerCase().includes(search.toLowerCase()) ||
      (p.category ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "learned" && p.learned) ||
      (filter === "unlearned" && !p.learned);
    return matchesSearch && matchesFilter;
  });

  const categories = Array.from(
    new Set(phrases.map((p) => p.category).filter(Boolean))
  ) as string[];

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-zinc-800 selection:bg-zinc-200 p-6 md:p-12 lg:p-24 font-sans">
  <div className="max-w-[85rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

    {/* LEFT COLUMN: Sticky Header & Form */}
    <div className="lg:col-span-4 xl:col-span-3">
      <div className="lg:sticky lg:top-24">
        
        {/* Header */}
        <header className="mb-12">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-400 mb-4 block">
            Diario
          </span>
          <h1 className="text-4xl lg:text-5xl font-normal font-['Georgia',serif] italic text-zinc-900 tracking-tight leading-tight">
            Phrases
          </h1>
          <div className="mt-8 h-[1px] w-12 bg-zinc-200" />
        </header>

        {/* Add form - Floating & Borderless */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-zinc-100/50 transition-all duration-500 focus-within:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Scrivi qualcosa di nuovo..."
            rows={3}
            className="w-full bg-transparent font-['Georgia',serif] text-xl text-zinc-800 placeholder:text-zinc-300 placeholder:italic resize-none focus:outline-none leading-relaxed transition-colors"
          />
          
          <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-zinc-50">
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Add tag..."
              list="categories"
              className="w-full bg-transparent text-sm text-zinc-600 placeholder:text-zinc-400 focus:outline-none transition-colors"
            />
            <datalist id="categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <button
              onClick={() => startTransition(addPhrase)}
              disabled={!text.trim() || isPending}
              className="w-full py-3 bg-zinc-900 text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl hover:bg-zinc-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 active:scale-95"
            >
              {isPending ? "Saving..." : "Save Phrase"}
            </button>
          </div>
          {error && (
            <p className="mt-4 text-[11px] text-red-400 uppercase tracking-widest text-center">{error}</p>
          )}
        </div>
      </div>
    </div>

    {/* RIGHT COLUMN: Search & Split Lists */}
    <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
      
      {/* Global Search */}
      {phrases.length > 0 && (
        <div className="mb-16 relative group max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your library..."
            className="w-full bg-transparent border-b border-zinc-200 py-3 pl-1 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
          />
        </div>
      )}

      {/* Split Columns for Phrases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
        
        {/* Column 1: Unlearned / To Learn */}
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400 mb-8 border-b border-zinc-100 pb-4 flex justify-between">
            <span>To Learn</span>
            <span>{phrases.filter((p) => !p.learned).length}</span>
          </h2>
          
          <ul className="flex flex-col space-y-2">
            {phrases.filter(p => !p.learned && (p.text.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()))).map((phrase) => (
              <li key={phrase.id} className="group relative flex items-start gap-4 py-4 px-3 -mx-3 rounded-2xl hover:bg-zinc-50/80 transition-all duration-300">
                <button
                  onClick={() => toggleLearned(phrase.id, phrase.learned)}
                  className="mt-1.5 shrink-0 w-4 h-4 rounded-full border border-zinc-300 bg-white group-hover:border-zinc-500 transition-all duration-300"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-['Georgia',serif] text-zinc-800 leading-relaxed">
                    {phrase.text}
                  </p>
                  <div className="flex items-center gap-3 mt-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                    {phrase.category && (
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 px-2 py-0.5 rounded-sm">
                        {phrase.category}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deletePhrase(phrase.id)}
                  className="mt-1 text-zinc-300 hover:text-red-400 transition-all duration-300 opacity-0 group-hover:opacity-100 text-xl font-light"
                >
                  ×
                </button>
              </li>
            ))}
            {phrases.filter(p => !p.learned).length === 0 && (
              <p className="text-zinc-400 font-['Georgia',serif] italic text-sm py-4">No phrases to learn.</p>
            )}
          </ul>
        </div>

        {/* Column 2: Learned / Mastered */}
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400 mb-8 border-b border-zinc-100 pb-4 flex justify-between">
            <span>Mastered</span>
            <span>{phrases.filter((p) => p.learned).length}</span>
          </h2>
          
          <ul className="flex flex-col space-y-2">
            {phrases.filter(p => p.learned && (p.text.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()))).map((phrase) => (
              <li key={phrase.id} className="group relative flex items-start gap-4 py-4 px-3 -mx-3 rounded-2xl transition-all duration-300 opacity-70 hover:opacity-100">
                <button
                  onClick={() => toggleLearned(phrase.id, phrase.learned)}
                  className="mt-1.5 shrink-0 w-4 h-4 rounded-full border border-zinc-800 bg-zinc-800 text-white flex items-center justify-center transition-all duration-300 hover:bg-zinc-600 hover:border-zinc-600"
                >
                  <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-['Georgia',serif] text-zinc-500 line-through decoration-zinc-300 leading-relaxed">
                    {phrase.text}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[9px] text-zinc-400 tracking-wider uppercase">
                      {new Date(phrase.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deletePhrase(phrase.id)}
                  className="mt-1 text-zinc-200 hover:text-red-400 transition-all duration-300 opacity-0 group-hover:opacity-100 text-xl font-light"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  </div>
</main>
  );
}