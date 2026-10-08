"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { DeviceToggle } from "@/src/demos/hub/components/DeviceToggle";
import type { Work } from "@/src/shared/works";

const DESKTOP_SIZE = { width: 1440, height: 900 };
const MOBILE_SIZE = { width: 390, height: 844 };

type PreviewFrameProps = { work: Work; isActive: boolean; onActivate: (id: Work["id"]) => void };

export function PreviewFrame({ work, isActive, onActivate }: PreviewFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [scale, setScale] = useState(1);
  const dimensions = device === "desktop" ? DESKTOP_SIZE : MOBILE_SIZE;

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && onActivate(work.id),
      { rootMargin: "10% 0px" },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [onActivate, work.id]);
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    const observer = new ResizeObserver(([entry]) =>
      setScale(entry.contentRect.width / dimensions.width),
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [dimensions.width]);
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => event.key === "Escape" && setIsInteractive(false);
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const poster = `/previews/${work.id}-${device}.webp`;
  return (
    <div
      className={`axm-preview-shell axm-preview-${work.id}`}
      style={{ "--axm-preview-brand": work.brandColor } as CSSProperties}
    >
      <div className="axm-preview-bar">
        <span className="axm-browser-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="axm-preview-address">axmion.example{work.route}</span>
        <DeviceToggle
          device={device}
          onChange={(nextDevice) => {
            setDevice(nextDevice);
            setIsLoaded(false);
            setIsInteractive(false);
          }}
        />
        <button
          type="button"
          className="axm-interact-button"
          aria-pressed={isInteractive}
          onClick={() => setIsInteractive((current) => !current)}
        >
          {isInteractive ? "Scroll page" : "Interact"}
        </button>
      </div>
      <div
        ref={frameRef}
        className={`axm-preview-viewport ${device === "mobile" ? "is-mobile" : ""}`}
      >
        <div className="axm-preview-stage" style={{ height: dimensions.height * scale }}>
          <Image
            className={`axm-preview-poster ${isLoaded ? "is-hidden" : ""}`}
            src={poster}
            alt={`${work.name} ${device} preview`}
            width={dimensions.width}
            height={dimensions.height}
            sizes="(max-width: 767px) 100vw, 58vw"
            priority={work.order === 1}
          />
          {isActive && (
            <iframe
              className={`axm-preview-iframe ${isLoaded ? "is-loaded" : ""} ${isInteractive ? "is-interactive" : ""}`}
              style={{
                transform: `scale(${scale})`,
                width: dimensions.width,
                height: dimensions.height,
              }}
              title={`${work.name} live ${device} preview`}
              src={`${work.route}?embed=1`}
              width={dimensions.width}
              height={dimensions.height}
              onLoad={() => setIsLoaded(true)}
            />
          )}
        </div>
      </div>
      <a className="axm-mobile-preview-link" href={work.route}>
        Open live demo
      </a>
    </div>
  );
}
