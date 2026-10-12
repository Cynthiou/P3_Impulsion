import type { ReactNode } from "react";
import { Link } from "react-router";
import ChevronLeftIcon from "../../assets/icons/chevrons/chevron-left.svg?react";

type SessionHeaderProps = {
  children: ReactNode;
};

const SessionHeader = ({ children }: SessionHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-2 border-base-300 border-b pb-4 lg:pb-6">
      <div className="flex min-w-0 items-center gap-1">
        <Link
          to="/sessions"
          aria-label="Retour aux séances"
          className="-ml-2 grid size-10 shrink-0 place-items-center rounded-full text-base-content transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2"
        >
          <ChevronLeftIcon aria-hidden="true" className="size-6" />
        </Link>

        <h1 className="whitespace-nowrap py-0.5 font-display font-extrabold text-2xl uppercase italic leading-snug lg:text-4xl">
          Ma séance
        </h1>
      </div>

      {children}
    </div>
  );
};

export default SessionHeader;
