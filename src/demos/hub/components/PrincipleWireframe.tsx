import type { WireframeRegion } from "@/src/demos/hub/data/principles";
import {
  toWireframePercent,
  WIREFRAME_VIEWBOX,
  wireframeRegions,
} from "@/src/demos/hub/data/wireframe";

import type { KeyboardEvent } from "react";

type PrincipleWireframeProps = {
  activeRegion: WireframeRegion;
  onSelect: (region: WireframeRegion) => void;
};

const regionEntries = Object.entries(wireframeRegions) as [
  WireframeRegion,
  (typeof wireframeRegions)[WireframeRegion],
][];

export function PrincipleWireframe({ activeRegion, onSelect }: PrincipleWireframeProps) {
  return (
    <div className="axm-anatomy-frame">
      <svg
        viewBox={`0 0 ${WIREFRAME_VIEWBOX.width} ${WIREFRAME_VIEWBOX.height}`}
        aria-hidden="true"
      >
        <rect className="axm-wireframe-outline" x="14" y="14" width="292" height="452" />
        {regionEntries.flatMap(([region, definition]) =>
          definition.rectangles.map((rectangle, index) => (
            <rect
              key={`${region}-${index}`}
              className="axm-wireframe-region"
              data-region={region}
              {...rectangle}
            />
          )),
        )}
        {wireframeRegions[activeRegion].rectangles.map((rectangle, index) => (
          <rect key={index} className="axm-wireframe-highlight" {...rectangle} />
        ))}
      </svg>
      <div className="axm-anatomy-hotspots" role="toolbar" aria-label="Page anatomy principles">
        {regionEntries.map(([region, definition], index) => (
          <button
            key={region}
            type="button"
            className={activeRegion === region ? "is-selected" : ""}
            style={toWireframePercent(definition.anchor)}
            data-hotspot={region}
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
  const keys = regionEntries.map(([region]) => region);
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
