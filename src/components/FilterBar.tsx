"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Tag = {
  slug: string;
  label: string;
};

type StatusOption = {
  value: string;
  label: string;
};

const DEFAULT_STATUS_OPTIONS: StatusOption[] = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

export default function FilterBar({
  tags,
  statusOptions = DEFAULT_STATUS_OPTIONS,
}: {
  tags: Tag[];
  statusOptions?: StatusOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "";
  const currentLocation = searchParams.get("location") ?? "";
  const currentTags =
    searchParams.get("tags")?.split(",").filter(Boolean) ?? [];

  const activeCount =
    (currentStatus ? 1 : 0) +
    (currentLocation ? 1 : 0) +
    (currentTags.length > 0 ? 1 : 0);

  // Start open if the page was loaded with filters already applied
  // (e.g. someone followed a shared filtered link), otherwise closed.
  const [isOpen, setIsOpen] = useState(activeCount > 0);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleTag(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    const nextTags = currentTags.includes(slug)
      ? currentTags.filter((t) => t !== slug)
      : [...currentTags, slug];

    if (nextTags.length > 0) {
      params.set("tags", nextTags.join(","));
    } else {
      params.delete("tags");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-sans font-medium text-gray-700"
        >
          <span>Filters</span>
          {activeCount > 0 && (
            <span
              className="rounded-full px-1.5 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: "#fbeaf0", color: "#72243e" }}
            >
              {activeCount}
            </span>
          )}
          <span className="text-gray-400">{isOpen ? "▲" : "▼"}</span>
        </button>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-sm font-sans text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        )}
      </div>

      {isOpen && (
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            <select
              value={currentStatus}
              onChange={(e) => updateParam("status", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-sans"
            >
              <option value="">All statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={currentLocation}
              onChange={(e) => updateParam("location", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-sans"
            >
              <option value="">All locations</option>
              <option value="national">National</option>
              <option value="NSW">NSW</option>
              <option value="VIC">VIC</option>
              <option value="QLD">QLD</option>
              <option value="WA">WA</option>
              <option value="SA">SA</option>
              <option value="TAS">TAS</option>
              <option value="ACT">ACT</option>
              <option value="NT">NT</option>
            </select>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const active = currentTags.includes(tag.slug);
                return (
                  <button
                    key={tag.slug}
                    onClick={() => toggleTag(tag.slug)}
                    className="px-3 py-1 rounded-full text-sm font-sans font-medium border"
                    style={
                      active
                        ? {
                            backgroundColor: "#fbeaf0",
                            borderColor: "#df1278",
                            color: "#72243e",
                          }
                        : {
                            backgroundColor: "white",
                            borderColor: "#d1d5db",
                            color: "#374151",
                          }
                    }
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
