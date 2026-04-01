import { useRef, useEffect } from 'react';
import styled from 'styled-components';

/* ─── styled ─── */

const Panel = styled.div`
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 78vh;
`;

const SearchRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 100px;
  padding: 10px 14px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  outline: none;
  font-size: 0.95rem;
  background: #fff;

  &:focus {
    border-color: ${p => p.theme.primary};
  }
`;

const SelectBtn = styled.button`
  padding: 8px 18px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  background: ${p => (p.$active ? p.theme.primary : '#fff')};
  color: ${p => (p.$active ? '#fff' : p.theme.text)};
  font-size: 0.88rem;
  font-weight: 600;

  &:hover {
    background: ${p => (p.$active ? p.theme.primaryStrong : p.theme.btnHover)};
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;

  &::-webkit-scrollbar {
    height: 0;
  }
`;

const FilterBtn = styled.button`
  padding: 6px 16px;
  border: 1.5px solid ${p => (p.$active ? p.theme.primary : p.theme.border)};
  border-radius: 999px;
  background: ${p => (p.$active ? p.theme.selectedItem : '#fff')};
  color: ${p => (p.$active ? p.theme.primaryStrong : p.theme.textSecondary)};
  font-size: 0.88rem;
  font-weight: 500;
  white-space: nowrap;

  &:hover {
    background: ${p => (p.$active ? p.theme.selectedItem : p.theme.btnHover)};
  }
`;

const SelectActions = styled.div`
  display: flex;
  gap: 10px;
`;

const DeleteSelBtn = styled.button`
  padding: 8px 16px;
  border: 1.5px solid ${p => p.theme.hardBorder};
  border-radius: ${p => p.theme.radiusSm};
  background: ${p => p.theme.hardBg};
  color: ${p => p.theme.hardText};
  font-size: 0.88rem;
  font-weight: 600;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const ListContainer = styled.ul`
  list-style: none;
  flex: 1;
  overflow-y: auto;
  padding: 0;
  margin: 0;

  &.quiz-masked li {
    filter: blur(6px);
    pointer-events: none;
    user-select: none;
  }

  &.quiz-masked li.active-item {
    filter: blur(2px);
  }
`;

const VocabItem = styled.li`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 0;
  cursor: pointer;

  &:first-child {
    border-radius: ${p => p.theme.radiusXs} ${p => p.theme.radiusXs} 0 0;
  }
  &:last-child {
    border-radius: 0 0 ${p => p.theme.radiusXs} ${p => p.theme.radiusXs};
  }
  &:first-child:last-child {
    border-radius: ${p => p.theme.radiusXs};
  }
  font-size: 0.95rem;
  transition: background 0.12s, transform 0.1s;
  background: ${p => {
    if (p.$selected) return p.theme.selectedItem;
    if (p.$active) return p.theme.activeItem;
    if (p.$level === 'low') return p.theme.level.low;
    if (p.$level === 'mid') return p.theme.level.mid;
    if (p.$level === 'high') return p.theme.level.high;
    return 'transparent';
  }};
  border: ${p => (p.$selected ? `1.5px solid ${p.theme.primary}` : '1.5px solid transparent')};

  ${p =>
    p.$active &&
    `
    box-shadow: 0 1px 4px rgba(148,168,255,0.10);
    transform: translateX(1px);
  `}

  &:hover {
    background: ${p => (p.$active ? p.theme.activeItem : p.theme.btnHover)};
  }

  span:first-child {
    font-weight: 600;
    color: ${p => p.theme.text};
  }

  span:last-child {
    color: ${p => p.theme.textSecondary};
  }
`;

/* ─── filters ─── */
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'difficult', label: 'Difficult' },
  { key: 'due', label: 'Due Today' },
  { key: 'mastered', label: 'Mastered' },
];

/* ─── component ─── */

export default function VocabList({
  visibleWords,
  activeIndex,
  selectionMode,
  selectedWordIds,
  searchText,
  activeFilter,
  isQuizActive,
  onSearchChange,
  onFilterChange,
  onWordClick,
  onWordContextMenu,
  onToggleSelect,
  onDeleteSelected,
  deleteCount,
}) {
  const listRef = useRef(null);

  /* auto-scroll active item into view */
  useEffect(() => {
    if (selectionMode || activeIndex == null) return;
    const el = listRef.current?.querySelector(`[data-idx="${activeIndex}"]`);
    if (!el) return;
    const list = listRef.current;
    const lr = list.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    if (er.top < lr.top || er.bottom > lr.bottom) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex, selectionMode, visibleWords]);

  return (
    <Panel>
      <SearchRow>
        <SearchInput
          type="text"
          placeholder="Search words…"
          value={searchText}
          onChange={e => onSearchChange(e.target.value)}
        />
        <SelectBtn $active={selectionMode} onClick={onToggleSelect}>
          {selectionMode ? 'Done' : 'Select'}
        </SelectBtn>
      </SearchRow>

      <FilterBar>
        {FILTERS.map(f => (
          <FilterBtn
            key={f.key}
            $active={activeFilter === f.key}
            onClick={() => onFilterChange(f.key)}
          >
            {f.label}
          </FilterBtn>
        ))}
      </FilterBar>

      {selectionMode && (
        <SelectActions>
          <DeleteSelBtn disabled={deleteCount === 0} onClick={onDeleteSelected}>
            Delete Selected ({deleteCount})
          </DeleteSelBtn>
        </SelectActions>
      )}

      <ListContainer
        ref={listRef}
        className={isQuizActive ? 'quiz-masked' : ''}
      >
        {visibleWords.map((item, visIdx) => {
          const isActive = !selectionMode && item.index === activeIndex;
          const isSelected = selectionMode && selectedWordIds.has(item.id);
          const level =
            !selectionMode
              ? (item.reviewLevel || 1) <= 2
                ? 'low'
                : (item.reviewLevel || 1) <= 4
                  ? 'mid'
                  : 'high'
              : null;

          return (
            <VocabItem
              key={item.id ?? item.index}
              data-idx={item.index}
              $active={isActive}
              $selected={isSelected}
              $level={level}
              className={isActive ? 'active-item' : ''}
              onClick={e => onWordClick(item, visIdx, e)}
              onContextMenu={e => onWordContextMenu(e, item)}
            >
              <span>{item.term}</span>
              <span>{item.translation}</span>
            </VocabItem>
          );
        })}
      </ListContainer>
    </Panel>
  );
}
