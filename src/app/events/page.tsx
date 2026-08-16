import { supabase } from "@/lib/supabase";
import EntryCard from "@/components/EntryCard";
import FilterBar from "@/components/FilterBar";

type SearchParams = {
  status?: string;
  location?: string;
  tags?: string;
};

const EVENT_STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "closed", label: "Past" },
];

type Entry = {
  id: string;
  title: string;
  type: string;
  status: string | null;
  state_code: string | null;
  geo_scope: string | null;
  council_name: string | null;
  is_virtual: boolean | null;
  start_date: string | null;
  end_date: string | null;
};

// An event has "passed" once its end date (or start date, if no end
// date) is before today. Events with no date at all are never
// considered past — we don't want to silently hide something just
// because its date is missing.
function isPastEvent(entry: Entry, todayStr: string): boolean {
  const effectiveDate = entry.end_date ?? entry.start_date;
  if (!effectiveDate) return false;
  return effectiveDate < todayStr;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const { data: allTags } = await supabase
    .from("issue_tags")
    .select("slug, label")
    .order("label");

  let entryIds: string[] | null = null;

  if (params.tags) {
    const tagSlugs = params.tags.split(",").filter(Boolean);
    if (tagSlugs.length > 0) {
      const { data: tagLinks } = await supabase
        .from("entry_issue_tags")
        .select("entry_id, issue_tags!inner(slug)")
        .in("issue_tags.slug", tagSlugs);

      entryIds = Array.from(
        new Set((tagLinks ?? []).map((link) => link.entry_id as string))
      );
    }
  }

  let entries: Entry[] = [];

  if (!entryIds || entryIds.length > 0) {
    let query = supabase
      .from("entries")
      .select(
        "id, title, type, status, state_code, geo_scope, council_name, is_virtual, start_date, end_date"
      )
      .eq("type", "event")
      .order("start_date", { ascending: true });

    if (params.location === "national") {
      query = query.eq("geo_scope", "national");
    } else if (params.location) {
      query = query.eq("state_code", params.location);
    }
    if (entryIds) {
      query = query.in("id", entryIds);
    }

    const { data } = await query;
    entries = data ?? [];
  }

  // Default view (and explicit "Upcoming") hides past events.
  // Explicit "Past" shows only past events. Nothing gets deleted —
  // this is purely a display filter computed fresh from today's date.
  const todayStr = new Date().toISOString().slice(0, 10);
  if (params.status === "closed") {
    entries = entries.filter((e) => isPastEvent(e, todayStr));
  } else {
    entries = entries.filter((e) => !isPastEvent(e, todayStr));
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display font-semibold text-4xl text-gray-900 mb-6">
        Events
      </h1>

      <FilterBar tags={allTags ?? []} statusOptions={EVENT_STATUS_OPTIONS} />

      <p className="text-sm text-gray-500 mb-4 font-sans">
        {entries.length} event{entries.length === 1 ? "" : "s"} found
      </p>

      {entries.length === 0 ? (
        <p className="text-gray-500 font-sans">
          No events match these filters yet. Try clearing a filter.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
