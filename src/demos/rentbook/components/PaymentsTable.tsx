import { formatRentbookDate, naira } from "../lib/finance";

import type { PaymentRow, SortKey } from "./Payments";

type PaymentsTableProps = {
  rows: PaymentRow[];
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
};

export function PaymentsTable({ rows, sort, onSortChange }: PaymentsTableProps) {
  return (
    <div
      className="rbk-payments-table"
      role="region"
      aria-label="Payments ledger"
      data-scroll-x="intentional"
    >
      <table>
        <thead>
          <tr>
            {(["date", "tenant", "amount"] as const).map((key) => (
              <th key={key}>
                <button type="button" onClick={() => onSortChange(key)}>
                  {sortLabel(key)}
                  {sort === key ? " ↓" : ""}
                </button>
              </th>
            ))}
            <th>Receipt</th>
            <th>Unit / property</th>
            <th>Method</th>
            <th>Allocated charges</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => <PaymentTableRow key={row.payment.id} row={row} />)
          ) : (
            <tr>
              <td colSpan={7}>No payments match these filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PaymentTableRow({ row }: { row: PaymentRow }) {
  return (
    <tr>
      <td>{formatRentbookDate(row.payment.date)}</td>
      <td>
        <b>{row.tenant}</b>
      </td>
      <td className="rbk-balance">{naira(row.payment.amount)}</td>
      <td>
        <button
          className="rbk-receipt-link"
          type="button"
          onClick={() => openReceipt(row.receiptId)}
        >
          {row.receipt}
        </button>
      </td>
      <td>
        {row.unit}
        <small>{row.property}</small>
      </td>
      <td>{row.payment.method.replace("_", " ")}</td>
      <td>
        {row.payment.allocations.length} charge
        {row.payment.allocations.length === 1 ? "" : "s"}
      </td>
    </tr>
  );
}

function openReceipt(receiptId: string) {
  window.history.pushState({}, "", `?receipt=${receiptId}`);
  window.dispatchEvent(new CustomEvent("rentbook:receipt", { detail: { receiptId } }));
}

function sortLabel(key: SortKey) {
  return { date: "Date", tenant: "Tenant", amount: "Amount" }[key];
}
