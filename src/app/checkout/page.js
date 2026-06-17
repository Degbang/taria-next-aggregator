import Link from "next/link";

export default async function CheckoutPage({ searchParams }) {
  const params = await searchParams;
  return (
    <section className="checkout">
      <Link className="checkout__back" href="/insurance/assessment">
        ← Back to assessment
      </Link>
      <h1>TripSecure Checkout</h1>
      <p>This is a placeholder checkout page. It will redirect to TripSecure when integration is ready.</p>
      <div className="checkout__card">
        <div>
          <span>Product</span>
          <strong>{params.productName || "Unknown product"}</strong>
        </div>
        <div>
          <span>Product ID</span>
          <strong>{params.productId || "N/A"}</strong>
        </div>
      </div>
      <button className="btn btn--primary" type="button" disabled>
        Continue to TripSecure
      </button>
    </section>
  );
}
