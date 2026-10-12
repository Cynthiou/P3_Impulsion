import { useParams } from "react-router";
import CompletedSessionDetail from "../components/history/CompletedSessionDetail";

const HistoryDetail = () => {
  const { id } = useParams();

  return <CompletedSessionDetail sessionId={Number(id)} />;
};

export default HistoryDetail;
