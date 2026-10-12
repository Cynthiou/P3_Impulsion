import { useEffect, useState } from "react";
import ClockIcon from "../../assets/icons/seance/clock.svg?react";

type ChronoProps = {
  startedAt: string;
};

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

const Chrono = ({ startedAt }: ChronoProps) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const totalSeconds = Math.max(
    0,
    Math.floor((now - new Date(startedAt).getTime()) / 1000),
  );

  return (
    <div className="flex shrink-0 items-center gap-2 font-display font-extrabold text-2xl text-base-content italic tabular-nums lg:text-3xl">
      <ClockIcon aria-hidden="true" className="size-5 text-neutral lg:size-6" />
      {formatChrono(totalSeconds)}
    </div>
  );
};

export default Chrono;
