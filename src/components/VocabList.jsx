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
  gap: 12px;
  height: 100%;
  overflow: hidden;
  box-shadow: ${p => p.theme.shadow};
`;

const TopRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 9px 13px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  outline: none;
  font-size: 0.92rem;
  background: ${p => p.theme.bg};
  color: ${p => p.theme.text};
  transition: border-color 0.13s;

  &::placeholder { color: ${p => p.theme.muted}; }

  &:focus {
    border-color: ${p => p.theme.primary};
    box-shadow: 0 0 0 3px ${p => p.theme.primaryMuted};
  }
`;

const SelectBtn = styled.button`
  padding: 7px 14px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  background: ${p => (p.$active ? p.theme.primary : p.theme.bg)};
  color: ${p => (p.$active ? '#fff' : p.theme.textSecondary)};
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.13s;

  &:hover {
    background: ${p => (p.$active ? p.theme.primaryStrong : p.theme.btnHover)};
    color: ${p => (p.$active ? '#fff' : p.theme.text)};
  }
`;

const CountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const WordCount = styled.div`
  font-size: 0.78rem;
  font-weight: 600;
  color: ${p => p.theme.muted};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const DeleteSelBtn = styled.button`
  padding: 5px 12px;
  border: 1.5px solid ${p => p.theme.hardBorder};
  border-radius: ${p => p.theme.radiusSm};
  background: ${p => p.theme.hardBg};
  color: ${p => p.theme.hardText};
  font-size: 0.82rem;
  font-weight: 600;

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;

const ListContainer = styled.ul`
  list-style: none;
  flex: 1;
  overflow-y: auto;
  padding: 0;
  margin: 0;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb {
    background: ${p => p.theme.border};
    border-radius: 99px;
  }
`;

const VocabItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  padding: 9px 12px;
  border-radius: ${p => p.theme.radiusXs};
  cursor: pointer;
  font-size: 0.92rem;
  transition: background 0.1s;
  background: ${p => {
    if (p.$selected) return p.theme.selectedItem;
    if (p.$active) return p.theme.activeItem;
    return 'transparent';
  }};
  border: 1.5px solid ${p => (p.$selected ? p.theme.primary : 'transparent')};

  &:hover {
    background: ${p => (p.$active ? p.theme.activeItem : p.theme.btnHover)};
  }
`;

const Term = styled.span`
  font-weight: 700;
  color: ${p => p.theme.text};
  flex-shrink: 0;
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Def = styled.span`
  color: ${p => p.theme.muted};
  font-size: 0.84rem;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
`;

/* ─── component ─── */

export default function VocabList({
  visibleWords,
  activeWordId,
  selectionMode,
  selectedWordIds,
  searchText,
  onSearchChange,
  onWordClick,
  onWordContextMenu,
  onToggleSelect,
  onDeleteSelected,
  deleteCount,
}) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!activeWordId || selectionMode) return;
    const el = listRef.current?.querySelector(`[data-wordid="${activeWordId}"]`);
    if (!el) return;
    const list = listRef.current;
    const lr = list.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    if (er.top < lr.top || er.bottom > lr.bottom) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeWordId, selectionMode, visibleWords]);

  return (
    <Panel>
      <TopRow>
        <SearchInput
          type="text"
          placeholder="Filter deck…"
          value={searchText}
          onChange={e => onSearchChange(e.target.value)}
        />
        <SelectBtn $active={selectionMode} onClick={onToggleSelect}>
          {selectionMode ? 'Done' : 'Select'}
        </SelectBtn>
      </TopRow>

      <CountRow>
        <WordCount>{visibleWords.length} word{visibleWords.length !== 1 ? 's' : ''}</WordCount>
        {selectionMode && (
          <DeleteSelBtn disabled={deleteCount === 0} onClick={onDeleteSelected}>
            Delete ({deleteCount})
          </DeleteSelBtn>
        )}
      </CountRow>

      <ListContainer ref={listRef}>
        {visibleWords.map((item, visIdx) => {
          const isActive = !selectionMode && item.id === activeWordId;
          const isSelected = selectionMode && selectedWordIds.has(item.id);
          return (
            <VocabItem
              key={item.id ?? item.index}
              data-wordid={item.id}
              $active={isActive}
              $selected={isSelected}
              onClick={e => onWordClick(item, visIdx, e)}
              onContextMenu={e => onWordContextMenu(e, item)}
            >
              <Term>{item.term}</Term>
              <Def>{item.translation}</Def>
            </VocabItem>
          );
        })}
      </ListContainer>
    </Panel>
  );
}
