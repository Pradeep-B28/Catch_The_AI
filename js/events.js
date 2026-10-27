// Central event bus coordinating decoupled game, sound, analytics, and sharing events.
// Uses no external dependencies; maintains an internal listener map.
// Used across router, game engine, analytics, audio fx, and screen views.

const listeners = new Map();

/**
 * Register a listener for an event name.
 * @param {string} event
 * @param {Function} handler
 * @returns {Function} Unsubscribe function
 */
export function on(event, handler) {
  if (typeof handler !== "function") return () => {};
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event).add(handler);
  return () => {
    const set = listeners.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) listeners.delete(event);
    }
  };
}

/**
 * Emit an event with data to all registered listeners.
 * @param {string} event
 * @param {*} [data]
 */
export function emit(event, data) {
  const set = listeners.get(event);
  if (!set || set.size === 0) return;
  for (const handler of Array.from(set)) {
    try {
      handler(data);
    } catch {
      // Isolate listener errors to prevent disrupting event dispatch
    }
  }
}

/**
 * Remove all listeners for an event, or all listeners if no event specified.
 * Primarily used by test suites and teardown.
 * @param {string} [event]
 */
export function clearEvents(event) {
  if (event) {
    listeners.delete(event);
  } else {
    listeners.clear();
  }
}
