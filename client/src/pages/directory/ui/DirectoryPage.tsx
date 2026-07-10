import gsap from 'gsap';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { SortDirection, SortField } from '../../../entities/user';
import { FilterChips } from '../../../features/applied-filters';
import { Controls } from '../../../features/directory-controls';
import { useDirectorySearchParams } from '../../../features/directory-query';
import { FilterSidebar } from '../../../widgets/directory-filters';
import { VirtualUserList } from '../../../widgets/directory-results';
import { useUsersDirectory } from '../model/useUsersDirectory';

export function DirectoryPage() {
  const [state, setState] = useDirectorySearchParams();
  const [draftText, setDraftText] = useState(state.text);
  const [draftHobbies, setDraftHobbies] = useState(state.hobbies);
  const [draftNationalities, setDraftNationalities] = useState(state.nationalities);
  const directory = useUsersDirectory(state);

  useEffect(() => {
    setDraftText(state.text);
  }, [state.text]);

  useEffect(() => {
    setDraftHobbies(state.hobbies);
  }, [state.hobbies]);

  useEffect(() => {
    setDraftNationalities(state.nationalities);
  }, [state.nationalities]);

  useEffect(() => {
    if (draftText === state.text) return;

    const timeoutId = window.setTimeout(() => {
      setState({ text: draftText });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [draftText, setState, state.text]);

  const toggleDraftHobby = (value: string) => {
    setDraftHobbies((current) => (current.includes(value) ? current.filter((hobby) => hobby !== value) : [...current, value]));
  };

  const toggleDraftNationality = (value: string) => {
    setDraftNationalities((current) =>
      current.includes(value) ? current.filter((nationality) => nationality !== value) : [...current, value],
    );
  };

  const clearText = () => {
    setDraftText('');
    setState({ text: '' });
  };

  const removeHobby = (value: string) => {
    setDraftHobbies((current) => current.filter((hobby) => hobby !== value));
    setState({ hobbies: state.hobbies.filter((hobby) => hobby !== value) });
  };

  const removeNationality = (value: string) => {
    setDraftNationalities((current) => current.filter((nationality) => nationality !== value));
    setState({ nationalities: state.nationalities.filter((nationality) => nationality !== value) });
  };

  const clearAllFilters = () => {
    setDraftText('');
    setDraftHobbies([]);
    setDraftNationalities([]);
    setState({ text: '', hobbies: [], nationalities: [] });
  };

  const applyFacetFilters = () => {
    setState({ hobbies: draftHobbies, nationalities: draftNationalities });
  };

  const isSearchPending = draftText !== state.text;
  const resultAnimationKey = JSON.stringify({
    text: state.text,
    hobbies: state.hobbies,
    nationalities: state.nationalities,
    sortField: state.sortField,
    sortDirection: state.sortDirection,
  });
  const hasPendingFacetFilters =
    draftHobbies.length !== state.hobbies.length ||
    draftNationalities.length !== state.nationalities.length ||
    draftHobbies.some((hobby) => !state.hobbies.includes(hobby)) ||
    draftNationalities.some((nationality) => !state.nationalities.includes(nationality));

  return (
    <main className="relative min-h-dvh bg-[#f3f6f3] text-[#101820]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(216,74,106,0.14),transparent_26rem),radial-gradient(circle_at_86%_8%,rgba(111,136,124,0.16),transparent_24rem)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-[#ccd7d0]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8">
          <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.055em] text-[#101820] sm:text-6xl lg:text-7xl">
            Precision people search
          </h1>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[21rem_minmax(0,1fr)]">
          <FilterSidebar
            hobbies={directory.facets.hobbies}
            nationalities={directory.facets.nationalities}
            selectedHobbies={draftHobbies}
            selectedNationalities={draftNationalities}
            hasPendingChanges={hasPendingFacetFilters}
            onApply={applyFacetFilters}
            onReset={() => {
              setDraftHobbies(state.hobbies);
              setDraftNationalities(state.nationalities);
            }}
            onToggleHobby={toggleDraftHobby}
            onToggleNationality={toggleDraftNationality}
          />

          <div className="space-y-4">
            <DockingControls
              text={draftText}
              sortField={state.sortField}
              sortDirection={state.sortDirection}
              onTextChange={setDraftText}
              onSortFieldChange={(sortField) => setState({ sortField })}
              onSortDirectionChange={(sortDirection) => setState({ sortDirection })}
            />
            <FilterChips
              text={draftText}
              hobbies={state.hobbies}
              nationalities={state.nationalities}
              onClearText={clearText}
              onRemoveHobby={removeHobby}
              onRemoveNationality={removeNationality}
              onClearAll={clearAllFilters}
            />
            <VirtualUserList
              {...directory}
              animationKey={resultAnimationKey}
              isLoading={directory.isLoading || isSearchPending}
              onLoadMore={directory.loadMore}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function DockingControls({
  text,
  sortField,
  sortDirection,
  onTextChange,
  onSortFieldChange,
  onSortDirectionChange,
}: {
  text: string;
  sortField: SortField;
  sortDirection: SortDirection;
  onTextChange: (text: string) => void;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isDocked, setIsDocked] = useState(false);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const panel = panelRef.current;
    if (!wrapper || !panel) return;

    let animationFrame = 0;
    let isEnabled = false;
    let isCurrentlyDocked = false;
    let startScroll = 0;
    let endScroll = 0;
    let startLeft = 0;
    let startWidth = 0;
    let startHeight = 0;
    let endLeft = 0;
    const dockWidth = 304;
    const dockGap = 24;
    const startTop = 24;
    const endTop = 24;

    const setDocked = (nextDocked: boolean) => {
      if (isCurrentlyDocked === nextDocked) return;
      isCurrentlyDocked = nextDocked;
      setIsDocked(nextDocked);
    };

    const resetPanel = () => {
      setDocked(false);
      gsap.set(panel, { clearProps: 'position,top,left,width,zIndex,transform' });
    };

    const measure = () => {
      resetPanel();
      gsap.set(wrapper, { clearProps: 'minHeight' });

      const wrapperRect = wrapper.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const hasRightRailSpace = wrapperRect.right + dockWidth + dockGap <= window.innerWidth;
      isEnabled = window.innerWidth >= 1024 && hasRightRailSpace;

      if (!isEnabled) return;

      startLeft = panelRect.left;
      startWidth = panelRect.width;
      startHeight = panelRect.height;
      endLeft = wrapperRect.right + dockGap;
      startScroll = window.scrollY + wrapperRect.top - startTop;
      endScroll = startScroll + 560;

      gsap.set(wrapper, { minHeight: startHeight });
      update();
    };

    const update = () => {
      animationFrame = 0;
      if (!isEnabled) {
        resetPanel();
        return;
      }

      const progress = gsap.utils.clamp(0, 1, (window.scrollY - startScroll) / (endScroll - startScroll));

      if (progress <= 0) {
        resetPanel();
        return;
      }

      setDocked(progress > 0.72);
      gsap.set(panel, {
        position: 'fixed',
        top: gsap.utils.interpolate(startTop, endTop, progress),
        left: gsap.utils.interpolate(startLeft, endLeft, progress),
        width: gsap.utils.interpolate(startWidth, dockWidth, progress),
        zIndex: 30,
      });
    };

    const requestUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(update);
    };

    measure();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', measure);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', measure);
      setIsDocked(false);
      gsap.set(wrapper, { clearProps: 'minHeight' });
      gsap.set(panel, { clearProps: 'position,top,left,width,zIndex,transform' });
    };
  }, []);

  return (
    <div ref={wrapperRef}>
      <div ref={panelRef} className={isDocked ? 'controls-dock is-docked relative z-30 w-full' : 'controls-dock relative z-10 w-full'}>
        <Controls
          isDocked={isDocked}
          text={text}
          sortField={sortField}
          sortDirection={sortDirection}
          onTextChange={onTextChange}
          onSortFieldChange={onSortFieldChange}
          onSortDirectionChange={onSortDirectionChange}
        />
      </div>
    </div>
  );
}
