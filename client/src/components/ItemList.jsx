import { formatCents } from "../money.js";

export default function ItemList({ items, onEdit, onDelete }) {
  if (items.length === 0) {
    return (
      <p className="empty">
        No items yet. Tap "Add item" to add your first one.
      </p>
    );
  }
  return (
    <ul className="items">
      {items.map((item) => (
        <li key={item.id} className="item">
          <div className="item-main">
            <span className="item-name">{item.name}</span>
            <div className="item-meta">
              {item.size && <span className="item-size">{item.size}</span>}
              {item.category && (
                <span className="tag">{item.category.name}</span>
              )}
            </div>
          </div>
          <span className="item-price">{formatCents(item.priceCents)}</span>
          <div className="item-actions">
            <button
              type="button"
              className="btn"
              aria-label={`Edit ${item.name}`}
              onClick={() => onEdit(item)}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-danger"
              aria-label={`Delete ${item.name}`}
              onClick={() => {
                if (window.confirm(`Delete "${item.name}"?`)) onDelete(item.id);
              }}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
