export const EVENTS = {
  start: "start",
  stop: "stop",
  reset: "reset",
  tick: "tick",
} as const;

type Listener = () => void;

const createEmitter = () => {
  const listeners = new Map<string, Set<Listener>>();

  const on = (eventName: string, listener: Listener) => {
    let set = listeners.get(eventName);
    if (!set) {
      set = new Set();
      listeners.set(eventName, set);
    }
    set.add(listener);
  };

  const off = (eventName: string, listener: Listener) => {
    listeners.get(eventName)?.delete(listener);
  };

  const emit = (eventName: string) => {
    const set = listeners.get(eventName);
    if (!set) return;
    for (const l of set) l();
  };

  return { on, off, emit };
};

/** 1s おきに通知するタイマー（関数型実装） */
export const createTimer = () => {
  let startTime: number | null = null;
  let elapsedMs = 0;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const { on, off, emit } = createEmitter();

  const tick = () => {
    elapsedMs = Date.now() - (startTime || 0);
    emit(EVENTS.tick);
  };

  const start = () => {
    if (intervalId !== null) return;
    startTime = Date.now() - elapsedMs;
    intervalId = setInterval(tick, 1000);
    emit(EVENTS.start);
  };

  const stop = () => {
    if (intervalId === null) return;
    clearInterval(intervalId);
    intervalId = null;
    elapsedMs = Date.now() - (startTime || 0);
    emit(EVENTS.stop);
  };

  const reset = () => {
    stop();
    elapsedMs = 0;
    emit(EVENTS.reset);
  };

  const getElapsedSeconds = () => Math.floor(elapsedMs / 1000);
  const isRunning = () => intervalId !== null;

  return {
    // control
    start,
    stop,
    reset,
    // state accessors
    getElapsedSeconds,
    isRunning,
    // events
    on,
    off,
  };
};
