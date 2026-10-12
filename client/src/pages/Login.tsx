import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useMessages } from "../contexts/MessageContext";
import authApi from "../services/authApi";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser } = useAuth();

  const navigate = useNavigate();
  const { showMessage } = useMessages();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await authApi.loginUser({ email, password });

      if (result.success) {
        const currentUser = await authApi.fetchCurrentUser();
        setUser(currentUser);
        showMessage("Connexion réussie", "success");
        navigate("/", { replace: true });
        return;
      }

      setErrors(result.errors);
    } catch {
      setErrors({ global: "Impossible de contacter le serveur." });
    } finally {
      setIsSubmitting(false);
    }
  }
  const hasLoginError = errors.global !== undefined;

  return (
    <section>
      <header className="mb-8">
        <p className="mb-1 font-semibold text-primary text-sm uppercase tracking-wider">
          Ravi de te revoir
        </p>
        <h1 className="font-display font-extrabold text-4xl uppercase italic">
          Se connecter
        </h1>
        <p className="mt-2 text-base-content/70 text-sm">
          Connecte-toi pour retrouver tes séances et tes programmes.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-semibold text-sm">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={hasLoginError}
            aria-describedby={hasLoginError ? "login-error" : undefined}
            className="h-12 rounded-xl border border-base-300 bg-base-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="font-semibold text-sm">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={hasLoginError}
            aria-describedby={hasLoginError ? "login-error" : undefined}
            className="h-12 rounded-xl border border-base-300 bg-base-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {errors.global && (
          <p
            id="login-error"
            role="alert"
            className="rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-error text-sm"
          >
            {errors.global}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-xl bg-primary px-4 py-3.5 font-bold text-primary-content transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Connexion en cours…" : "Se connecter"}
        </button>
      </form>

      <p className="mt-8 text-center text-base-content/70 text-sm">
        Pas encore de compte ?{" "}
        <Link to="/register" className="font-semibold text-primary underline">
          Créer un compte
        </Link>
      </p>
    </section>
  );
}

export default Login;
