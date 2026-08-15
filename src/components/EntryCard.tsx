import Link from "next/link";

type EntryStatus = "open" | "upcoming" | "achieved" | "closed" | "unknown";

type Entry = {
  id: string;
  title: string;
  type: string;
  status: string | null;
  state_code: string | null;
  geo_scope: string | null;
  council_name: string | null;
  is_virtual: boolean | null;
  end_date: string | null;
};

const STATUS_STYLES: Record<
  EntryStatus,
  { label: string; edge: string; badgeBg: string; badgeText: string }
> = {
  open: {
    label: "Open",
    edge: "#df1278",
    badgeBg: "#fbeaf0",
    badgeText: "#72243e",
  },
  upcoming: {
    label: "Upcoming",
    edge: "#0070f2",
    badgeBg: "#e6f1fb",
    badgeText: "#0c447c",
  },
  achieved: {
    label: "Outcome achieved",
    edge: "#8a6d00",
    badgeBg: "#fff3b8",
    badgeText: "#5c4a00",
  },
  closed: {
    label: "Closed",
    edge: "#888780",
    badgeBg: "#f1efe8",
    badgeText: "#444441",
  },
  unknown: {
    label: "Status unknown",
    edge: "#c4c4c4",
    badgeBg: "#f5f5f5",
    badgeText: "#8a8a8a",
  },
};

function resolveStatus(status: string | null): EntryStatus {
  if (
    status === "open" ||
    status === "upcoming" ||
    status === "achieved" ||
    status === "closed"
  ) {
    return status;
  }
  return "unknown";
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
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

export default function EntryCard({ entry }: { entry: Entry }) {
  const status = resolveStatus(entry.status);
  const styles = STATUS_STYLES[status];
  const location = formatLocation(
    entry.state_code,
    entry.geo_scope,
    entry.council_name
  );
  const endDate = formatDate(entry.end_date);

  return (
    <Link
      href={`/entries/${entry.id}`}
      className="block bg-white border border-gray-200 rounded-r-xl p-4 hover:border-gray-300 transition-colors"
      style={{ borderLeft: `3px solid ${styles.edge}` }}
    >
      <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">
        {entry.title}
      </h3>
      <div className="flex items-center gap-2 text-sm text-gray-600 font-sans">
        <span
          className="px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: styles.badgeBg, color: styles.badgeText }}
        >
          {styles.label}
        </span>
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
    </Link>
  );
}
