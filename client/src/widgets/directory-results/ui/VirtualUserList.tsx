import gsap from 'gsap';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { UserCard, type User } from '../../../entities/user';

const ROW_HEIGHT = 152;
const OVERSCAN = 6;

interface VirtualUserListProps {
  users: User[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  animationKey: string;
  onLoadMore: () => void;
}

export function VirtualUserList({
  users,
  total,
  hasMore,
  isLoading,
  isLoadingMore,
  error,
  animationKey,
  onLoadMore,
}: VirtualUserListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const animatedCardIds = useRef(new Set<string>());
  const animatedResultKey = useRef('');
  const [scrollMetrics, setScrollMetrics] = useState({ scrollTop: 0, viewportHeight: 640 });
  const listHeight = users.length * ROW_HEIGHT;

  const updateScrollMetrics = useCallback(() => {
    const node = listRef.current;
    if (!node) return;

    const listTop = node.getBoundingClientRect().top + window.scrollY;
    setScrollMetrics({
      scrollTop: Math.max(window.scrollY - listTop, 0),
      viewportHeight: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    if (isLoading) return;

    updateScrollMetrics();
    window.addEventListener('scroll', updateScrollMetrics, { passive: true });
    window.addEventListener('resize', updateScrollMetrics);

    const node = listRef.current;
    const resizeObserver = node ? new ResizeObserver(updateScrollMetrics) : null;
    if (node) resizeObserver?.observe(node);

    return () => {
      window.removeEventListener('scroll', updateScrollMetrics);
      window.removeEventListener('resize', updateScrollMetrics);
      resizeObserver?.disconnect();
    };
  }, [isLoading, updateScrollMetrics]);

  const visibleRange = useMemo(() => {
    const start = Math.max(Math.floor(scrollMetrics.scrollTop / ROW_HEIGHT) - OVERSCAN, 0);
    const end = Math.min(
      Math.ceil((scrollMetrics.scrollTop + scrollMetrics.viewportHeight) / ROW_HEIGHT) + OVERSCAN,
      users.length,
    );
    return { start, end };
  }, [scrollMetrics.scrollTop, scrollMetrics.viewportHeight, users.length]);

  useEffect(() => {
    if (hasMore && !isLoadingMore && !error && visibleRange.end >= users.length - 8) {
      onLoadMore();
    }
  }, [error, hasMore, isLoadingMore, onLoadMore, users.length, visibleRange.end]);

  const visibleUsers = users.slice(visibleRange.start, visibleRange.end);
  const visibleUserIds = visibleUsers.map((user) => String(user.id)).join('|');

  useLayoutEffect(() => {
    const node = listRef.current;
    if (!node || isLoading || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (animatedResultKey.current !== animationKey) {
      animatedCardIds.current.clear();
      animatedResultKey.current = animationKey;
    }

    const cards = Array.from(node.querySelectorAll<HTMLElement>('[data-user-card]')).filter((card) => {
      const userId = card.dataset.userId;
      if (!userId || animatedCardIds.current.has(userId)) return false;
      animatedCardIds.current.add(userId);
      return true;
    });

    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      {
        autoAlpha: 0,
        y: -34,
        scale: 0.94,
        rotateX: -7,
        filter: 'blur(6px)',
        transformOrigin: '50% 0%',
      },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        filter: 'blur(0px)',
        duration: 0.5,
        ease: 'power3.out',
        stagger: { each: 0.045, from: 'start' },
        clearProps: 'opacity,visibility,transform,transformOrigin,filter',
      },
    );
  }, [animationKey, isLoading, visibleUserIds]);

  if (isLoading && users.length === 0) {
    return <StateCard title="Loading users" message="Fetching profiles and facets." />;
  }

  if (error && users.length === 0) {
    return <StateCard tone="error" title="Something went wrong" message={error} />;
  }

  if (users.length === 0) {
    return <StateCard title="No users found" message="Try removing filters or changing your search." />;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1 text-sm font-medium text-[#65746d]">
        <span>
          Showing {users.length.toLocaleString()} of {total.toLocaleString()} users
        </span>
        {isLoading && (
          <span className="inline-flex items-center gap-2 text-[#8f2940]">
            <span className="h-2 w-2 rounded-full bg-[#d84a6a]" />
            Refreshing...
          </span>
        )}
        {!isLoading && error && <span className="text-[#b4233f]">{error}</span>}
      </div>
      <div ref={listRef} className="relative" style={{ height: listHeight }}>
        <div style={{ transform: `translateY(${visibleRange.start * ROW_HEIGHT}px)` }} className="space-y-5">
          {visibleUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      </div>
      {isLoadingMore && <StateCard compact title="Loading more users" message="Fetching the next page." />}
      {error && users.length > 0 && (
        <StateCard compact tone="error" title="Unable to load more users" message={error} onRetry={onLoadMore} />
      )}
      {!hasMore && users.length > 0 && <p className="py-4 text-center text-sm text-[#7c8c84]">End of results</p>}
    </section>
  );
}

function StateCard({
  title,
  message,
  tone = 'default',
  compact = false,
  onRetry,
}: {
  title: string;
  message: string;
  tone?: 'default' | 'error';
  compact?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div
      className={
        compact
          ? 'rounded-[1.6rem] border border-dashed border-[#b5c6bc] bg-white p-6 text-center shadow-[0_18px_60px_rgba(16,24,32,0.07)]'
          : 'rounded-[1.6rem] border border-dashed border-[#b5c6bc] bg-white p-10 text-center shadow-[0_18px_60px_rgba(16,24,32,0.07)]'
      }
    >
      <h2 className={tone === 'error' ? 'text-lg font-black text-[#b4233f]' : 'text-lg font-black text-[#101820]'}>
        {title}
      </h2>
      <p className="mt-2 text-[#65746d]">{message}</p>
      {onRetry && (
        <button
          className="mt-4 rounded-full border border-[#d84a6a] px-4 py-2 text-sm font-bold text-[#8f2940] transition hover:bg-[#d84a6a]/10"
          type="button"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
}
