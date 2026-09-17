export function createIntroState() {
  let seen = false;
  const listeners = new Set<() => void>();

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },

    snapshot() {
      return seen;
    },

    read(): Promise<boolean> {
      return Promise.resolve(seen);
    },

    async complete(): Promise<void> {
      if (seen) return;

      seen = true;
      notify();
    },
  };
}