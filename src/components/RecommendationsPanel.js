import Link from "next/link";

export function RecommendationsPanel({ loading, error, response, onRetry }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <h2>Your Recommendations</h2>
        <p>TARIA matches products to the profile and budget in seconds.</p>
      </div>
      <div className="panel__body">
        {loading && (
          <div className="state">
            <div className="spinner" />
            <p>Finding the best cover for you…</p>
          </div>
        )}

        {!loading && error && (
          <div className="state state--error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && response && (
          <div className="results">
            {response.items.length > 0 && response.message ? (
              <div className="state">
                <p>{response.message}</p>
              </div>
            ) : null}

            {response.items.length === 0 ? (
              <div className="state">
                <p>{response.message || "No recommendations yet."}</p>
                <button className="btn btn--secondary" type="button" onClick={onRetry}>
                  Try again
                </button>
              </div>
            ) : null}

            {response.items.map((item) => (
              <div className="card" key={`${item.productId}-${item.rank}`}>
                <div className="card__rank">#{item.rank}</div>
                <div className="card__content">
                  <h3>{item.productName}</h3>
                  <p>{item.reason}</p>
                  <Link
                    className="card__cta"
                    href={`/checkout?productId=${encodeURIComponent(item.productId)}&productName=${encodeURIComponent(item.productName)}`}
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && !response && (
          <div className="state">
            <p>Submit the assessment to see personalized coverage options.</p>
          </div>
        )}
      </div>
    </section>
  );
}
