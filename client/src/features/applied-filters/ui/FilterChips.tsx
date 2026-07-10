interface FilterChipsProps {
  text: string;
  hobbies: string[];
  nationalities: string[];
  onClearText: () => void;
  onRemoveHobby: (value: string) => void;
  onRemoveNationality: (value: string) => void;
  onClearAll: () => void;
}

export function FilterChips({
  text,
  hobbies,
  nationalities,
  onClearText,
  onRemoveHobby,
  onRemoveNationality,
  onClearAll,
}: FilterChipsProps) {
  const hasFilters = Boolean(text) || hobbies.length > 0 || nationalities.length > 0;
  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {text && <Chip label={`Search: ${text}`} onRemove={onClearText} />}
      {hobbies.map((hobby) => (
        <Chip key={`hobby-${hobby}`} label={`Hobby: ${hobby}`} onRemove={() => onRemoveHobby(hobby)} />
      ))}
      {nationalities.map((nationality) => (
        <Chip
          key={`nationality-${nationality}`}
          label={`Nationality: ${nationality}`}
          onRemove={() => onRemoveNationality(nationality)}
        />
      ))}
      <button className="text-sm font-bold text-[#65746d] transition hover:text-[#101820]" type="button" onClick={onClearAll}>
        Clear all
      </button>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#d84a6a]/30 bg-[#d84a6a]/10 px-3 py-1.5 text-sm font-bold text-[#8f2940]">
      {label}
      <button aria-label={`Remove ${label}`} className="text-[#8f2940]/70 transition hover:text-[#101820]" type="button" onClick={onRemove}>
        ×
      </button>
    </span>
  );
}
