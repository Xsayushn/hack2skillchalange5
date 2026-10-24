import React, { memo } from 'react';
import { CATEGORY_COLORS } from './budgetConstants';

interface BudgetDonutChartProps {
  categoryEntries: [string, number][];
  committedTotal: number;
  currencySymbol: string;
}

export const BudgetDonutChart: React.FC<BudgetDonutChartProps> = memo(
  ({ categoryEntries, committedTotal, currencySymbol }) => {
    let accumulatedPercent = 0;

    return (
      <div className="donut-and-legend">
        {/* SVG Donut Chart with full accessibility role & label */}
        <div className="donut-chart-wrapper">
          <svg
            viewBox="0 0 100 100"
            className="donut-svg"
            role="img"
            aria-label={`Spend allocation donut chart totaling ${currencySymbol}${committedTotal.toLocaleString()}`}
          >
            {categoryEntries.map(([cat, amount]) => {
              const pct = amount / (committedTotal || 1);
              const strokeDasharray = `${pct * 100} ${100 - pct * 100}`;
              const strokeDashoffset = -accumulatedPercent * 100;
              accumulatedPercent += pct;
              const color = CATEGORY_COLORS[cat] || '#8b5cf6';

              return (
                <circle
                  key={cat}
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke={color}
                  strokeWidth="15"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  pathLength="100"
                  className="donut-segment"
                >
                  <title>{`${cat}: ${currencySymbol}${amount.toLocaleString()} (${Math.round(pct * 100)}%)`}</title>
                </circle>
              );
            })}
          </svg>
          <div className="donut-center-text" aria-hidden="true">
            <span className="donut-total">
              {currencySymbol}
              {committedTotal.toLocaleString()}
            </span>
            <span className="donut-label">Allocated</span>
          </div>
        </div>

        {/* Screen-reader accessible alternative table */}
        <table className="sr-only" aria-label="Spend allocation breakdown by category">
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Amount</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {categoryEntries.map(([cat, amount]) => (
              <tr key={cat}>
                <td>{cat}</td>
                <td>
                  {currencySymbol}
                  {amount.toLocaleString()}
                </td>
                <td>{Math.round((amount / (committedTotal || 1)) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Category Legends */}
        <div className="donut-legend-grid" aria-hidden="true">
          {categoryEntries.map(([cat, amount]) => {
            const pct = Math.round((amount / (committedTotal || 1)) * 100);
            const color = CATEGORY_COLORS[cat] || '#8b5cf6';
            return (
              <div key={cat} className="legend-item">
                <span className="legend-indicator" style={{ backgroundColor: color }} />
                <span className="legend-name">{cat}</span>
                <span className="legend-val">
                  {currencySymbol}
                  {amount.toLocaleString()} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

BudgetDonutChart.displayName = 'BudgetDonutChart';
