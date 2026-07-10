import type { SortDirection, SortField } from '../../../entities/user';

interface ControlsProps {
  text: string;
  sortField: SortField;
  sortDirection: SortDirection;
  isDocked?: boolean;
  onTextChange: (text: string) => void;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
}

const sortLabels: Record<SortField, string> = {
  first_name: 'First name',
  last_name: 'Last name',
  age: 'Age',
  nationality: 'Nationality',
};

export function Controls({
  text,
  sortField,
  sortDirection,
  isDocked = false,
  onTextChange,
  onSortFieldChange,
  onSortDirectionChange,
}: ControlsProps) {
  const nextSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';

  return (
    <div
      id="directory-controls"
      className={
        isDocked
          ? 'grid gap-4 rounded-[1.6rem] border border-[#ccd7d0] bg-white/95 p-4 shadow-[0_24px_70px_rgba(16,24,32,0.14)] backdrop-blur'
          : 'grid gap-4 rounded-[1.6rem] border border-[#ccd7d0] bg-white p-4 shadow-[0_18px_60px_rgba(16,24,32,0.07)] md:grid-cols-[minmax(0,1fr)_auto_auto]'
      }
    >
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-[#25342d]">Search the directory</span>
        <input
          className="w-full rounded-2xl border border-[#ccd7d0] bg-[#f8faf8] px-4 py-3 text-[#101820] outline-none transition placeholder:text-[#7c8c84] focus:border-[#d84a6a] focus:bg-white focus:ring-2 focus:ring-[#d84a6a]/20"
          placeholder="Search by first or last name"
          type="search"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
        />
      </label>
      <label className="block text-sm font-bold text-[#25342d]">
        <span className="mb-2 block">Sort by</span>
        <span className="relative block">
          <select
            className={
              isDocked
                ? 'w-full appearance-none rounded-2xl border border-[#ccd7d0] bg-[#f8faf8] px-3 py-3 pr-10 text-[#101820] outline-none transition focus:border-[#d84a6a] focus:bg-white focus:ring-2 focus:ring-[#d84a6a]/20'
                : 'w-full appearance-none rounded-2xl border border-[#ccd7d0] bg-[#f8faf8] px-3 py-3 pr-10 text-[#101820] outline-none transition focus:border-[#d84a6a] focus:bg-white focus:ring-2 focus:ring-[#d84a6a]/20 md:w-40'
            }
            value={sortField}
            onChange={(event) => onSortFieldChange(event.target.value as SortField)}
          >
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#65746d]" />
        </span>
      </label>
      <button
        aria-label={`Sort ${nextSortDirection === 'asc' ? 'ascending' : 'descending'}`}
        className={
          isDocked
            ? 'flex w-full items-center justify-center rounded-2xl border border-[#ccd7d0] bg-[#f8faf8] px-4 py-3 text-[#101820] transition hover:border-[#d84a6a] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#d84a6a]/20 active:scale-[0.98]'
            : 'self-end rounded-2xl border border-[#ccd7d0] bg-[#f8faf8] px-4 py-3 text-[#101820] transition hover:border-[#d84a6a] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#d84a6a]/20 active:scale-[0.98]'
        }
        title={`Sort ${nextSortDirection === 'asc' ? 'ascending' : 'descending'}`}
        type="button"
        onClick={() => onSortDirectionChange(nextSortDirection)}
      >
        {sortDirection === 'asc' ? <SortAscendingIcon className="h-6 w-6" /> : <SortDescendingIcon className="h-6 w-6" />}
      </button>
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SortAscendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 6h7" />
      <path d="M4 12h7" />
      <path d="M4 18h9" />
      <path d="m15 9 3-3 3 3" />
      <path d="M18 6v12" />
    </svg>
  );
}

function SortDescendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 6h9" />
      <path d="M4 12h7" />
      <path d="M4 18h7" />
      <path d="m15 15 3 3 3-3" />
      <path d="M18 6v12" />
    </svg>
  );
}
