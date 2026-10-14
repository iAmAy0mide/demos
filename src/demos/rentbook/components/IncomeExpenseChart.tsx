import { naira } from "../lib/finance";

export type ChartMonth = { key: string; label: string; income: number; expenses: number };

type IncomeExpenseChartProps = {
  months: ChartMonth[];
  showTable: boolean;
  onToggle: () => void;
};

export function IncomeExpenseChart({ months, showTable, onToggle }: IncomeExpenseChartProps) {
  const maximum = Math.max(...months.flatMap((month) => [month.income, month.expenses]), 1);
  return (
    <article className="rbk-income-chart">
      <p>Cash movement</p>
      <h2>Income and expenses</h2>
      <div className="rbk-chart-legend">
        <span>Income bars</span>
        <span>Expense line</span>
        <button type="button" onClick={onToggle} aria-expanded={showTable}>
          View as table
        </button>
      </div>
      <svg
        className="rbk-monthly-chart"
        viewBox="0 0 720 240"
        role="img"
        aria-label="Twelve month income and expenses chart"
      >
        {[0, 1, 2, 3].map((line) => (
          <line key={line} x1="42" x2="700" y1={20 + line * 52} y2={20 + line * 52} />
        ))}
        <polyline
          points={months
            .map((month, index) => `${57 + index * 57},${212 - (month.expenses / maximum) * 180}`)
            .join(" ")}
        />
        {months.map((month, index) => (
          <ChartBar key={month.key} month={month} index={index} maximum={maximum} />
        ))}
      </svg>
      {showTable ? (
        <table className="rbk-chart-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Income</th>
              <th>Expenses</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month) => (
              <tr key={month.key}>
                <td>{month.label}</td>
                <td>{naira(month.income)}</td>
                <td>{naira(month.expenses)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </article>
  );
}

function ChartBar({
  month,
  index,
  maximum,
}: {
  month: ChartMonth;
  index: number;
  maximum: number;
}) {
  const height = (month.income / maximum) * 180;
  const x = 46 + index * 57;
  return (
    <g>
      <rect tabIndex={0} x={x} y={212 - height} width="22" height={height}>
        <title>
          {month.label}: income {naira(month.income)}, expenses {naira(month.expenses)}
        </title>
      </rect>
      <circle cx={x + 11} cy={212 - (month.expenses / maximum) * 180} r="3" />
      <text x={x + 11} y="236" textAnchor="middle">
        {month.label}
      </text>
    </g>
  );
}
