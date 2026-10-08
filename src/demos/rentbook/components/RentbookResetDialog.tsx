type RentbookResetDialogProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export function RentbookResetDialog({ onCancel, onConfirm }: RentbookResetDialogProps) {
  return (
    <div className="rbk-dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title">
      <section className="rbk-confirm-panel">
        <h2 id="reset-title">Reset this demo?</h2>
        <p>This replaces locally saved payments with the original portfolio data.</p>
        <div>
          <button type="button" onClick={onCancel}>
            Keep my changes
          </button>
          <button className="rbk-danger" type="button" onClick={onConfirm}>
            Reset data
          </button>
        </div>
      </section>
    </div>
  );
}
