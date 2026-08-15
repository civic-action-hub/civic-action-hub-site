import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="Civic Action Hub" className="h-10 w-auto" />
        </Link>
        <nav className="flex gap-6 text-sm font-sans font-medium text-gray-700">
          <Link href="/petitions" className="hover:text-[#0070f2]">
            Petitions
          </Link>
          <Link href="/events" className="hover:text-[#0070f2]">
            Events
          </Link>
          <Link href="/legal" className="hover:text-[#0070f2]">
            Legal
          </Link>
          <Link href="/contribute" className="hover:text-[#df1278]">
            Contribute
          </Link>
        </nav>
      </div>
    </header>
  );
}
