import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import * as api from '../api';
import ContextMenu from '../components/ContextMenu';
import VocabList from '../components/VocabList';
import AddWordPanel from '../components/AddWordPanel';
import FlashCards from '../components/FlashCards';
import StudyMode from '../components/StudyMode';

/* ─── layout ─── */

const Page = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TitleBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0 14px;
  flex-shrink: 0;
`;

const BackLink = styled(Link)`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${p => p.theme.textSecondary};
  white-space: nowrap;
  padding: 7px 14px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 999px;
  transition: all 0.13s;
  flex-shrink: 0;

  &:hover {
    background: ${p => p.theme.btnHover};
    color: ${p => p.theme.text};
    border-color: ${p => p.theme.borderStrong};
  }
`;

const BookTitle = styled.h1`
  font-size: 1.15rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  letter-spacing: -0.02em;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/* ─── centered nav bar ─── */

const NavBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 0 0 18px;
  flex-shrink: 0;
`;

const AddWordBtn = styled.button`
  padding: 12px 30px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.95rem;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.18s ease;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  background: ${p => p.$active ? 'rgba(139, 92, 246, 0.18)' : 'rgba(139, 92, 246, 0.07)'};
  border: 1.5px solid ${p => p.$active ? 'rgba(139, 92, 246, 0.45)' : 'rgba(139, 92, 246, 0.22)'};
  color: ${p => p.theme.primary};
  box-shadow: ${p => p.$active
    ? '0 4px 20px rgba(139, 92, 246, 0.20), inset 0 1px 0 rgba(255,255,255,0.7)'
    : 'inset 0 1px 0 rgba(255,255,255,0.5)'};

  &:hover {
    background: rgba(139, 92, 246, 0.14);
    border-color: rgba(139, 92, 246, 0.38);
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.18), inset 0 1px 0 rgba(255,255,255,0.7);
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
`;

const ToggleTrack = styled.div`
  display: flex;
  align-items: center;
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 999px;
  padding: 4px;
  gap: 2px;
  box-shadow: ${p => p.theme.shadow};
`;

const ToggleOption = styled.button`
  padding: 10px 24px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

  background: ${p => p.$active
    ? `linear-gradient(135deg, ${p.theme.primary} 0%, ${p.theme.primaryStrong} 100%)`
    : 'transparent'};
  color: ${p => (p.$active ? '#fff' : p.theme.textSecondary)};
  box-shadow: ${p => (p.$active ? p.theme.shadowPrimary : 'none')};

  &:hover {
    color: ${p => (p.$active ? '#fff' : p.theme.text)};
    background: ${p => p.$active
      ? `linear-gradient(135deg, ${p.theme.primaryStrong} 0%, #6D28D9 100%)`
      : p.theme.btnHover};
  }
`;

/* ─── content ─── */

const Content = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 28px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: ${p => p.theme.border}; border-radius: 99px; }
`;

/* ─── drawer ─── */

const DrawerBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(30, 27, 75, 0.15);
  z-index: 40;
  opacity: ${p => (p.$open ? 1 : 0)};
  pointer-events: ${p => (p.$open ? 'all' : 'none')};
  transition: opacity 0.22s ease;
`;

const DrawerPanel = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 230px;
  background: ${p => p.theme.panel};
  border-right: 1.5px solid ${p => p.theme.border};
  border-radius: 0 24px 24px 0;
  box-shadow: 6px 0 32px rgba(139, 92, 246, 0.12);
  z-index: 41;
  transform: translateX(${p => (p.$open ? '0' : '-100%')});
  transition: transform 0.24s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  padding-top: 20px;
`;

const DrawerHeader = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: ${p => p.theme.muted};
  padding: 0 16px 14px;
`;

const DrawerTab = styled.button`
  position: fixed;
  left: ${p => (p.$open ? '230px' : '0')};
  top: 50%;
  transform: translateY(-50%);
  z-index: 42;
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-left: none;
  border-radius: 0 12px 12px 0;
  width: 22px;
  padding: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${p => p.theme.muted};
  cursor: pointer;
  transition: left 0.24s cubic-bezier(0.4, 0, 0.2, 1), color 0.13s, background 0.13s;
  box-shadow: 2px 0 10px rgba(139, 92, 246, 0.08);

  &:hover { background: ${p => p.theme.btnHover}; color: ${p => p.theme.primary}; }
`;

/* ─── component ─── */

export default function BookView() {
  const { bookId } = useParams();
  const location = useLocation();

  /* use nav state for title — avoids a separate getBook API call */
  const [book, setBook] = useState({ title: location.state?.title ?? null });
  const [words, setWords] = useState([]);
  const [activeTab, setActiveTab] = useState('add');
  const [studyTab, setStudyTab] = useState('flash');
  const [listSearch, setListSearch] = useState('');
  const [ctxMenu, setCtxMenu] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [flashIndex, setFlashIndex] = useState(0);
  const [flashShowBack, setFlashShowBack] = useState(false);

  /* ─── load data ─── */
  useEffect(() => {
    if (!bookId) return;
    if (!location.state?.title) {
      /* only fetch book meta if we didn't get the title from nav state */
      api.getBook(bookId).then(b => setBook(b)).catch(console.error);
    }
    api.fetchWords(bookId).then(setWords).catch(console.error);
  }, [bookId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (words.length > 0) setFlashIndex(prev => (prev >= words.length ? 0 : prev));
  }, [words.length]);

  const refreshWords = useCallback(async () => {
    try { setWords(await api.fetchWords(bookId)); } catch (e) { console.error(e); }
  }, [bookId]);

  /* ─── filtered list ─── */
  const visibleWords = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    return words
      .map((w, i) => ({ ...w, index: i }))
      .filter(item => !q || item.term.toLowerCase().includes(q));
  }, [words, listSearch]);

  /* ─── navigation ─── */
  function switchToStudy(tab) {
    setStudyTab(tab);
    setActiveTab('study');
    setFlashShowBack(false);
  }

  /* ─── flashcard ─── */
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

  /* ─── keyboard ─── */
  const flashHandlers = useRef({});
  flashHandlers.current = { flip: () => setFlashShowBack(p => !p), next: flashNext, prev: flashPrev };

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') { setCtxMenu(null); setDrawerOpen(false); return; }
      const tag = e.target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      if (activeTab !== 'study' || studyTab !== 'flash') return;
      if (e.code === 'Space') { e.preventDefault(); flashHandlers.current.flip(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); flashHandlers.current.next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); flashHandlers.current.prev(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activeTab, studyTab]);

  useEffect(() => {
    const close = () => setCtxMenu(null);
    document.addEventListener('click', close);
    document.addEventListener('scroll', close, true);
    return () => { document.removeEventListener('click', close); document.removeEventListener('scroll', close, true); };
  }, []);

  /* ─── word interactions ─── */
  function handleWordClick(item) {
    if (activeTab === 'study' && studyTab === 'flash' && item.index != null) {
      setFlashIndex(item.index);
      setFlashShowBack(false);
    }
    setDrawerOpen(false);
  }

  function handleWordCtx(event, word) {
    event.preventDefault();
    event.stopPropagation();
    if (!word?.id) return;
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
    } catch { alert('Failed to update word.'); }
  }

  async function handleDeleteWord() {
    if (!ctxMenu) return;
    const { word } = ctxMenu;
    setCtxMenu(null);
    if (!confirm(`Delete "${word.term}"?`)) return;
    try { await api.deleteWord(bookId, word.id); await refreshWords(); }
    catch { alert('Failed to delete word.'); }
  }

  const activeWordId = activeTab === 'study' && studyTab === 'flash'
    ? words[flashIndex]?.id ?? null
    : null;

  return (
    <Page>
      <TitleBar>
        <BackLink to="/bookshelf">← Bookshelf</BackLink>
        <BookTitle>{book?.title ?? '…'}</BookTitle>
      </TitleBar>

      <NavBar>
        <AddWordBtn $active={activeTab === 'add'} onClick={() => setActiveTab('add')}>
          + Add Word
        </AddWordBtn>
        <ToggleTrack>
          <ToggleOption $active={activeTab === 'study' && studyTab === 'flash'} onClick={() => switchToStudy('flash')}>
            Flashcards
          </ToggleOption>
          <ToggleOption $active={activeTab === 'study' && studyTab === 'study'} onClick={() => switchToStudy('study')}>
            Study Mode
          </ToggleOption>
        </ToggleTrack>
      </NavBar>

      <Content>
        {activeTab === 'add' && (
          <AddWordPanel bookId={bookId} onWordAdded={word => setWords(prev => [...prev, word])} />
        )}
        {activeTab === 'study' && studyTab === 'flash' && (
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
        {activeTab === 'study' && studyTab === 'study' && <StudyMode words={words} />}
      </Content>

      {createPortal(
        <>
          <DrawerTab $open={drawerOpen} onClick={() => setDrawerOpen(o => !o)} title={drawerOpen ? 'Close list' : 'Open word list'}>
            {drawerOpen ? '‹' : '›'}
          </DrawerTab>
          <DrawerBackdrop $open={drawerOpen} onClick={() => setDrawerOpen(false)} />
          <DrawerPanel $open={drawerOpen}>
            <DrawerHeader>Words ({words.length})</DrawerHeader>
            <VocabList
              visibleWords={visibleWords}
              activeWordId={activeWordId}
              searchText={listSearch}
              onSearchChange={setListSearch}
              onWordClick={handleWordClick}
              onWordContextMenu={handleWordCtx}
            />
          </DrawerPanel>
        </>,
        document.body
      )}

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
