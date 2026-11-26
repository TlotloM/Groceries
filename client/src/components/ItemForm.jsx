import { useState } from "react";
import { ApiError } from "../api/client.js";
import { validatePrice } from "../money.js";

/** Used for both add and edit, inside the Modal. */
export default function ItemForm({ categories, item, onSubmit, onCancel }) {
  const editing = Boolean(item);
  const [name, setName] = useState(item?.name ?? "");
  const [size, setSize] = useState(item?.size ?? "");
  const [price, setPrice] = useState(
    item ? (item.priceCents / 100).toFixed(2) : "",
  );
  const [categoryId, setCategoryId] = useState(item?.category?.id ?? "");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const found = {};
    const trimmed = name.trim();
    if (!trimmed) found.name = "Enter an item name.";
    else if (trimmed.length > 100)
      found.name = "Name must be 100 characters or fewer.";
    if (size.trim().length > 30)
      found.size = "Size must be 30 characters or fewer.";
    const priceError = validatePrice(price);
    if (priceError) found.price = priceError;
    return found;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const clientErrors = validate();
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        size: size.trim() || null,
        price,
        categoryId: categoryId || null,
      });
      // On success the parent closes the pop-up.
    } catch (err) {
      // Server-side validation errors come back per field.
      setErrors(
        err instanceof ApiError
          ? { ...err.fields, form: err.message }
          : { form: "Something went wrong." },
      );
      setSubmitting(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2 id="modal-title">{editing ? "Edit item" : "Add item"}</h2>
      {errors.form && (
        <p className="field-error" role="alert">
          {errors.form}
        </p>
      )}

      <label htmlFor="name">Item name</label>
      <input
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        autoComplete="off"
        autoFocus
        aria-invalid={Boolean(errors.name)}
        aria-describedby={errors.name ? "name-error" : undefined}
      />
      {errors.name && (
        <p id="name-error" className="field-error">
          {errors.name}
        </p>
      )}

      <label htmlFor="size">Size (optional)</label>
      <input
        id="size"
        value={size}
        onChange={(e) => setSize(e.target.value)}
        maxLength={30}
        placeholder="e.g. 10kg, 2L, 500g"
        autoComplete="off"
        aria-invalid={Boolean(errors.size)}
        aria-describedby={errors.size ? "size-error" : undefined}
      />
      {errors.size && (
        <p id="size-error" className="field-error">
          {errors.size}
        </p>
      )}

      <label htmlFor="price">Price (ZAR)</label>
      <input
        id="price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        inputMode="decimal"
        placeholder="e.g. 24.99"
        autoComplete="off"
        aria-invalid={Boolean(errors.price)}
        aria-describedby={errors.price ? "price-error" : undefined}
      />
      {errors.price && (
        <p id="price-error" className="field-error">
          {errors.price}
        </p>
      )}

      <label htmlFor="category">Category</label>
      <select
        id="category"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        aria-invalid={Boolean(errors.categoryId)}
        aria-describedby={errors.categoryId ? "category-error" : undefined}
      >
        <option value="">No category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {errors.categoryId && (
        <p id="category-error" className="field-error">
          {errors.categoryId}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : editing ? "Save changes" : "Add item"}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
