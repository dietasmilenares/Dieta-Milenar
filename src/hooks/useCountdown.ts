import { useState, useEffect } from 'react';

interface UseCountdownReturn {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const useCountdown = (initialMinutes: number): UseCountdownReturn => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60 * 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return { hours, minutes, seconds, isExpired: timeLeft <= 0 };
};
