import { supabase } from "@/lib/supabase";
import CategoryCard from "@/components/CategoryCard";
import EntryCard from "@/components/EntryCard";
import SearchHero from "@/components/SearchHero";

// Without this, Next.js can treat this page as static (since it has
// no URL params or other "dynamic" signals) and cache it at deploy
// time — meaning counts and "Recently added" would only ever update
// the next time the site gets redeployed, not when new data arrives.
// This forces it to fetch fresh from Supabase on every real visit.
export const dynamic = "force-dynamic";

function isPastEvent(
  entry: { type: string; start_date: string | null; end_date: string | null },
  todayStr: string
): boolean {
  if (entry.type !== "event") return false;
  const effectiveDate = entry.end_date ?? entry.start_date;
  if (!effectiveDate) return false;
  return effectiveDate < todayStr;
}

export default async function Home() {
  const { count: petitionsCount } = await supabase
    .from("entries")
    .select("*", { count: "exact", head: true })
    .eq("type", "petition")
    .eq("status", "open");

  const { count: eventsCount } = await supabase
    .from("entries")
    .select("*", { count: "exact", head: true })
    .eq("type", "event")
    .eq("status", "upcoming");

  const { count: legalCount } = await supabase
    .from("entries")
    .select("*", { count: "exact", head: true })
    .eq("type", "legal")
    .eq("status", "open");

  const { data: recentEntriesRaw } = await supabase
    .from("entries")
    .select(
      "id, title, type, status, state_code, geo_scope, council_name, is_virtual, start_date, end_date"
    )
    .order("created_at", { ascending: false })
    .limit(8);

  const todayStr = new Date().toISOString().slice(0, 10);
  const recentEntries = (recentEntriesRaw ?? [])
    .filter((e) => !isPastEvent(e, todayStr))
    .slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <p className="text-gray-600 font-sans text-sm mb-4">
        Discover and take civic action across Australia.
      </p>

      <SearchHero />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <CategoryCard
          href="/petitions"
          imageUrl="https://plus.unsplash.com/premium_photo-1666983888610-2362b2433009?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          label="Petitions"
          countLabel={
            petitionsCount ? `${petitionsCount} open` : "Coming soon"
          }
        />
        <CategoryCard
          href="/events"
          imageUrl="https://images.unsplash.com/photo-1676027114025-c5c10b55f097?q=80&w=668&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          label="Events"
          countLabel={eventsCount ? `${eventsCount} upcoming` : "Coming soon"}
        />
        <CategoryCard
          href="/legal"
          imageUrl="https://images.unsplash.com/photo-1589994965851-a8f479c573a9?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          label="Legal"
          countLabel={legalCount ? `${legalCount} ongoing` : "Coming soon"}
        />
      </div>

      <h2 className="font-display font-semibold text-2xl text-gray-900 mb-4">
        Recently added
      </h2>
      <div className="flex flex-col gap-3">
        {recentEntries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
