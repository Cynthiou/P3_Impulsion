import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";
import { AuthProvider } from "../contexts/AuthContext";
import { MessageProvider } from "../contexts/MessageContext";
import Profile from "../pages/Profile";
import authApi from "../services/authApi";

const fakeUser = {
  id: 1,
  username: "fabian",
  email: "fabian@test.fr",
};

function renderProfile() {
  render(
    <MessageProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route path="/login" element={<p>page de connexion</p>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </MessageProvider>,
  );
}

describe("Déconnexion", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("déconnecte l'utilisateur et redirige vers la connexion", async () => {
    vi.spyOn(authApi, "fetchCurrentUser").mockResolvedValue(fakeUser);
    vi.spyOn(authApi, "logoutUser").mockResolvedValue(undefined);

    renderProfile();

    const logoutButton = await screen.findByRole("button", {
      name: "Se déconnecter",
    });
    await userEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText("page de connexion")).toBeInTheDocument();
    });
  });

  test("garde l'utilisateur connecté si la déconnexion échoue", async () => {
    vi.spyOn(authApi, "fetchCurrentUser").mockResolvedValue(fakeUser);
    vi.spyOn(authApi, "logoutUser").mockRejectedValue(
      new Error("réseau indisponible"),
    );

    renderProfile();

    const logoutButton = await screen.findByRole("button", {
      name: "Se déconnecter",
    });
    await userEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText("fabian")).toBeInTheDocument();
    });
  });

  test("redirige vers la connexion quand la session a déjà expiré", async () => {
    vi.spyOn(authApi, "fetchCurrentUser").mockResolvedValue(null);

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText("page de connexion")).toBeInTheDocument();
    });
  });

  test("garde l'utilisateur connecté si le serveur renvoie une erreur", async () => {
    vi.spyOn(authApi, "fetchCurrentUser").mockResolvedValue(fakeUser);
    vi.spyOn(authApi, "logoutUser").mockRejectedValue(
      new Error("Impossible de se déconnecter"),
    );

    renderProfile();

    const logoutButton = await screen.findByRole("button", {
      name: "Se déconnecter",
    });
    await userEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText("fabian")).toBeInTheDocument();
    });
  });
});
