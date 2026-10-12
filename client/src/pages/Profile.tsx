import { useState } from "react";
import { useNavigate } from "react-router";
import UserIcon from "../assets/icons/navigation/user.svg?react";
import { useAuth } from "../contexts/AuthContext";
import { useMessages } from "../contexts/MessageContext";
import authApi from "../services/authApi";

function Profile() {
  const { user, setUser } = useAuth();
  const { showMessage } = useMessages();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await authApi.logoutUser();
      setUser(null);
      showMessage("Vous êtes déconnecté", "success");
      navigate("/login", { replace: true });
    } catch {
      showMessage("Impossible de se déconnecter", "error");
      setIsLoggingOut(false);
    }
  }

  return (
    <section className="w-full md:py-4">
      <h1 className="font-display font-extrabold text-2xl uppercase italic">
        Mon profil
      </h1>

      <div className="mx-auto max-w-xs">
        <span className="mx-auto mt-6 grid size-12 place-items-center rounded-full bg-secondary/20 text-info">
          <UserIcon aria-hidden="true" className="size-6" />
        </span>

        {user !== null && (
          <dl className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <dt className="font-semibold text-info text-xs uppercase tracking-wider">
                Pseudo
              </dt>
              <dd className="rounded-lg border border-base-300 bg-base-200 px-4 py-3 lg:px-3 lg:py-2 lg:text-sm">
                {user.username}
              </dd>
            </div>
            <div className="flex flex-col gap-1.5">
              <dt className="font-semibold text-info text-xs uppercase tracking-wider">
                Adresse e-mail
              </dt>
              <dd className="truncate rounded-lg border border-base-300 bg-base-200 px-4 py-3 lg:px-3 lg:py-2 lg:text-sm">
                {user.email}
              </dd>
            </div>
          </dl>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-8 w-full rounded-lg bg-primary px-4 py-3.5 font-semibold text-primary-content lg:py-2.5 lg:text-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoggingOut ? "Déconnexion…" : "Se déconnecter"}
        </button>
      </div>
    </section>
  );
}

export default Profile;
