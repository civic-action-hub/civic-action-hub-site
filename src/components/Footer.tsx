export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-16 py-8">
      <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 font-sans">
        <p>&copy; {new Date().getFullYear()} Civic Action Hub</p>
        <a
          href="https://www.instagram.com/civicactionhub"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-[#df1278]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
          </svg>
          Follow @civicactionhub &mdash; join the community
        </a>
      </div>
    </footer>
  );
}
