import { useEffect, useState } from "react";
import { formatClock } from "../../utils/formatClock";

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

  return formatClock(totalSeconds);
};

export default useChrono;
