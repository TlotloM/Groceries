import { useEffect, useRef } from 'react';

/**
 * Wraps the native <dialog> element, which gives us a focus trap, Escape-to-close
 * and a dimmed backdrop for free. Children are only rendered while open, so the
 * form inside starts fresh every time.
 */
export default function Modal({ open, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onClose={onClose}
      // Clicking the dimmed area outside the form closes the pop-up.
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && children}
    </dialog>
  );
}