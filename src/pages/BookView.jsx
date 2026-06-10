import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import studyBg from '../assets/studypage.png';
import styled from 'styled-components';
import * as api from '../api';
import ContextMenu from '../components/ContextMenu';
import VocabList from '../components/VocabList';
import AddWordPanel from '../components/AddWordPanel';
import FlashCards from '../components/FlashCards';
import StudyMode from '../components/StudyMode';
import BookStatsPanel from '../components/BookStatsPanel';

/* ─── shell layout ─── */

const Shell = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: url(${studyBg}) center/cover no-repeat;
`;

const SidePanel = styled.div`
  width: ${p => p.$open ? '240px' : '0px'};
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.26s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.26s ease,
              box-shadow 0.26s ease;
  border-right: 1.5px solid ${p => p.$open ? p.theme.border : 'transparent'};
  background: ${p => p.theme.panel};
  box-shadow: ${p => p.$open ? '4px 0 20px rgba(160,80,80,0.05)' : 'none'};
`;

const SidePanelInner = styled.div`
  width: 240px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
`;

const SidePanelHeader = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: ${p => p.theme.muted};
  padding: 0 16px 14px;
`;

const MainArea = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 32px;
`;

/* ─── title bar ─── */

const TitleBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 0 14px;
  flex-shrink: 0;
`;

const WordListTab = styled.button`
  position: fixed;
  left: ${p => p.$open ? '240px' : '0px'};
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  transition: left 0.26s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.14s,
              background 0.14s,
              box-shadow 0.14s;

  background: rgba(253, 248, 244, 0.90);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.5px solid rgba(196, 132, 138, 0.20);
  border-left: none;
  border-radius: 0 16px 16px 0;
  padding: 22px 9px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: 4px 0 20px rgba(160, 80, 80, 0.09);

  &:hover {
    background: rgba(253, 248, 244, 0.98);
    border-color: rgba(196, 132, 138, 0.38);
    box-shadow: 4px 0 26px rgba(160, 80, 80, 0.14);
  }
`;

const TabLabel = styled.span`
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  font-size: 0.60rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: ${p => p.theme.textSecondary};
  user-select: none;
`;

const TabPip = styled.div`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(196, 132, 138, 0.45);
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

/* ─── nav bar ─── */

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

  background: ${p => p.$active ? 'rgba(196, 132, 138, 0.16)' : 'rgba(196, 132, 138, 0.05)'};
  border: 1.5px solid ${p => p.$active ? 'rgba(196, 132, 138, 0.40)' : 'rgba(196, 132, 138, 0.18)'};
  color: ${p => p.theme.primary};
  box-shadow: ${p => p.$active
    ? '0 4px 20px rgba(160, 80, 80, 0.18), inset 0 1px 0 rgba(255,255,255,0.7)'
    : 'inset 0 1px 0 rgba(255,255,255,0.5)'};

  &:hover {
    background: rgba(196, 132, 138, 0.11);
    border-color: rgba(196, 132, 138, 0.34);
    box-shadow: 0 4px 20px rgba(160, 80, 80, 0.14), inset 0 1px 0 rgba(255,255,255,0.7);
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
      ? `linear-gradient(135deg, ${p.theme.primaryStrong} 0%, #8C5060 100%)`
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

/* ─── component ─── */

export default function BookView() {
  const { bookId } = useParams();
  const location = useLocation();

  const [book, setBook] = useState({ title: location.state?.title ?? null });
  const [words, setWords] = useState([]);
  const [activeTab, setActiveTab] = useState('study');
  const [studyTab, setStudyTab] = useState('flash');
  const [listSearch, setListSearch] = useState('');
  const [ctxMenu, setCtxMenu] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashShowBack, setFlashShowBack] = useState(false);

  useEffect(() => {
    if (!bookId) return;
    if (!location.state?.title) {
      api.getBook(bookId).then(b => setBook(b)).catch(console.error);
    }
    try {
      const cached = localStorage.getItem(`rv_words_${bookId}`);
      if (cached) setWords(JSON.parse(cached));
    } catch {}
    api.fetchWords(bookId).then(w => {
      setWords(w);
      try { localStorage.setItem(`rv_words_${bookId}`, JSON.stringify(w)); } catch {}
    }).catch(console.error);
  }, [bookId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (words.length > 0) setFlashIndex(prev => (prev >= words.length ? 0 : prev));
  }, [words.length]);

  const refreshWords = useCallback(async () => {
    try {
      const w = await api.fetchWords(bookId);
      setWords(w);
      try { localStorage.setItem(`rv_words_${bookId}`, JSON.stringify(w)); } catch {}
    } catch (e) { console.error(e); }
  }, [bookId]);

  const visibleWords = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    return words
      .map((w, i) => ({ ...w, index: i }))
      .filter(item => !q || item.term.toLowerCase().includes(q));
  }, [words, listSearch]);

  function switchToStudy(tab) {
    setStudyTab(tab);
    setActiveTab('study');
    setFlashShowBack(false);
    if (tab === 'study') setDrawerOpen(false);
  }

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

  const flashHandlers = useRef({});
  flashHandlers.current = { flip: () => setFlashShowBack(p => !p), next: flashNext, prev: flashPrev };

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') { setCtxMenu(null); return; }
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
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('scroll', close, true);
    };
  }, []);

  function handleWordClick(item) {
    if (activeTab === 'study' && studyTab === 'flash' && item.index != null) {
      setFlashIndex(item.index);
      setFlashShowBack(false);
    }
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
    if (!confirm(`Delete "${word.title}"?`)) return;
    try { await api.deleteWord(bookId, word.id); await refreshWords(); }
    catch { alert('Failed to delete word.'); }
  }

  const activeWordId = activeTab === 'study' && studyTab === 'flash'
    ? words[flashIndex]?.id ?? null
    : null;

  return (
    <Shell>
      <WordListTab
        $open={drawerOpen}
        onClick={() => setDrawerOpen(o => !o)}
        title={drawerOpen ? 'Close word list' : 'Show word list'}
      >
        <TabLabel>{drawerOpen ? 'Close' : 'Word List'}</TabLabel>
        <TabPip />
      </WordListTab>

      <SidePanel $open={drawerOpen}>
        <SidePanelInner>
          <SidePanelHeader>Words ({words.length})</SidePanelHeader>
          <VocabList
            visibleWords={visibleWords}
            activeWordId={activeWordId}
            searchText={listSearch}
            onSearchChange={setListSearch}
            onWordClick={handleWordClick}
            onWordContextMenu={handleWordCtx}
          />
        </SidePanelInner>
      </SidePanel>

      <MainArea>
        <TitleBar>
          <BackLink to="/bookshelf">← Bookshelf</BackLink>
          <BookTitle>{book?.title ?? '…'}</BookTitle>
        </TitleBar>

        <NavBar>
          <AddWordBtn $active={activeTab === 'add'} onClick={() => setActiveTab('add')}>
            + Add Word
          </AddWordBtn>
          <ToggleTrack>
            <ToggleOption
              $active={activeTab === 'study' && studyTab === 'flash'}
              onClick={() => switchToStudy('flash')}
            >
              Flashcards
            </ToggleOption>
            <ToggleOption
              $active={activeTab === 'study' && studyTab === 'study'}
              onClick={() => switchToStudy('study')}
            >
              Study Mode
            </ToggleOption>
            <ToggleOption
              $active={activeTab === 'study' && studyTab === 'stats'}
              onClick={() => switchToStudy('stats')}
            >
              Stats
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
          {activeTab === 'study' && studyTab === 'study' && <StudyMode words={words} bookId={bookId} />}
          {activeTab === 'study' && studyTab === 'stats' && (
            <BookStatsPanel bookId={bookId} totalWords={words.length} />
          )}
        </Content>
      </MainArea>

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
    </Shell>
  );
}
