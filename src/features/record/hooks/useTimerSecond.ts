import { useEffect, useRef, useSyncExternalStore } from "react";
import { EVENTS, createTimer } from "../../../utils/timer";

type UseTimerSecondsReturn = {
  time: number;
  running: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
};

export default function useTimerSeconds(): UseTimerSecondsReturn {
  const timerRef = useRef<TimerStore>(createTimerStore());
  const timer = timerRef.current;

  const state = useSyncExternalStore(timer.subscribe.bind(timer), () =>
    timer.getSnapshot()
  );

  useEffect(() => {
    return () => {
      timer.stop();
    };
  }, [timer]);

  return {
    time: state.elapsedTime,
    running: state.isRunning,
    start: timer.start,
    stop: timer.stop,
    reset: timer.reset,
  };
}

type TimerStore = ReturnType<typeof createTimerStore>;

const createTimerStore = () => {
  const timer = createTimer();

  let state = {
    elapsedTime: timer.getElapsedSeconds(),
    isRunning: timer.isRunning(),
  };

  const notifyListeners = createNotifier();

  const onStateChange = () => {
    const next = {
      elapsedTime: timer.getElapsedSeconds(),
      isRunning: timer.isRunning(),
    };
    if (
      next.elapsedTime !== state.elapsedTime ||
      next.isRunning !== state.isRunning
    ) {
      state = next;
      notifyListeners.emit();
    }
  };

  timer.on(EVENTS.tick, onStateChange);
  timer.on(EVENTS.start, onStateChange);
  timer.on(EVENTS.stop, onStateChange);
  timer.on(EVENTS.reset, onStateChange);

  return {
    start: timer.start,
    stop: timer.stop,
    reset: timer.reset,
    getSnapshot: () => state,
    subscribe: (listener: () => void) => notifyListeners.subscribe(listener),
  };
};

const createNotifier = () => {
  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const emit = () => {
    for (const l of listeners) l();
  };
  return { subscribe, emit };
};
