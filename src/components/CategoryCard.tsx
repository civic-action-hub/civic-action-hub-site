import Link from "next/link";

type CategoryCardProps = {
  href: string;
  imageUrl: string;
  label: string;
  countLabel: string;
};

export default function CategoryCard({
  href,
  imageUrl,
  label,
  countLabel,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors"
    >
      <div className="relative h-40 w-full">
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "#df1278",
            opacity: 0.45,
            mixBlendMode: "hard-light",
          }}
        />
        <div className="absolute left-4 bottom-3">
          <span className="font-display font-semibold text-xl text-white drop-shadow">
            {label}
          </span>
        </div>
      </div>
      <div className="px-4 py-2 text-sm text-gray-600 font-sans">
        {countLabel}
      </div>
    </Link>
  );
}
