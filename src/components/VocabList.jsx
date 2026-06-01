import { useRef, useEffect } from 'react';
import styled from 'styled-components';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const SearchInput = styled.input`
  margin: 0 12px 8px;
  padding: 8px 11px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  outline: none;
  font-size: 0.87rem;
  background: ${p => p.theme.bg};
  color: ${p => p.theme.text};

  &::placeholder { color: ${p => p.theme.muted}; }
  &:focus { border-color: ${p => p.theme.primary}; }
`;

const WordCount = styled.div`
  font-size: 0.71rem;
  font-weight: 600;
  color: ${p => p.theme.muted};
  padding: 0 14px 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const List = styled.ul`
  list-style: none;
  flex: 1;
  overflow-y: auto;
  padding: 0 6px;
  margin: 0;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb {
    background: ${p => p.theme.border};
    border-radius: 99px;
  }
`;

const Item = styled.li`
  padding: 9px 10px;
  border-radius: ${p => p.theme.radiusXs};
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: ${p => p.$active ? 700 : 500};
  color: ${p => p.$active ? p.theme.primary : p.theme.text};
  background: ${p => p.$active ? p.theme.primaryMuted : 'transparent'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background 0.1s, color 0.1s;

  &:hover {
    background: ${p => p.$active ? p.theme.primaryMuted : p.theme.btnHover};
    color: ${p => p.$active ? p.theme.primary : p.theme.text};
  }
`;

export default function VocabList({
  visibleWords,
  activeWordId,
  searchText,
  onSearchChange,
  onWordClick,
  onWordContextMenu,
}) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!activeWordId) return;
    const el = listRef.current?.querySelector(`[data-wordid="${activeWordId}"]`);
    if (!el) return;
    const list = listRef.current;
    const lr = list.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    if (er.top < lr.top || er.bottom > lr.bottom) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeWordId, visibleWords]);

  return (
    <Panel>
      <SearchInput
        type="text"
        placeholder="Filter…"
        value={searchText}
        onChange={e => onSearchChange(e.target.value)}
      />
      <WordCount>{visibleWords.length} word{visibleWords.length !== 1 ? 's' : ''}</WordCount>
      <List ref={listRef}>
        {visibleWords.map((item, visIdx) => (
          <Item
            key={item.id ?? item.index}
            data-wordid={item.id}
            $active={item.id === activeWordId}
            onClick={e => onWordClick(item, visIdx, e)}
            onContextMenu={e => onWordContextMenu(e, item)}
          >
            {item.term}
          </Item>
        ))}
      </List>
    </Panel>
  );
}
