import { useEffect, useMemo, useState } from 'react';

export type CountdownValue = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
};

const EMPTY_COUNTDOWN: CountdownValue = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isComplete: true,
};

export function calculateCountdown(
  targetTime: number,
  now = Date.now(),
): CountdownValue {
  if (!Number.isFinite(targetTime)) {
    return EMPTY_COUNTDOWN;
  }

  const remainingSeconds = Math.max(0, Math.ceil((targetTime - now) / 1000));
  const days = Math.floor(remainingSeconds / 86_400);
  const hours = Math.floor((remainingSeconds % 86_400) / 3_600);
  const minutes = Math.floor((remainingSeconds % 3_600) / 60);
  const seconds = remainingSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isComplete: remainingSeconds === 0,
  };
}

export function useCountdown(
  scheduledStartTime: string,
  active: boolean,
  onComplete: () => void,
): CountdownValue {
  const targetTime = useMemo(
    () => new Date(scheduledStartTime).getTime(),
    [scheduledStartTime],
  );
  const [countdown, setCountdown] = useState(() =>
    calculateCountdown(targetTime),
  );

  useEffect(() => {
    setCountdown(calculateCountdown(targetTime));
  }, [targetTime]);

  useEffect(() => {
    if (!active || !Number.isFinite(targetTime)) {
      return;
    }

    let completionNotified = false;
    const update = () => {
      const nextCountdown = calculateCountdown(targetTime);
      setCountdown(nextCountdown);
      if (nextCountdown.isComplete && !completionNotified) {
        completionNotified = true;
        onComplete();
      }
    };

    update();
    const intervalId = setInterval(update, 1_000);
    return () => clearInterval(intervalId);
  }, [active, onComplete, targetTime]);

  return countdown;
}
