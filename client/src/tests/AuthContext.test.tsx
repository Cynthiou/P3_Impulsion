import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import authApi from "../services/authApi";

function AuthProbe() {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return <p>initialisation</p>;
  }

  return <p>{user === null ? "déconnecté" : user.username}</p>;
}

function renderWithProvider() {
  render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>,
  );
}

describe("AuthContext", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("affiche l'état d'initialisation avant la réponse du serveur", () => {
    vi.spyOn(authApi, "fetchCurrentUser").mockReturnValue(
      new Promise(() => {}),
    );

    renderWithProvider();

    expect(screen.getByText("initialisation")).toBeInTheDocument();
  });

  test("restaure l'utilisateur quand la session est valide", async () => {
    vi.spyOn(authApi, "fetchCurrentUser").mockResolvedValue({
      id: 1,
      username: "fabian",
      email: "fabian@test.fr",
    });

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByText("fabian")).toBeInTheDocument();
    });
  });

  test("laisse l'utilisateur déconnecté quand la session a expiré", async () => {
    vi.spyOn(authApi, "fetchCurrentUser").mockResolvedValue(null);

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByText("déconnecté")).toBeInTheDocument();
    });
  });

  test("laisse l'utilisateur déconnecté si le réseau échoue", async () => {
    vi.spyOn(authApi, "fetchCurrentUser").mockRejectedValue(
      new Error("réseau indisponible"),
    );

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByText("déconnecté")).toBeInTheDocument();
    });
  });
});
