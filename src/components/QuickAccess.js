import Link from "next/link";
import { quickSections } from "@/lib/taria/ui";

export function QuickAccess() {
  return (
    <section className="quick">
      <div className="quick__header">
        <h2>Quick Access</h2>
        <p>Everything you need to know about TARIA in one place.</p>
      </div>
      <div className="quick__grid">
        {quickSections.map((item) => (
          <div className="quick__card" key={item.route}>
            <span className="quick__icon" style={{ background: item.color }} />
            <h3>{item.title}</h3>
            <p className="quick__summary">{item.summary}</p>
            <Link className="quick__link" href={item.route}>
              Learn more →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
