import { supabase } from "@/lib/supabase";
import EntryCard from "@/components/EntryCard";

type SearchParams = {
  q?: string;
};

async function matchTagsToQuery(
  query: string,
  tags: { slug: string; label: string }[]
): Promise<string[]> {
  const tagList = tags.map((t) => `${t.slug}: ${t.label}`).join("\n");

  const prompt = `A visitor to an Australian civic action platform typed this into a search box, describing what they care about:

"${query}"

Here are the available issue tags on the platform:
${tagList}

Which tags have a clear, direct connection to what this person is looking for? Err on the side of precision, not recall — only include a tag if it's genuinely central to the query, not just loosely or indirectly related. For example, a search about "forests" should match Environment and Climate, but NOT Animal Welfare just because forests contain wildlife — that connection is too indirect.

Respond ONLY with valid JSON, no other text, in this exact shape:
{ "matching_slugs": ["slug1", "slug2"] }

If nothing is genuinely relevant, respond with:
{ "matching_slugs": [] }`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const textBlock = data.content?.find((b: { type: string }) => b.type === "text");
    if (!textBlock) return [];

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed.matching_slugs ?? [];
  } catch {
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  if (!query) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-display font-semibold text-3xl text-gray-900 mb-4">
          Search
        </h1>
        <p className="text-gray-500 font-sans">
          Type what you care about on the homepage to find matching campaigns.
        </p>
      </div>
    );
  }

  const { data: allTags } = await supabase
    .from("issue_tags")
    .select("slug, label");

  const matchingSlugs = await matchTagsToQuery(query, allTags ?? []);
  const matchedTags = (allTags ?? []).filter((t) =>
    matchingSlugs.includes(t.slug)
  );

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
    matchCount: number;
  }> = [];

  if (matchingSlugs.length > 0) {
    const { data: tagLinks } = await supabase
      .from("entry_issue_tags")
      .select("entry_id, issue_tags!inner(slug)")
      .in("issue_tags.slug", matchingSlugs);

    // Count how many of the matched tags each entry actually hits,
    // so entries matching multiple relevant tags rank above entries
    // that only matched one (possibly borderline) tag.
    const matchCounts = new Map<string, number>();
    for (const link of tagLinks ?? []) {
      const id = link.entry_id as string;
      matchCounts.set(id, (matchCounts.get(id) ?? 0) + 1);
    }
    const entryIds = Array.from(matchCounts.keys());

    if (entryIds.length > 0) {
      const { data } = await supabase
        .from("entries")
        .select(
          "id, title, type, status, state_code, geo_scope, council_name, is_virtual, end_date"
        )
        .in("id", entryIds);

      entries = (data ?? [])
        .map((entry) => ({
          ...entry,
          matchCount: matchCounts.get(entry.id) ?? 0,
        }))
        .sort((a, b) => b.matchCount - a.matchCount);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display font-semibold text-3xl text-gray-900 mb-2">
        Results for &ldquo;{query}&rdquo;
      </h1>

      {matchedTags.length > 0 ? (
        <p className="text-sm text-gray-500 mb-6 font-sans">
          Matched based on:{" "}
          {matchedTags.map((t) => t.label).join(", ")}
        </p>
      ) : (
        <p className="text-sm text-gray-500 mb-6 font-sans">
          No clear matches found for this search.
        </p>
      )}

      {entries.length === 0 ? (
        <p className="text-gray-500 font-sans">
          No campaigns match this yet. Try a different phrase, or browse{" "}
          <a href="/petitions" className="underline">
            all petitions
          </a>
          .
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
