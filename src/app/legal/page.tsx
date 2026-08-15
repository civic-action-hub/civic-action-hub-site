import { supabase } from "@/lib/supabase";
import EntryCard from "@/components/EntryCard";
import FilterBar from "@/components/FilterBar";

type SearchParams = {
  status?: string;
  location?: string;
  tags?: string;
};

const LEGAL_STATUS_OPTIONS = [
  { value: "open", label: "Ongoing" },
  { value: "closed", label: "Concluded" },
];

export default async function LegalPage({
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

  let entries: Array<{
    id: string;
    title: string;
    type: string;
    status: string | null;
    state_code: string | null;
    geo_scope: string | null;
    council_name: string | null;
    is_virtual: boolean | null;
    end_date: string | null;
  }> = [];

  if (!entryIds || entryIds.length > 0) {
    let query = supabase
      .from("entries")
      .select(
        "id, title, type, status, state_code, geo_scope, council_name, is_virtual, end_date"
      )
      .eq("type", "legal")
      .order("created_at", { ascending: false });

    if (params.status) {
      query = query.eq("status", params.status);
    }
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display font-semibold text-4xl text-gray-900 mb-6">
        Legal
      </h1>

      <FilterBar tags={allTags ?? []} statusOptions={LEGAL_STATUS_OPTIONS} />

      <p className="text-sm text-gray-500 mb-4 font-sans">
        {entries.length} matter{entries.length === 1 ? "" : "s"} found
      </p>

      {entries.length === 0 ? (
        <p className="text-gray-500 font-sans">
          No legal matters match these filters yet. Try clearing a filter.
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
