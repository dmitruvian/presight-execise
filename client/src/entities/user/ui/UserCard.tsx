import type { User } from '../api/users';

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  const shownHobbies = user.hobbies.slice(0, 2);
  const remainingHobbies = Math.max(user.hobbies.length - shownHobbies.length, 0);

  return (
    <article
      data-user-card
      data-user-id={user.id}
      className="relative flex h-32 gap-4 overflow-hidden rounded-[1.35rem] border border-[#ccd7d0] bg-white p-4 shadow-[0_14px_42px_rgba(16,24,32,0.06)] transition hover:-translate-y-0.5 hover:border-[#b5c6bc] hover:shadow-[0_24px_60px_rgba(16,24,32,0.1)]"
    >
      <span className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-[#d84a6a]" />
      <div className="relative flex-none">
        <img
          src={user.avatar}
          alt={`${user.first_name} ${user.last_name}`}
          className="h-20 w-20 rounded-2xl object-cover ring-1 ring-[#ccd7d0]"
          loading="lazy"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="truncate text-lg font-black tracking-[-0.025em] text-[#101820]">
            {user.first_name} {user.last_name}
          </h2>
          <span className="rounded-full border border-[#ccd7d0] bg-[#f8faf8] px-2.5 py-1 font-mono text-xs text-[#405148]">
            {user.age} years
          </span>
        </div>
        <p className="mt-1 text-sm font-bold text-[#8f2940]">{user.nationality}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {shownHobbies.map((hobby) => (
            <span key={hobby} className="rounded-full bg-[#e7eee9] px-2.5 py-1 text-xs font-medium text-[#405148]">
              {hobby}
            </span>
          ))}
          {remainingHobbies > 0 && (
            <span className="rounded-full bg-[#f1d8df] px-2.5 py-1 font-mono text-xs text-[#8f2940]">
              +{remainingHobbies}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
