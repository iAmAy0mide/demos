type DeviceToggleProps = {
  device: "desktop" | "mobile";
  onChange: (device: "desktop" | "mobile") => void;
};

export function DeviceToggle({ device, onChange }: DeviceToggleProps) {
  return (
    <div className="axm-device-toggle" aria-label="Preview device">
      {(["desktop", "mobile"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={device === option}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
