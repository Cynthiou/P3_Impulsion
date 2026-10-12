import { useState } from "react";
import { Link } from "react-router";
import authApi from "../services/authApi";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setIsSuccess(false);

    try {
      const result = await authApi.registerUser({ username, email, password });

      if (result.success) {
        setUsername("");
        setEmail("");
        setPassword("");
        setIsSuccess(true);
        return;
      }

      setErrors(result.errors);
    } catch {
      setErrors({ global: "Impossible de contacter le serveur." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <header className="mb-8">
        <p className="mb-1 font-semibold text-primary text-sm uppercase tracking-wider">
          Bienvenue
        </p>
        <h1 className="font-display font-extrabold text-4xl uppercase italic">
          Créer un compte
        </h1>
        <p className="mt-2 text-base-content/70 text-sm">
          Crée ton compte pour préparer et suivre tes séances.
        </p>
      </header>

      {isSuccess && (
        <output className="mb-4 block rounded-xl border border-success/30 bg-success/10 px-4 py-2.5 text-success text-sm">
          Votre compte a bien été créé.
        </output>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="font-semibold text-sm">
            Pseudonyme
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            aria-invalid={errors.username !== undefined}
            aria-describedby={errors.username ? "username-error" : undefined}
            className="h-12 rounded-xl border border-base-300 bg-base-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {errors.username && (
            <p id="username-error" className="text-error text-sm">
              {errors.username}
            </p>
          )}
        </div>

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
            aria-invalid={errors.email !== undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="h-12 rounded-xl border border-base-300 bg-base-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {errors.email && (
            <p id="email-error" className="text-error text-sm">
              {errors.email}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="font-semibold text-sm">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={errors.password !== undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="h-12 rounded-xl border border-base-300 bg-base-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {errors.password && (
            <p id="password-error" className="text-error text-sm">
              {errors.password}
            </p>
          )}
        </div>

        {errors.global && (
          <p
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
          {isSubmitting ? "Création en cours…" : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-8 text-center text-base-content/70 text-sm">
        Déjà un compte ?{" "}
        <Link to="/login" className="font-semibold text-primary underline">
          Se connecter
        </Link>
      </p>
    </section>
  );
}

export default Register;
