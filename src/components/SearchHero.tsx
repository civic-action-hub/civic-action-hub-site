"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchHero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div
      className="rounded-2xl p-8 mb-10"
      style={{ backgroundColor: "#0070f2" }}
    >
      <p className="text-white text-sm tracking-wide opacity-85 mb-2 font-sans">
        CIVIC ACTION HUB
      </p>
      <h1 className="font-display font-semibold text-2xl text-white mb-5 max-w-md">
        Find campaigns tied to what you actually care about
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-white rounded-full p-1.5 pl-5"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="I want to save koala habitat..."
          className="flex-1 border-none outline-none text-sm font-sans bg-transparent"
        />
        <button
          type="submit"
          className="rounded-full px-5 py-2 text-sm font-sans font-medium text-white"
          style={{ backgroundColor: "#df1278" }}
        >
          Search
        </button>
      </form>
    </div>
  );
}
