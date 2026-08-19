import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Params = {
  id: string;
};

const TYPE_LABELS: Record<string, string> = {
  petition: "Petition",
  event: "Event",
  legal: "Legal matter",
};

const ACTION_LABELS: Record<string, string> = {
  sign_petition: "Sign this petition",
  attend: "Attend this event",
  subscribe: "Follow this",
};

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatLocation(
  stateCode: string | null,
  geoScope: string | null,
  councilName: string | null
): string | null {
  if (councilName && stateCode) return `${councilName}, ${stateCode}`;
  if (councilName) return councilName;
  if (stateCode) return stateCode;
  if (!geoScope) return null;
  return geoScope
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const { data: entry } = await supabase
    .from("entries")
    .select(
  "id, title, description, url, type, status, action_type, state_code, geo_scope, council_name, is_virtual, start_date, end_date, source_type, source_name"
)
    .eq("id", id)
    .single();

  if (!entry) {
    notFound();
  }

  const { data: tagLinks } = await supabase
    .from("entry_issue_tags")
    .select("issue_tags ( label )")
    .eq("entry_id", id);

  const tags = (tagLinks ?? [])
    .map((t) => (t.issue_tags as unknown as { label: string } | null)?.label)
    .filter(Boolean);

  const location = formatLocation(
    entry.state_code,
    entry.geo_scope,
    entry.council_name
  );
  const endDate = formatDate(entry.end_date);
  const backHref =
    entry.type === "petition"
      ? "/petitions"
      : entry.type === "event"
        ? "/events"
        : "/legal";
  const backLabel = TYPE_LABELS[entry.type] ?? "Entries";
  const actionLabel = ACTION_LABELS[entry.action_type ?? ""] ?? "Take action";

    const entryUrl = `https://civicactionhub.org/entries/${entry.id}`;

  const schema =
    entry.type === "event"
      ? {
          "@context": "https://schema.org",
          "@type": "Event",
          name: entry.title,
          description: entry.description ?? undefined,
          startDate: entry.start_date ?? undefined,
          endDate: entry.end_date ?? undefined,
          eventStatus:
            entry.status === "closed"
              ? "https://schema.org/EventCancelled"
              : "https://schema.org/EventScheduled",
          eventAttendanceMode: entry.is_virtual
            ? "https://schema.org/OnlineEventAttendanceMode"
            : "https://schema.org/OfflineEventAttendanceMode",
          location: entry.is_virtual
            ? { "@type": "VirtualLocation", url: entry.url ?? entryUrl }
            : {
                "@type": "Place",
                name: location ?? "Australia",
              },
          url: entryUrl,
        }
      : {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: entry.title,
          description: entry.description ?? undefined,
          url: entryUrl,
          about: TYPE_LABELS[entry.type] ?? entry.type,
          ...(entry.type === "petition" && entry.end_date
            ? { validThrough: entry.end_date }
            : {}),
        };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Link
        href={backHref}
        className="text-sm font-sans text-gray-500 hover:text-gray-700 mb-6 inline-block"
      >
        ← Back to {backLabel}s
      </Link>

      <div className="mb-2 flex items-center gap-2 text-sm font-sans text-gray-500">
        <span>{TYPE_LABELS[entry.type] ?? entry.type}</span>
        {entry.status && (
          <>
            <span>&middot;</span>
            <span className="capitalize">{entry.status}</span>
          </>
        )}
      </div>

      <h1 className="font-display font-semibold text-3xl text-gray-900 mb-4">
        {entry.title}
      </h1>

      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 font-sans mb-6">
        {location && <span>{location}</span>}
        {entry.is_virtual && (
          <>
            <span>&middot;</span>
            <span>Online</span>
          </>
        )}
        {endDate && (
          <>
            <span>&middot;</span>
            <span>Ends {endDate}</span>
          </>
        )}
      </div>

      {entry.description && (
        <p className="text-gray-700 font-sans leading-relaxed mb-6">
          {entry.description}
        </p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((label) => (
            <span
              key={label}
              className="px-3 py-1 rounded-full text-sm font-sans font-medium"
              style={{ backgroundColor: "#fbeaf0", color: "#72243e" }}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {entry.url && (
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full px-6 py-3 text-white font-sans font-medium"
          style={{ backgroundColor: "#df1278" }}
        >
          {actionLabel} →
        </a>
      )}

      {entry.source_name && (
        <p className="text-xs text-gray-400 font-sans mt-4">
          Hosted on {entry.source_name}
        </p>
      )}
    </div>
  );
}
