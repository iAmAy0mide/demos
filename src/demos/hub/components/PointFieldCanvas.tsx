"use client";

import { useEffect, useRef, type RefObject } from "react";

import {
  ACTION_RADIUS,
  CONNECTION_DISTANCE,
  createPoints,
  DESKTOP_POINT_COUNT,
  advancePoints,
  MAX_PIXEL_RATIO,
  MOBILE_POINT_COUNT,
  POINT_RADIUS,
  type FieldTarget,
} from "@/src/demos/hub/lib/pointField";

const IDLE_TIMEOUT = 900;
const FIELD_WHITE = "248,249,255";
const FIELD_SIGNAL = "#00b3eb";

export function PointFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    heroRef.current = document.querySelector(".axm-hero");
    ctaRef.current = document.querySelector(".axm-hero-primary");
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) {
      return;
    }
    let cleanup: (() => void) | undefined;
    const start = () => {
      cleanup = createField(canvas, hero, ctaRef);
    };
    const idle = window.requestIdleCallback?.(start, { timeout: IDLE_TIMEOUT });
    const timeout = idle ? undefined : window.setTimeout(start, IDLE_TIMEOUT);
    return () => {
      cleanup?.();
      if (idle) {
        window.cancelIdleCallback?.(idle);
      }
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="axm-point-field" aria-hidden="true" />;
}

function createField(
  canvas: HTMLCanvasElement,
  hero: HTMLElement,
  ctaRef: RefObject<HTMLElement | null>,
) {
  const context = canvas.getContext("2d");
  if (!context) {
    return () => undefined;
  }
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animationFrame = 0;
  let isVisible = true;
  let isTabVisible = !document.hidden;
  let width = 0;
  let height = 0;
  let points = createPoints(0, 1, 1);
  let pointer: FieldTarget | null = null;

  const resize = () => {
    const bounds = hero.getBoundingClientRect();
    width = Math.floor(bounds.width);
    height = Math.floor(bounds.height);
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    points = createPoints(width < 768 ? MOBILE_POINT_COUNT : DESKTOP_POINT_COUNT, width, height);
    draw(context, points, width, height, null, getActionTarget(hero, ctaRef));
  };
  const drawFrame = (time: number) => {
    if (!isVisible || !isTabVisible || reducedMotion.matches) {
      return;
    }
    const action = getActionTarget(hero, ctaRef);
    advancePoints(points, time / 1000, width, height, pointer, action);
    draw(context, points, width, height, pointer, action);
    animationFrame = window.requestAnimationFrame(drawFrame);
  };
  const restart = () => {
    window.cancelAnimationFrame(animationFrame);
    if (isVisible && isTabVisible && !reducedMotion.matches) {
      animationFrame = window.requestAnimationFrame(drawFrame);
    }
  };
  const onPointerMove = (event: PointerEvent) => {
    const bounds = hero.getBoundingClientRect();
    pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top, strength: 1.25 };
  };
  const onPointerLeave = () => {
    pointer = null;
  };
  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    restart();
  });
  const onVisibility = () => {
    isTabVisible = !document.hidden;
    restart();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(hero);
  observer.observe(hero);
  hero.addEventListener("pointermove", onPointerMove, { passive: true });
  hero.addEventListener("pointerleave", onPointerLeave, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  reducedMotion.addEventListener("change", restart);
  resize();
  restart();
  return () => {
    window.cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    observer.disconnect();
    hero.removeEventListener("pointermove", onPointerMove);
    hero.removeEventListener("pointerleave", onPointerLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    reducedMotion.removeEventListener("change", restart);
  };
}

function getActionTarget(hero: HTMLElement, ctaRef: RefObject<HTMLElement | null>): FieldTarget {
  const heroBounds = hero.getBoundingClientRect();
  const ctaBounds = ctaRef.current?.getBoundingClientRect();
  return {
    x: ctaBounds ? ctaBounds.left - heroBounds.left + ctaBounds.width / 2 : heroBounds.width * 0.26,
    y: ctaBounds ? ctaBounds.top - heroBounds.top + ctaBounds.height / 2 : heroBounds.height * 0.74,
    strength: 0.72,
  };
}

function draw(
  context: CanvasRenderingContext2D,
  points: ReturnType<typeof createPoints>,
  width: number,
  height: number,
  pointer: FieldTarget | null,
  action: FieldTarget,
) {
  context.clearRect(0, 0, width, height);
  context.lineWidth = 0.5;
  for (let outer = 0; outer < points.length; outer += 1) {
    const point = points[outer];
    const actionDistance = Math.hypot(point.x - action.x, point.y - action.y);
    const brightness = Math.max(0, 1 - actionDistance / ACTION_RADIUS);
    context.fillStyle = `rgba(${FIELD_WHITE},${0.22 + brightness * 0.56})`;
    context.beginPath();
    context.arc(point.x, point.y, POINT_RADIUS + brightness * 0.55, 0, Math.PI * 2);
    context.fill();
    for (let inner = outer + 1; inner < points.length; inner += 1) {
      const neighbour = points[inner];
      const distance = Math.hypot(point.x - neighbour.x, point.y - neighbour.y);
      if (distance > CONNECTION_DISTANCE) {
        continue;
      }
      const opacity = (1 - distance / CONNECTION_DISTANCE) * (pointer ? 0.24 : 0.1);
      context.strokeStyle = `rgba(${FIELD_WHITE},${opacity})`;
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(neighbour.x, neighbour.y);
      context.stroke();
    }
  }
  context.fillStyle = FIELD_SIGNAL;
  context.beginPath();
  context.arc(action.x, action.y, 3.5, 0, Math.PI * 2);
  context.fill();
}
