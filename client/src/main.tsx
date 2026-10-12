import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { CurrentSessionProvider } from "./contexts/CurrentSessionContext";
import { MessageProvider } from "./contexts/MessageContext";

const rootElement = document.getElementById("root");

if (rootElement == null) {
  throw new Error(`Your HTML Document should contain a <div id="root"></div>`);
}

createRoot(rootElement).render(
  <StrictMode>
    <MessageProvider>
      <AuthProvider>
        <CurrentSessionProvider>
          <App />
        </CurrentSessionProvider>
      </AuthProvider>
    </MessageProvider>
  </StrictMode>,
);
