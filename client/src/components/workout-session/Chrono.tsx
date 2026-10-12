import ClockIcon from "../../assets/icons/seance/clock.svg?react";
import useChrono from "../../hooks/workout-session/useChrono";

type ChronoProps = {
  startedAt: string;
};

const Chrono = ({ startedAt }: ChronoProps) => {
  const chrono = useChrono(startedAt);

  return (
    <div className="flex shrink-0 items-center gap-2 font-display font-extrabold text-2xl text-info italic tabular-nums lg:text-3xl">
      <ClockIcon aria-hidden="true" className="size-5 lg:size-6" />
      {chrono}
    </div>
  );
};

export default Chrono;
