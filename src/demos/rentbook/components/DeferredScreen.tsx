import Link from "next/link";

type DeferredScreenProps = { title: string; description: string };

export function DeferredScreen({ title, description }: DeferredScreenProps) {
  return (
    <main className="rbk-page rbk-deferred-screen">
      <p className="rbk-kicker">Rentbook workspace</p>
      <section aria-labelledby="deferred-screen-title" className="rbk-deferred-panel">
        <span aria-hidden="true" className="rbk-deferred-mark">
          R
        </span>
        <h1 id="deferred-screen-title">{title}</h1>
        <p>{description}</p>
        <Link className="rbk-primary" href="/work/rentbook">
          Return to overview
        </Link>
      </section>
    </main>
  );
}
