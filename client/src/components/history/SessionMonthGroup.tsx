import type { MonthGroup } from "../../utils/groupSessionsByMonth";
import SessionHistoryCard from "./SessionHistoryCard";

type SessionMonthGroupProps = {
  group: MonthGroup;
};

const SessionMonthGroup = ({ group }: SessionMonthGroupProps) => {
  return (
    <section>
      <h2 className="font-semibold text-accent text-xs uppercase tracking-widest">
        {group.title}
      </h2>

      <ul className="mt-3 grid gap-3">
        {group.sessions.map((session) => (
          <li key={session.id}>
            <SessionHistoryCard session={session} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SessionMonthGroup;
