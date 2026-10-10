import type { WireframeRegion } from "@/src/demos/hub/data/principles";

import type { KeyboardEvent } from "react";

type PrincipleWireframeProps = {
  activeRegion: WireframeRegion;
  onSelect: (region: WireframeRegion) => void;
};

const hotspotPositions: Record<WireframeRegion, readonly [number, number]> = {
  goal: [72, 83],
  mechanic: [313, 158],
  proof: [80, 246],
  doubts: [312, 303],
  form: [314, 379],
  mobile: [71, 422],
};

export function PrincipleWireframe({ activeRegion, onSelect }: PrincipleWireframeProps) {
  return (
    <div className="axm-anatomy-frame">
      <svg viewBox="0 0 420 480" aria-hidden="true">
        <rect className="axm-wireframe-outline" x="20" y="14" width="380" height="452" />
        <rect
          className="axm-wireframe-region"
          data-region="goal"
          x="20"
          y="14"
          width="380"
          height="45"
        />
        <rect
          className="axm-wireframe-region"
          data-region="goal"
          x="44"
          y="84"
          width="190"
          height="13"
        />
        <rect
          className="axm-wireframe-region"
          data-region="goal"
          x="44"
          y="107"
          width="230"
          height="13"
        />
        <rect
          className="axm-wireframe-region"
          data-region="goal"
          x="44"
          y="134"
          width="85"
          height="20"
        />
        <rect
          className="axm-wireframe-region"
          data-region="mechanic"
          x="44"
          y="174"
          width="332"
          height="52"
        />
        <rect
          className="axm-wireframe-region"
          data-region="proof"
          x="44"
          y="244"
          width="332"
          height="28"
        />
        <rect
          className="axm-wireframe-region"
          data-region="doubts"
          x="44"
          y="291"
          width="332"
          height="15"
        />
        <rect
          className="axm-wireframe-region"
          data-region="doubts"
          x="44"
          y="318"
          width="332"
          height="15"
        />
        <rect
          className="axm-wireframe-region"
          data-region="form"
          x="44"
          y="354"
          width="332"
          height="48"
        />
        <rect
          className="axm-wireframe-region"
          data-region="mobile"
          x="44"
          y="421"
          width="332"
          height="25"
        />
        <g className={`axm-wireframe-highlight is-${activeRegion}`} aria-hidden="true">
          <rect x="20" y="14" width="380" height="45" />
          <rect x="44" y="84" width="230" height="70" />
          <rect x="44" y="174" width="332" height="52" />
          <rect x="44" y="244" width="332" height="28" />
          <rect x="44" y="291" width="332" height="42" />
          <rect x="44" y="354" width="332" height="48" />
          <rect x="44" y="421" width="332" height="25" />
        </g>
      </svg>
      <div className="axm-anatomy-hotspots" role="toolbar" aria-label="Page anatomy principles">
        {Object.entries(hotspotPositions).map(([region, position], index) => (
          <button
            key={region}
            type="button"
            className={activeRegion === region ? "is-selected" : ""}
            style={{ left: `${position[0]}px`, top: `${position[1]}px` }}
            aria-label={`Select principle ${index + 1}`}
            aria-pressed={activeRegion === region}
            tabIndex={activeRegion === region ? 0 : -1}
            onClick={() => onSelect(region as WireframeRegion)}
            onMouseEnter={() => onSelect(region as WireframeRegion)}
            onFocus={() => onSelect(region as WireframeRegion)}
            onKeyDown={(event) => handleArrowKey(event, index, onSelect)}
          >
            {String(index + 1).padStart(2, "0")}
          </button>
        ))}
      </div>
    </div>
  );
}

function handleArrowKey(
  event: KeyboardEvent<HTMLButtonElement>,
  index: number,
  onSelect: PrincipleWireframeProps["onSelect"],
) {
  const keys = Object.keys(hotspotPositions) as WireframeRegion[];
  if (!event.key.startsWith("Arrow")) {
    return;
  }
  event.preventDefault();
  const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
  const nextIndex = (index + direction + keys.length) % keys.length;
  const nextRegion = keys[nextIndex];
  onSelect(nextRegion);
  document
    .querySelector<HTMLButtonElement>(`.axm-anatomy-hotspots button:nth-child(${nextIndex + 1})`)
    ?.focus();
}
