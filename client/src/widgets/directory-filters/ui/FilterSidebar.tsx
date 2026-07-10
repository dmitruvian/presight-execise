import type { FacetValue } from '../../../entities/user';

interface FilterSidebarProps {
  hobbies: FacetValue[];
  nationalities: FacetValue[];
  selectedHobbies: string[];
  selectedNationalities: string[];
  hasPendingChanges: boolean;
  onApply: () => void;
  onReset: () => void;
  onToggleHobby: (value: string) => void;
  onToggleNationality: (value: string) => void;
}

export function FilterSidebar({
  hobbies,
  nationalities,
  selectedHobbies,
  selectedNationalities,
  hasPendingChanges,
  onApply,
  onReset,
  onToggleHobby,
  onToggleNationality,
}: FilterSidebarProps) {
  return (
    <aside className="self-start rounded-[1.75rem] border border-[#ccd7d0] bg-white p-5 shadow-[0_18px_60px_rgba(16,24,32,0.07)] lg:sticky lg:top-6">
      <div className="border-b border-[#e0e8e3] pb-4">
        <h2 className="text-xl font-black tracking-[-0.035em] text-[#101820]">Facet console</h2>
        <p className="mt-1 text-sm leading-6 text-[#65746d]">Combine interests and nationalities to narrow the field.</p>
      </div>
      <div className="mt-7 space-y-7">
        <FacetGroup title="Top 20 Hobbies" values={hobbies} selected={selectedHobbies} onToggle={onToggleHobby} />
        <FacetGroup
          title="Top 20 Nationalities"
          values={nationalities}
          selected={selectedNationalities}
          onToggle={onToggleNationality}
        />
        <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-[#e0e8e3] pt-4">
          <button
            className="rounded-2xl border border-[#a52f4a] bg-[#d84a6a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#c83d5d] disabled:cursor-not-allowed disabled:border-[#ccd7d0] disabled:bg-[#e7eee9] disabled:text-[#7c8c84]"
            disabled={!hasPendingChanges}
            type="button"
            onClick={onApply}
          >
            Apply filters
          </button>
          <button
            className="rounded-2xl border border-[#ccd7d0] bg-[#f8faf8] px-4 py-3 text-sm font-bold text-[#405148] transition hover:border-[#b5c6bc] hover:bg-white disabled:cursor-not-allowed disabled:text-[#9aac9f]"
            disabled={!hasPendingChanges}
            type="button"
            onClick={onReset}
          >
            Reset
          </button>
        </div>
      </div>
    </aside>
  );
}

function FacetGroup({
  title,
  values,
  selected,
  onToggle,
}: {
  title: string;
  values: FacetValue[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const options = mergeSelectedOptions(values, selected);

  return (
    <section>
      <h3 className="mb-3 text-sm font-black text-[#25342d]">{title}</h3>
      <div className="h-72 overflow-auto pr-1">
        {options.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#ccd7d0] bg-[#f8faf8] p-3 text-sm text-[#65746d]">
            No facets available.
          </p>
        ) : (
          <div className="space-y-1">
          {options.map((facet) => {
            const checked = selected.includes(facet.value);
            return (
              <label
                key={facet.value}
                className={
                  checked
                    ? 'flex cursor-pointer items-center gap-3 rounded-2xl border border-[#d84a6a]/25 bg-[#d84a6a]/10 px-3 py-2.5 text-sm'
                    : 'flex cursor-pointer items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-sm transition hover:border-[#ccd7d0] hover:bg-[#f8faf8]'
                }
              >
                <input
                  checked={checked}
                  className="h-4 w-4 rounded border-[#9aac9f] accent-[#d84a6a] focus:ring-[#d84a6a]"
                  type="checkbox"
                  onChange={() => onToggle(facet.value)}
                />
                <span className="min-w-0 flex-1 truncate font-medium text-[#25342d]">{facet.value}</span>
                <span className="rounded-full bg-[#e7eee9] px-2 py-0.5 font-mono text-xs text-[#65746d]">
                  {facet.count}
                </span>
              </label>
            );
          })}
          </div>
        )}
      </div>
    </section>
  );
}

function mergeSelectedOptions(values: FacetValue[], selected: string[]) {
  const options = values.slice(0, 20);
  const optionValues = new Set(options.map((option) => option.value));

  selected.forEach((value) => {
    if (!optionValues.has(value)) {
      options.unshift({ value, count: 0 });
    }
  });

  return options;
}
