"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { href: "/petitions", label: "Petitions" },
    { href: "/events", label: "Events" },
    { href: "/legal", label: "Legal" },
    { href: "/contribute", label: "Contribute" },
  ];

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
          <img src="/logo.png" alt="Civic Action Hub" className="h-10 w-auto" />
        </Link>

        {/* Desktop nav - hidden on small screens */}
        <nav className="hidden sm:flex gap-6 text-sm font-sans font-medium text-gray-700">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[#0070f2]">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button - only shows on small screens */}
        <button
          className="sm:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel - only shows when open, only on small screens */}
      {isMenuOpen && (
        <nav className="sm:hidden border-t border-gray-200 px-6 py-3 flex flex-col gap-3 text-sm font-sans font-medium text-gray-700">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-[#0070f2]"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
