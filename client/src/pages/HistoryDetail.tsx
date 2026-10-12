import { useParams } from "react-router";
import CompletedSessionView from "../components/history/CompletedSessionView";

function HistoryDetail() {
  const { id } = useParams();

  return <CompletedSessionView sessionId={Number(id)} />;
}

export default HistoryDetail;
