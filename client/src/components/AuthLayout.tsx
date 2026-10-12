import { Outlet } from "react-router";
import logoLight from "../assets/logo/logo-fond-clair.png";
import logoDark from "../assets/logo/logo-fond-sombre.png";
import useTheme from "../hooks/useTheme";

const AuthLayout = () => {
  const { theme } = useTheme();

  let logo = logoLight;

  if (theme === "impulsion-dark") {
    logo = logoDark;
  }

  return (
    <div className="min-h-screen bg-base-100 bg-radial-[at_50%_0%] from-primary/15 to-transparent to-70% px-4 text-base-content">
      <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center py-12">
        <img
          src={logo}
          alt="Impulsion"
          width={172}
          height={36}
          className="mb-10"
        />
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
