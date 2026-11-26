import { formatCents } from '../money.js';

export default function TotalBar({ totalCents, count, subtotals }) {
  return (
    <section className="card total" aria-live="polite">
      <div className="total-row">
        <span>Total ({count} {count === 1 ? 'item' : 'items'})</span>
        <strong>{formatCents(totalCents)}</strong>
      </div>
      {subtotals.length > 1 && (
        <ul className="subtotals">
          {subtotals.map((s) => (
            <li key={s.categoryId ?? 'none'}>
              <span>{s.name}</span>
              <span>{formatCents(s.totalCents)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}