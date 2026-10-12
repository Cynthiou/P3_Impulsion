import { useState } from "react";
import HistoryFilters from "../components/history/HistoryFilters";
import HistoryTabs from "../components/history/HistoryTabs";
import SessionMonthGroup from "../components/history/SessionMonthGroup";
import useHistorySessions from "../hooks/history/useHistorySessions";
import type { HistoryFilter } from "../types/filters";
import { groupSessionsByMonth } from "../utils/groupSessionsByMonth";

function History() {
  const { sessions, loading, error } = useHistorySessions();
  const [filter, setFilter] = useState<HistoryFilter>("all");

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (sessions.length === 0) {
    return <p>Aucune séance terminée.</p>;
  }

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const monthSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.date);
    return (
      sessionDate.getMonth() === currentMonth &&
      sessionDate.getFullYear() === currentYear
    );
  });

  const sevenDaysSessions = sessions.filter(
    (session) => new Date(session.date) >= sevenDaysAgo,
  );

  let filteredSessions = sessions;

  if (filter === "month") {
    filteredSessions = monthSessions;
  }

  if (filter === "sevenDays") {
    filteredSessions = sevenDaysSessions;
  }

  const monthGroups = groupSessionsByMonth(filteredSessions);

  let countText = `${filteredSessions.length} séances`;

  if (filteredSessions.length <= 1) {
    countText = `${filteredSessions.length} séance`;
  }

  const monthList = monthGroups.map((monthGroup) => (
    <SessionMonthGroup key={monthGroup.title} group={monthGroup} />
  ));

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display font-extrabold text-2xl uppercase italic">
          Historique
        </h1>
        <p className="font-semibold text-base-content/60 text-xs uppercase tracking-widest">
          {countText}
        </p>
      </div>

      <HistoryTabs />
      <HistoryFilters filter={filter} setFilter={setFilter} />

      {filteredSessions.length === 0 && (
        <p className="mt-6 text-base-content/70 text-sm">
          Aucune séance sur cette période.
        </p>
      )}

      <div className="mt-6 grid gap-6">{monthList}</div>
    </section>
  );
}

export default History;
