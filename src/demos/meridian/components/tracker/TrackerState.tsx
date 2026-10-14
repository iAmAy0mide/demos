import type { Shipment } from "@/src/demos/meridian/types";

import { ShipmentResult } from "./ShipmentResult";

type TrackerStateProps = {
  requested: string;
  isLoading: boolean;
  hasFormatError: boolean;
  shipment: Shipment | undefined;
};

export function TrackerState({
  requested,
  isLoading,
  hasFormatError,
  shipment,
}: TrackerStateProps) {
  if (isLoading) {
    return (
      <div className="mrd-result-state" aria-live="polite">
        Reading movement record…
      </div>
    );
  }
  if (!requested) {
    return (
      <div className="mrd-result-state">
        Enter a shipment number to view its route, handling events and document register.
      </div>
    );
  }
  if (hasFormatError) {
    return (
      <div className="mrd-result-state mrd-error" role="alert">
        Use the format MRD-12345. You can also choose one of the demo records above.
      </div>
    );
  }
  if (!shipment) {
    return (
      <div className="mrd-result-state mrd-error" role="alert">
        We could not find that record. Check the reference or use a demo number.
      </div>
    );
  }
  return <ShipmentResult shipment={shipment} />;
}
