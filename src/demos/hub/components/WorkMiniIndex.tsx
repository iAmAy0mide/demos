import type { Work } from "@/src/shared/works";

type WorkMiniIndexProps = { works: readonly Work[]; activeId: Work["id"] };

export function WorkMiniIndex({ works, activeId }: WorkMiniIndexProps) {
  return (
    <nav className="axm-work-index" aria-label="Selected work">
      {works.map((work, index) => (
        <a
          key={work.id}
          className={activeId === work.id ? "is-current" : ""}
          href={`#work-${work.id}`}
          aria-label={`Go to ${work.name}, item ${index + 1}`}
        >
          {String(index + 1).padStart(2, "0")}
        </a>
      ))}
    </nav>
  );
}
