import Link from "next/link";

export function SupportPage({ title, intro, paragraphs, bullets, contact }) {
  return (
    <section className="support">
      <Link className="support__back" href="/">
        ← Back to home
      </Link>
      <h1>{title}</h1>
      <p>{intro}</p>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {bullets?.length ? (
        <ul>
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {contact ? (
        <div className="support__contact">
          {contact.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
