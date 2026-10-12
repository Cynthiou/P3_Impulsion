import { useEffect } from "react";
import { useMessages } from "../contexts/MessageContext";

const useErrorMessage = (error: string | null) => {
  const { showMessage } = useMessages();

  useEffect(() => {
    if (error !== null) {
      showMessage(error, "error");
    }
  }, [error, showMessage]);
};

export default useErrorMessage;
