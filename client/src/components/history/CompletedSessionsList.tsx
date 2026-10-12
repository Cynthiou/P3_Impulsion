import type { MonthGroup } from "../../utils/groupSessionsByMonth";
import CompletedSessionCard from "./CompletedSessionCard";

type CompletedSessionsListProps = {
  group: MonthGroup;
};

const CompletedSessionsList = ({ group }: CompletedSessionsListProps) => {
  return (
    <section>
      <h2 className="font-semibold text-accent text-xs uppercase tracking-widest">
        {group.title}
      </h2>

      <ul className="mt-3 grid gap-3">
        {group.sessions.map((session) => (
          <li key={session.id}>
            <CompletedSessionCard session={session} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default CompletedSessionsList;
