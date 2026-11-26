import { useState } from "react";
import ErrorBanner from "./components/ErrorBanner.jsx";
import ItemForm from "./components/ItemForm.jsx";
import ItemList from "./components/ItemList.jsx";
import Modal from "./components/Modal.jsx";
import TotalBar from "./components/TotalBar.jsx";
import { useItems } from "./hooks/useItems.js";

export default function App() {
  const {
    items,
    totalCents,
    subtotals,
    categories,
    filter,
    setFilter,
    loading,
    error,
    dismissError,
    addItem,
    updateItem,
    removeItem,
  } = useItems();

  // formOpen controls the pop-up; editing is the item being edited (null = adding).
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  async function handleSubmit(input) {
    if (editing) await updateItem(editing.id, input);
    else await addItem(input);
    closeForm();
  }

  return (
    <main className="app">
      <header className="page-header">
        <h1>Grocery Price Tracker</h1>
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          + Add item
        </button>
      </header>

      <ErrorBanner message={error} onDismiss={dismissError} />

      <TotalBar
        totalCents={totalCents}
        count={items.length}
        subtotals={subtotals}
      />

      <section className="card">
        <div className="list-header">
          <h2>Items</h2>
          <label htmlFor="filter" className="sr-only">
            Filter by category
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <p className="empty">
            Loading… the server can take up to a minute to wake up.
          </p>
        ) : (
          <ItemList items={items} onEdit={openEdit} onDelete={removeItem} />
        )}
      </section>

      <Modal open={formOpen} onClose={closeForm}>
        <ItemForm
          categories={categories}
          item={editing}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>
    </main>
  );
}
