"use client";

import Link from "next/link";
import { useState } from "react";
import { homeModules } from "@/lib/taria/ui";

export function HomeHero() {
  const [activeKey, setActiveKey] = useState(homeModules[0].key);
  const activeModule = homeModules.find((item) => item.key === activeKey) || homeModules[0];

  return (
    <section className="hero">
      <div className="hero__content">
        <div className="hero__tag">TARIA • Multi-Domain Risk Profiling</div>
        <div className="hero__tabs" role="tablist" aria-label="TARIA modules">
          {homeModules.map((module) => (
            <button
              key={module.key}
              className={`hero__tab${activeModule.key === module.key ? " hero__tab--active" : ""}`}
              type="button"
              onClick={() => setActiveKey(module.key)}
            >
              {module.tabLabel}
            </button>
          ))}
        </div>
        <span className="hero__module-tag">{activeModule.tag}</span>
        <h1>{activeModule.title}</h1>
        <p>{activeModule.summary}</p>
        <ul className="hero__highlights">
          {activeModule.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="hero__actions">
          <Link className="btn btn--primary" href={activeModule.route}>
            {activeModule.ctaLabel}
          </Link>
        </div>
      </div>
      <div className="hero__card">
        <div className="hero__card-inner">
          <h3>{activeModule.outputTitle}</h3>
          <ul className="hero__outputs">
            {activeModule.outputItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
