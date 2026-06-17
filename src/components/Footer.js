import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div>
          <h4>TARIA</h4>
        </div>
        <div>
          <h5>Support</h5>
          <Link href="/support/safety">Safety</Link>
          <Link href="/support/help-center">Help Center</Link>
          <Link href="/support/contact">Contact Us</Link>
        </div>
        <div>
          <h5>Company</h5>
          <Link href="/support/about">About Us</Link>
          <Link href="/insurance/assessment">Insurance Profiling</Link>
          <Link href="/farmer-risk/assessment">Farmer Profiling</Link>
        </div>
      </div>
      <div className="footer__bottom">TARIA JavaScript migration workspace.</div>
    </footer>
  );
}
