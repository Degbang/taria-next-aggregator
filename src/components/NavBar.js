"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/insurance/assessment", label: "Insurance Risk Profiling" },
  { href: "/farmer-risk/assessment", label: "Farmer Risk Profiling" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link className="logo" href="/">
          <span className="logo__mark">TARIA</span>
        </Link>
        <nav className="nav__links">
          {links.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav__link${isActive ? " active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
