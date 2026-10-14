const CHAPTERS = [
  ["Farm", "Mambilla Plateau, Taraba. Cool mornings and cherries that take their time."],
  ["Harvest", "Ripe red fruit, picked by hand when sweetness is at its height."],
  ["Process", "Washed lots for clarity; naturals dried slowly for fruit and body."],
  ["Roast", "A careful curve: enough development for sweetness, never enough to hide place."],
  ["Cup", "Cupped, packed and brewed somewhere that needs a good pause."],
];

export function StoryPage() {
  return (
    <main id="main" className="hrm-story">
      <section>
        <p className="hrm-kicker">Farm to cup</p>
        <h1>Five chapters behind every quiet sip.</h1>
      </section>
      <div className="hrm-story-grid">
        <div className="hrm-story-art" aria-hidden="true">
          ☼<span>◒</span>
        </div>
        <div>
          {CHAPTERS.map(([title, text], index) => (
            <article key={title}>
              <small>0{index + 1}</small>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
