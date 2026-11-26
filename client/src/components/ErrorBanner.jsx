export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="banner" role="alert">
      <span>{message}</span>
      <button type="button" className="btn" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}
