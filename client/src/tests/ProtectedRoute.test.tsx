import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";
import { AuthProvider } from "../contexts/AuthContext";
import authApi from "../services/authApi";

function renderRoutes(initialPath: string) {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<p>page de connexion</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<p>page privée</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe("ProtectedRoute", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("redirige vers la connexion quand aucune session n'est active", async () => {
    vi.spyOn(authApi, "fetchCurrentUser").mockResolvedValue(null);

    renderRoutes("/profile");

    await waitFor(() => {
      expect(screen.getByText("page de connexion")).toBeInTheDocument();
    });
  });

  test("affiche la page privée quand la session est valide", async () => {
    vi.spyOn(authApi, "fetchCurrentUser").mockResolvedValue({
      id: 1,
      username: "fabian",
      email: "fabian@test.fr",
    });

    renderRoutes("/profile");

    await waitFor(() => {
      expect(screen.getByText("page privée")).toBeInTheDocument();
    });
  });
});
