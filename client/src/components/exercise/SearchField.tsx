type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
};

function SearchField({ value, onChange, disabled }: SearchFieldProps) {
  return (
    <div className="join w-full">
      {/* le label sert de "boite" pour poser l'icone a cote de l'input */}
      <label
        className={`input input-bordered join-item flex h-11 w-full items-center gap-3 rounded-xl border-base-300 bg-base-200/40 px-4 text-base ${disabled ? "opacity-50" : ""}`}
      >
        {/* icone loupe ecrite directement en SVG : le projet n'a pas de librairie d'icones */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 opacity-60"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Rechercher un exercice..."
          disabled={disabled}
          className="grow placeholder:text-neutral"
        />
      </label>
    </div>
  );
}

export default SearchField;
