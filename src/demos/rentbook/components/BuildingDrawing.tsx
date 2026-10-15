"use client";

import { useRef } from "react";

import { buildBuildingLayout } from "../lib/buildingLayout";
import { naira } from "../lib/finance";

import type { Unit } from "../types";

type VisualStatus =
  "paid" | "due_soon" | "overdue" | "partial" | "vacant" | "notice" | "maintenance";

type BuildingDrawingProps = {
  units: Unit[];
  selectedId: string;
  getDetail: (unit: Unit) => { status: VisualStatus; tenant?: { name: string }; balance: number };
  onSelect: (unit: Unit) => void;
};

const STATUS_LABELS: Record<VisualStatus, string> = {
  paid: "Paid",
  due_soon: "Due soon",
  overdue: "Overdue",
  partial: "Partial",
  vacant: "Vacant",
  notice: "Notice",
  maintenance: "Maintenance",
};

export function BuildingDrawing({ units, selectedId, getDetail, onSelect }: BuildingDrawingProps) {
  const refs = useRef<Array<SVGGElement | null>>([]);
  const layout = buildBuildingLayout(units.map((unit) => unit.id));
  const counts = countStatuses(units, getDetail);
  const move = (event: React.KeyboardEvent<SVGGElement>, index: number) => {
    const nextIndex = nextUnitIndex(event.key, index, units.length);
    if (nextIndex === null) {
      return;
    }
    event.preventDefault();
    onSelect(units[nextIndex]);
    refs.current[nextIndex]?.focus();
  };

  return (
    <section className="rbk-elevation-wrap" aria-label="Building elevation">
      <svg
        className="rbk-elevation"
        viewBox={`0 0 ${layout.viewBox.width} ${layout.viewBox.height}`}
        role="img"
      >
        <path
          d={`M56 74 L${layout.viewBox.width - 56} 74 L${layout.viewBox.width - 78} 38 L78 38 Z`}
          className="rbk-roof"
        />
        <rect
          x="56"
          y="74"
          width={layout.viewBox.width - 112}
          height={layout.viewBox.height - 74}
          className="rbk-building-frame"
        />
        {layout.units.map((position, index) => {
          const unit = units[index];
          const detail = getDetail(unit);
          return (
            <g
              key={unit.id}
              ref={(element) => {
                refs.current[index] = element;
              }}
              role="button"
              tabIndex={unit.id === selectedId ? 0 : -1}
              aria-label={`${unit.label}, ${detail.tenant?.name ?? "vacant"}, ${STATUS_LABELS[detail.status]}, ${naira(detail.balance)} outstanding`}
              className={`rbk-svg-unit rbk-svg-${detail.status}`}
              onClick={() => onSelect(unit)}
              onKeyDown={(event) => move(event, index)}
            >
              <rect
                x={position.x}
                y={position.y}
                width={position.width}
                height={position.height}
                rx="8"
              />
              <text x={position.x + 12} y={position.y + 31}>
                {unit.label}
              </text>
              <text x={position.x + 12} y={position.y + 56}>
                {STATUS_LABELS[detail.status]}
              </text>
            </g>
          );
        })}
        <rect {...layout.entrance} rx="4" className="rbk-entrance" />
        <text x={layout.entrance.x + 15} y={layout.entrance.y + 50}>
          ENTRY
        </text>
      </svg>
      <div className="rbk-building-legend" aria-label="Unit status legend">
        {Object.entries(counts).map(([status, count]) => (
          <span key={status}>
            <i className={`rbk-key rbk-key-${status}`} />
            {STATUS_LABELS[status as VisualStatus]} {count}
          </span>
        ))}
      </div>
    </section>
  );
}

function countStatuses(units: Unit[], getDetail: BuildingDrawingProps["getDetail"]) {
  return units.reduce<Partial<Record<VisualStatus, number>>>((counts, unit) => {
    const status = getDetail(unit).status;
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});
}

function nextUnitIndex(key: string, index: number, count: number) {
  if (key === "Enter" || key === " ") {
    return index;
  }
  const direction = { ArrowRight: 1, ArrowDown: 4, ArrowLeft: -1, ArrowUp: -4 }[key];
  if (!direction) {
    return null;
  }
  return Math.max(0, Math.min(count - 1, index + direction));
}
