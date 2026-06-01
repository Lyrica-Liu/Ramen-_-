import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import * as api from '../api';
import ContextMenu from '../components/ContextMenu';
import VocabList from '../components/VocabList';
import AddWordPanel from '../components/AddWordPanel';
import FlashCards from '../components/FlashCards';
import StudyMode from '../components/StudyMode';

/* ─── styled ─── */

const Page = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 28px 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 22px;
  padding-bottom: 18px;
  border-bottom: 1.5px solid ${p => p.theme.border};
  flex-shrink: 0;
`;

const BackLink = styled(Link)`
  font-size: 0.88rem;
  font-weight: 600;
  color: ${p => p.theme.textSecondary};
  white-space: nowrap;
  padding: 6px 12px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  transition: all 0.13s;

  &:hover {
    background: ${p => p.theme.btnHover};
    color: ${p => p.theme.text};
    border-color: ${p => p.theme.borderStrong};
  }
`;

const BookTitle = styled.h1`
  font-size: 1.35rem;
  font-weight: 800;
  color: ${p => p.theme.text};
  letter-spacing: -0.02em;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 22px;
  flex: 1;
  min-height: 0;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

const TabBar = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  flex-shrink: 0;
`;

const TabBtn = styled.button`
  flex: 1;
  padding: 11px 10px;
  background: ${p =>
    p.$active
      ? `linear-gradient(135deg, ${p.theme.primary} 0%, ${p.theme.primaryStrong} 100%)`
      : p.theme.panel};
  color: ${p => (p.$active ? '#fff' : p.theme.textSecondary)};
  border: 1.5px solid ${p => (p.$active ? 'transparent' : p.theme.border)};
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 700;
  font-size: 0.88rem;
  transition: all 0.14s ease;
  box-shadow: ${p => (p.$active ? p.theme.shadowPrimary : p.theme.shadow)};

  &:hover {
    background: ${p =>
      p.$active
        ? `linear-gradient(135deg, ${p.theme.primaryStrong} 0%, #3730a3 100%)`
        : p.theme.btnHover};
    color: ${p => (p.$active ? '#fff' : p.theme.text)};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TabContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb {
    background: ${p => p.theme.border};
    border-radius: 99px;
  }
`;

/* ─── component ─── */

export default function BookView() {
  const { bookId } = useParams();

  const [book, setBook] = useState(null);
  const [words, setWords] = useState([]);
  const [activeTab, setActiveTab] = useState('add');
  const [listSearch, setListSearch] = useState('');
  const [ctxMenu, setCtxMenu] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [lastSelIdx, setLastSelIdx] = useState(null);

  /* flashcard state */
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashShowBack, setFlashShowBack] = useState(false);

  /* ─── load data ─── */
  useEffect(() => {
    if (!bookId) return;
    Promise.all([api.getBook(bookId), api.fetchWords(bookId)])
      .then(([b, w]) => {
        setBook(b);
        setWords(w);
      })
      .catch(console.error);
  }, [bookId]);

  /* keep flashIndex in bounds */
  useEffect(() => {
    if (words.length > 0) {
      setFlashIndex(prev => (prev >= words.length ? 0 : prev));
    }
  }, [words.length]);

  const refreshWords = useCallback(async () => {
    try {
      setWords(await api.fetchWords(bookId));
    } catch (e) {
      console.error(e);
    }
  }, [bookId]);

  /* ─── filtered word list ─── */
  const visibleWords = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    return words
      .map((w, i) => ({ ...w, index: i }))
      .filter(item =>
        !q ||
        item.term.toLowerCase().includes(q) ||
        (item.translation || '').toLowerCase().includes(q),
      );
  }, [words, listSearch]);

  /* ─── tab switch ─── */
  function switchTab(tab) {
    setActiveTab(tab);
    if (tab !== 'flash') {
      setFlashShowBack(false);
    }
  }

  /* ─── flashcard navigation ─── */
  function flashNext() {
    if (!words.length) return;
    setFlashIndex(prev => (prev + 1) % words.length);
    setFlashShowBack(false);
  }

  function flashPrev() {
    if (!words.length) return;
    setFlashIndex(prev => (prev - 1 + words.length) % words.length);
    setFlashShowBack(false);
  }

  /* ─── keyboard shortcuts ─── */
  const flashHandlers = useRef({});
  flashHandlers.current = { flip: () => setFlashShowBack(p => !p), next: flashNext, prev: flashPrev };

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') { setCtxMenu(null); return; }
      const tag = e.target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      if (activeTab !== 'flash') return;
      if (e.code === 'Space') { e.preventDefault(); flashHandlers.current.flip(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); flashHandlers.current.next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); flashHandlers.current.prev(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activeTab]);

  useEffect(() => {
    const close = () => setCtxMenu(null);
    document.addEventListener('click', close);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('scroll', close, true);
    };
  }, []);

  /* ─── word list interactions ─── */
  function handleWordClick(item, visIdx, event) {
    if (selectionMode) {
      if (!item.id) return;
      if (event.shiftKey) {
        setSelectedIds(prev => {
          const anchor = lastSelIdx ?? 0;
          const lo = Math.min(anchor, visIdx);
          const hi = Math.max(anchor, visIdx);
          const s = new Set(prev);
          for (let i = lo; i <= hi; i++) {
            const w = visibleWords[i];
            if (w?.id) s.add(w.id);
          }
          return s;
        });
      } else {
        setSelectedIds(prev => {
          const s = new Set(prev);
          if (s.has(item.id)) s.delete(item.id);
          else s.add(item.id);
          return s;
        });
        setLastSelIdx(visIdx);
      }
      return;
    }

    /* jump flashcard to clicked word */
    if (activeTab === 'flash' && item.index != null) {
      setFlashIndex(item.index);
      setFlashShowBack(false);
    }
  }

  function handleWordCtx(event, word) {
    event.preventDefault();
    event.stopPropagation();
    if (selectionMode || !word?.id) return;
    setCtxMenu({ x: event.clientX, y: event.clientY, word });
  }

  async function handleEditWord() {
    if (!ctxMenu) return;
    const { word } = ctxMenu;
    setCtxMenu(null);
    const newTerm = prompt('Edit word:', word.term);
    if (!newTerm?.trim()) return;
    const newDef = prompt('Edit definition:', word.translation);
    if (newDef === null) return;
    try {
      await api.updateWord(bookId, word.id, { term: newTerm.trim(), translation: newDef.trim() });
      await refreshWords();
    } catch {
      alert('Failed to update word.');
    }
  }

  async function handleDeleteWord() {
    if (!ctxMenu) return;
    const { word } = ctxMenu;
    setCtxMenu(null);
    if (!confirm(`Delete "${word.term}"?`)) return;
    try {
      await api.deleteWord(bookId, word.id);
      await refreshWords();
    } catch {
      alert('Failed to delete word.');
    }
  }

  function toggleSelect() {
    setSelectionMode(prev => !prev);
    if (selectionMode) {
      setSelectedIds(new Set());
      setLastSelIdx(null);
    }
    setCtxMenu(null);
  }

  async function handleDeleteSelected() {
    if (!selectedIds.size) return;
    if (!confirm(`Delete ${selectedIds.size} word(s)?`)) return;
    try {
      await Promise.all([...selectedIds].map(id => api.deleteWord(bookId, id)));
    } catch {
      alert('Some words could not be deleted.');
    }
    setSelectedIds(new Set());
    setLastSelIdx(null);
    await refreshWords();
  }

  /* ─── active word id for list highlight ─── */
  const activeWordId = activeTab === 'flash' ? words[flashIndex]?.id ?? null : null;

  return (
    <Page>
      <TopBar>
        <BackLink to="/bookshelf">← Bookshelf</BackLink>
        <BookTitle>{book?.title ?? '…'}</BookTitle>
      </TopBar>

      <Layout>
        <VocabList
          visibleWords={visibleWords}
          activeWordId={activeWordId}
          selectionMode={selectionMode}
          selectedWordIds={selectedIds}
          searchText={listSearch}
          onSearchChange={setListSearch}
          onWordClick={handleWordClick}
          onWordContextMenu={handleWordCtx}
          onToggleSelect={toggleSelect}
          onDeleteSelected={handleDeleteSelected}
          deleteCount={selectedIds.size}
        />

        <RightPanel>
          <TabBar>
            <TabBtn $active={activeTab === 'add'} onClick={() => switchTab('add')}>
              Add Word
            </TabBtn>
            <TabBtn $active={activeTab === 'flash'} onClick={() => switchTab('flash')}>
              Flashcards
            </TabBtn>
            <TabBtn $active={activeTab === 'study'} onClick={() => switchTab('study')}>
              Study Mode
            </TabBtn>
          </TabBar>

          <TabContent>
            {activeTab === 'add' && (
              <AddWordPanel
                bookId={bookId}
                onWordAdded={word => setWords(prev => [...prev, word])}
              />
            )}

            {activeTab === 'flash' && (
              <FlashCards
                word={words.length > 0 ? words[flashIndex] : null}
                showBack={flashShowBack}
                position={words.length > 0 ? flashIndex + 1 : 0}
                total={words.length}
                onFlip={() => setFlashShowBack(p => !p)}
                onNext={flashNext}
                onPrev={flashPrev}
              />
            )}

            {activeTab === 'study' && <StudyMode words={words} />}
          </TabContent>
        </RightPanel>
      </Layout>

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={[
            { label: 'Edit Word', onClick: handleEditWord },
            { label: 'Delete Word', onClick: handleDeleteWord, danger: true },
          ]}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </Page>
  );
}
