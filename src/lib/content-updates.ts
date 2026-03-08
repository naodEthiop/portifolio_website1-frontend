const KEY = "portfolio_content_updated_at";
const EVENT_NAME = "portfolio:content-updated";

export function signalContentUpdated() {
  try {
    localStorage.setItem(KEY, String(Date.now()));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // ignore
  }
}

export function subscribeToContentUpdates(onUpdate: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === KEY) {
      onUpdate();
    }
  };
  const localHandler = () => onUpdate();
  window.addEventListener("storage", handler);
  window.addEventListener(EVENT_NAME, localHandler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(EVENT_NAME, localHandler);
  };
}
