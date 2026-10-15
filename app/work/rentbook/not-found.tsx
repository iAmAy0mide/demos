import Link from "next/link";

export default function RentbookNotFound() {
  return (
    <main className="rbk-page rbk-not-found">
      <p>Rentbook record desk</p>
      <h1>That record is not in this book.</h1>
      <Link className="rbk-primary" href="/work/rentbook/tenants">
        Back to tenants
      </Link>
    </main>
  );
}
