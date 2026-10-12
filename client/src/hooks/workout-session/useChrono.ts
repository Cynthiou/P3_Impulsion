import { useEffect, useState } from "react";

const formatChrono = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const ss = seconds < 10 ? `0${seconds}` : `${seconds}`;

  if (hours > 0) {
    const hh = hours < 10 ? `0${hours}` : `${hours}`;
    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
};

const useChrono = (startedAt: string | null) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (startedAt === null) {
    return "";
  }

  const totalSeconds = Math.max(
    0,
    Math.floor((now - new Date(startedAt).getTime()) / 1000),
  );

  return formatChrono(totalSeconds);
};

export default useChrono;
