import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import * as api from '../api';
import ContextMenu from '../components/ContextMenu';
import VocabList from '../components/VocabList';
import AddWords from '../components/AddWords';
import FlashCards from '../components/FlashCards';
import SpellingQuiz from '../components/SpellingQuiz';
import Statistics from '../components/Statistics';

/* ──────────────────────────── styled ──────────────────────────── */

const Container = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 24px 32px 48px;
`;

const TopBar = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const BackLink = styled(Link)`
  color: ${p => p.theme.primary};
  font-weight: 500;
  font-size: 0.97rem;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const ProgressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: center;
  font-size: 0.95rem;
  color: ${p => p.theme.textSecondary};
  flex-wrap: wrap;

  strong {
    color: ${p => p.theme.text};
    font-weight: 600;
  }
`;

const DailyBtn = styled.button`
  background: ${p => p.theme.primary};
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radius};
  padding: 10px 22px;
  font-weight: 600;
  font-size: 0.92rem;
  white-space: nowrap;

  &:hover {
    background: ${p => p.theme.primaryStrong};
    transform: translateY(-1px);
  }
`;

const BookTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  margin-bottom: 22px;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 26px;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const RightPanel = styled.div`
  min-width: 0;
`;

const TabBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const TabBtn = styled.button`
  flex: 1;
  padding: 12px 10px;
  background: ${p => (p.$active ? p.theme.primary : p.theme.btnBg)};
  color: ${p => (p.$active ? '#fff' : p.theme.text)};
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 600;
  font-size: 0.92rem;
  transition: background 0.15s;

  &:hover {
    background: ${p => (p.$active ? p.theme.primaryStrong : p.theme.btnHover)};
  }
`;

/* ──────────────────────────── constants ──────────────────────────── */

const DIFFICULTY_HIGH_THRESHOLD = 3;

function isDue(word) {
  if (!word || !word.nextReviewTime) return true;
  return new Date() >= new Date(word.nextReviewTime);
}

function buildPriorityQueue(words) {
  const due = [];
  const difficult = [];
  const fresh = [];
  const remaining = [];

  words.forEach((word, index) => {
    if (isDue(word)) due.push(index);
    else if ((word.difficultyScore || 0) >= DIFFICULTY_HIGH_THRESHOLD) difficult.push(index);
    else if (!word.lastReviewedTime) fresh.push(index);
    else remaining.push(index);
  });

  const queue = [];
  const seen = new Set();
  const push = arr => arr.forEach(i => { if (!seen.has(i)) { seen.add(i); queue.push(i); } });

  push(due);
  push(difficult);
  push(fresh);

  const total = words.length;
  const minT = Math.min(20, total);
  const maxT = Math.min(40, total);
  const prefT = Math.min(30, maxT);

  if (queue.length < minT) push(remaining);

  const target = queue.length >= prefT ? prefT : Math.max(minT, queue.length);
  return queue.slice(0, Math.min(maxT, target));
}

/* ──────────────────────────── component ──────────────────────────── */

export default function BookView() {
  const { bookId } = useParams();

  /* ─── state ─── */
  const [book, setBook] = useState(null);
  const [words, setWords] = useState([]);
  const [progress, setProgress] = useState({ addedToday: 0, reviewedToday: 0, streak: 0 });

  const [activeTab, setActiveTab] = useState('add');
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [ctxMenu, setCtxMenu] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [manualSelection, setManualSelection] = useState(false);

  const [spellIndex, setSpellIndex] = useState(0);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [lastSelIdx, setLastSelIdx] = useState(null);

  const [ds, setDs] = useState({
    active: false,
    indices: [],
    pointer: 0,
    reviewedSet: new Set(),
    easyCount: 0,
    hardCount: 0,
  });
  const [showDsComplete, setShowDsComplete] = useState(false);
  const [dsSummary, setDsSummary] = useState(null);

  /* ─── refs ─── */
  const exitTimer = useRef(null);
  const handlersRef = useRef({});
  const stateRef = useRef({});

  /* ─── derived ─── */
  const matchesFilter = useCallback(
    word => {
      if (!word) return false;
      switch (activeFilter) {
        case 'new':
          return !word.lastReviewedTime;
        case 'difficult':
          return (word.difficultyScore || 0) >= DIFFICULTY_HIGH_THRESHOLD;
        case 'due':
          return !!word.nextReviewTime && new Date(word.nextReviewTime) <= new Date();
        case 'mastered':
          return (word.reviewLevel || 1) >= 5;
        default:
          return true;
      }
    },
    [activeFilter],
  );

  const visibleWords = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return words
      .map((w, i) => ({ ...w, index: i }))
      .filter(item => {
        if (!matchesFilter(item)) return false;
        if (!q) return true;
        return (
          item.term.toLowerCase().includes(q) || item.translation.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Group: low (level 1-2) = 0, mid (level 3-4) = 1, high (level 5+) = 2
        const groupOf = lvl => (lvl <= 2 ? 0 : lvl <= 4 ? 1 : 2);
        const gA = groupOf(a.reviewLevel || 1);
        const gB = groupOf(b.reviewLevel || 1);
        if (gA !== gB) return gA - gB;
        return a.term.localeCompare(b.term, undefined, { sensitivity: 'base' });
      });
  }, [words, searchText, matchesFilter]);

  const flashCandidates = useMemo(() => visibleWords.map(i => i.index), [visibleWords]);

  const dueIndices = useMemo(
    () => flashCandidates.filter(idx => isDue(words[idx])),
    [flashCandidates, words],
  );

  const currentFlashIndices = useMemo(() => {
    if (ds.active && ds.indices.length) return ds.indices;
    return flashCandidates;
  }, [ds.active, ds.indices, flashCandidates]);

  const effectiveIndex = useMemo(() => {
    if (currentFlashIndices.length === 0) return -1;
    if (currentFlashIndices.includes(currentIndex)) return currentIndex;
    return currentFlashIndices[0];
  }, [currentFlashIndices, currentIndex]);

  const flashPosition = useMemo(() => {
    const pos = currentFlashIndices.indexOf(effectiveIndex);
    return pos >= 0 ? pos : 0;
  }, [currentFlashIndices, effectiveIndex]);

  const canFlip = useMemo(() => {
    if (!words.length || currentFlashIndices.length === 0) return false;
    if (!ds.active && !manualSelection && dueIndices.length === 0) return false;
    return currentFlashIndices.includes(currentIndex);
  }, [words, currentFlashIndices, ds.active, manualSelection, dueIndices, currentIndex]);

  const flashMessage = useMemo(() => {
    if (words.length === 0) return 'No words yet';
    if (currentFlashIndices.length === 0) return 'No words match this filter.';
    if (!ds.active && !manualSelection && dueIndices.length === 0)
      return 'All words reviewed for now.';
    return null;
  }, [words, currentFlashIndices, ds.active, manualSelection, dueIndices]);

  const dsProgress = useMemo(() => {
    if (!ds.active || !ds.indices.length) return null;
    const cur = Math.min(ds.pointer + 1, ds.indices.length);
    return { text: `Card ${cur} / ${ds.indices.length}`, percent: (cur / ds.indices.length) * 100 };
  }, [ds.active, ds.indices.length, ds.pointer]);

  /* ─── api helpers ─── */
  const refreshProgress = useCallback(async () => {
    try {
      setProgress(await api.fetchProgress(bookId));
    } catch (e) {
      console.error(e);
    }
  }, [bookId]);

  const refreshWords = useCallback(async () => {
    try {
      setWords(await api.fetchWords(bookId));
    } catch (e) {
      console.error(e);
    }
  }, [bookId]);

  const doRecordActivity = useCallback(
    async (type, amount = 1, wordId = null) => {
      try {
        setProgress(await api.recordActivity(bookId, type, amount, wordId));
      } catch (e) {
        console.error(e);
      }
    },
    [bookId],
  );

  /* ─── helpers ─── */
  function clearExit() {
    if (exitTimer.current) {
      clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }
  }

  function markViewed(index) {
    setDs(prev => {
      if (!prev.active || !prev.indices.includes(index)) return prev;
      if (prev.reviewedSet.has(index)) return prev;
      const s = new Set(prev.reviewedSet);
      s.add(index);
      return { ...prev, reviewedSet: s };
    });
  }

  /* ─── daily session completion (ref-based to avoid stale closures) ─── */
  const completeDsRef = useRef();
  completeDsRef.current = () => {
    const reviewed = ds.reviewedSet.size;
    const mastered = [...ds.reviewedSet]
      .map(idx => words[idx])
      .filter(w => w && (w.reviewLevel || 1) >= 5).length;
    const attempts = ds.easyCount + ds.hardCount;
    const accuracy = attempts > 0 ? Math.round((ds.easyCount / attempts) * 100) : null;

    setDsSummary({ reviewed, mastered, accuracy });
    setShowDsComplete(true);
    setDs(prev => ({ ...prev, active: false, indices: [], pointer: 0 }));
    refreshProgress();

    clearExit();
    exitTimer.current = setTimeout(() => {
      setShowDsComplete(false);
      setDs({
        active: false,
        indices: [],
        pointer: 0,
        reviewedSet: new Set(),
        easyCount: 0,
        hardCount: 0,
      });
      setManualSelection(false);
      setShowBack(false);
    }, 2400);
  };

  /* ─── action handlers ─── */
  function handleSwitchTab(tab) {
    setActiveTab(tab);
    if (tab !== 'flash') clearExit();
    if (tab === 'flash' && !ds.active) {
      setManualSelection(false);
      setShowBack(false);
    }
  }

  function handleFlip() {
    if (!canFlip) return;
    setShowBack(prev => !prev);
    doRecordActivity('reviewed', 1, words[currentIndex]?.id ?? null);
    setDs(prev => {
      if (!prev.active) return prev;
      const s = new Set(prev.reviewedSet);
      s.add(currentIndex);
      return { ...prev, reviewedSet: s };
    });
  }

  function handleNextCard() {
    if (!currentFlashIndices.length) return;
    const pos = currentFlashIndices.indexOf(currentIndex);
    const start = pos >= 0 ? pos : 0;
    const next = (start + 1) % currentFlashIndices.length;
    const idx = currentFlashIndices[next];
    setCurrentIndex(idx);
    setManualSelection(true);
    setShowBack(false);
    if (ds.active) setDs(prev => ({ ...prev, pointer: next }));
    markViewed(idx);
  }

  function handlePrevCard() {
    if (!currentFlashIndices.length) return;
    const pos = currentFlashIndices.indexOf(currentIndex);
    const start = pos >= 0 ? pos : 0;
    const prev = (start - 1 + currentFlashIndices.length) % currentFlashIndices.length;
    const idx = currentFlashIndices[prev];
    setCurrentIndex(idx);
    setManualSelection(true);
    setShowBack(false);
    if (ds.active) setDs(p => ({ ...p, pointer: prev }));
    markViewed(idx);
  }

  async function handleReview(result) {
    if (!words.length) return;
    const word = words[currentIndex];
    if (!word?.id) return;
    try {
      await api.reviewWord(bookId, word.id, result);
      setDs(prev => {
        if (!prev.active) return prev;
        const s = new Set(prev.reviewedSet);
        s.add(currentIndex);
        return {
          ...prev,
          reviewedSet: s,
          easyCount: prev.easyCount + (result === 'easy' ? 1 : 0),
          hardCount: prev.hardCount + (result === 'hard' ? 1 : 0),
        };
      });
      await Promise.all([refreshWords(), refreshProgress()]);
    } catch {
      alert('Review update failed');
    }
  }

  function handleStartDailyStudy() {
    if (!words.length) {
      alert('No words available for daily study. Add some words first.');
      return;
    }
    const queue = buildPriorityQueue(words);
    if (!queue.length) {
      alert("No suitable words found for today's study session.");
      return;
    }
    handleSwitchTab('flash');
    clearExit();
    const first = queue[0];
    setCurrentIndex(first);
    setShowBack(false);
    setManualSelection(true);
    setSearchText('');
    setActiveFilter('all');
    setShowDsComplete(false);
    setDs({
      active: true,
      indices: queue,
      pointer: 0,
      reviewedSet: new Set([first]),
      easyCount: 0,
      hardCount: 0,
    });
  }

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

    if (activeTab === 'spell') {
      setSpellIndex(item.index);
    } else {
      if (ds.active && !ds.indices.includes(item.index)) return;
      setCurrentIndex(item.index);
      setManualSelection(true);
      setShowBack(false);
      if (ds.active) {
        const p = ds.indices.indexOf(item.index);
        if (p >= 0) setDs(prev => ({ ...prev, pointer: p }));
      }
      markViewed(item.index);
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
    const newTerm = prompt('Edit English word:', word.term);
    if (!newTerm?.trim()) return;
    const newTrans = prompt('Edit translation:', word.translation);
    if (!newTrans?.trim()) return;
    try {
      await api.updateWord(bookId, word.id, {
        term: newTerm.trim(),
        translation: newTrans.trim(),
      });
      await refreshWords();
    } catch {
      alert('Failed to update word.');
    }
  }

  async function handleDeleteWord() {
    if (!ctxMenu) return;
    const { word } = ctxMenu;
    setCtxMenu(null);
    if (!confirm(`Delete word "${word.term}"?`)) return;
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
    if (!confirm(`Delete ${selectedIds.size} selected word(s)?`)) return;
    try {
      await Promise.all([...selectedIds].map(id => api.deleteWord(bookId, id)));
    } catch {
      alert('Some words could not be deleted.');
    }
    setSelectedIds(new Set());
    setLastSelIdx(null);
    await refreshWords();
  }

  async function handleSaveWords(text) {
    const payload = [];
    text.split('\n').forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        payload.push({ term: parts[0], translation: parts.slice(1).join(' ') });
      }
    });
    if (!payload.length) {
      alert('Wrong format; use "word translation" each line.');
      return false;
    }
    try {
      await api.saveWordsBatch(bookId, payload);
      await Promise.all([refreshWords(), refreshProgress()]);
      handleSwitchTab('flash');
      return true;
    } catch {
      alert('Save failed');
      return false;
    }
  }

  async function handleCheckSpell(guess) {
    if (!words.length) return null;
    const word = words[spellIndex];
    const target = word.term.trim().toLowerCase();
    const g = guess.trim().toLowerCase();
    if (!g) return { correct: false, message: 'Please type the English word.' };
    if (g === target) {
      const prevLvl = word.reviewLevel || 1;
      try {
        const updated = await api.reviewWord(bookId, word.id, 'easy');
        await Promise.all([refreshWords(), refreshProgress()]);
        let msg = 'Correct! 🎉';
        if (updated && (updated.reviewLevel || prevLvl) === prevLvl && prevLvl < 6) {
          msg = 'Correct! 🎉 Daily level-up cap reached for this word.';
        }
        return { correct: true, message: msg };
      } catch {
        return { correct: true, message: 'Correct! 🎉' };
      }
    }
    return { correct: false, message: `Wrong. Correct answer: ${word.term}` };
  }

  function handleNextSpell() {
    if (!words.length) return;
    setSpellIndex(prev => (prev + 1) % words.length);
  }

  function handlePrevSpell() {
    if (!words.length) return;
    setSpellIndex(prev => (prev - 1 + words.length) % words.length);
  }

  /* ─── sync refs for keyboard handler ─── */
  stateRef.current = { activeTab, ds };
  handlersRef.current = {
    flip: handleFlip,
    nextCard: handleNextCard,
    prevCard: handlePrevCard,
    easyReview: () => handleReview('easy'),
    hardReview: () => handleReview('hard'),
    nextSpell: handleNextSpell,
    prevSpell: handlePrevSpell,
  };

  /* ──────────────────────────── effects ──────────────────────────── */

  /* fetch data on mount */
  useEffect(() => {
    if (!bookId) return;
    (async () => {
      try {
        const [b, w, p] = await Promise.all([
          api.getBook(bookId),
          api.fetchWords(bookId),
          api.fetchProgress(bookId),
        ]);
        setBook(b);
        setWords(w);
        setProgress(p);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [bookId]);

  /* sync indices when words change */
  useEffect(() => {
    const len = words.length;
    if (len === 0) return;
    setCurrentIndex(prev => (prev >= len ? 0 : prev));
    setSpellIndex(prev => (prev >= len ? 0 : prev));
    setDs(prev => {
      if (!prev.active) return prev;
      const valid = prev.indices.filter(i => i >= 0 && i < len);
      if (!valid.length) return { ...prev, active: false, indices: [] };
      return { ...prev, indices: valid };
    });
    setSelectedIds(prev => {
      const ids = new Set(words.filter(w => w.id).map(w => w.id));
      const filtered = new Set([...prev].filter(id => ids.has(id)));
      return filtered.size === prev.size ? prev : filtered;
    });
  }, [words]);

  /* daily session completion detection */
  useEffect(() => {
    if (!ds.active || ds.indices.length === 0) return;
    if (ds.reviewedSet.size < ds.indices.length) return;
    completeDsRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ds.reviewedSet.size, ds.active, ds.indices.length]);

  /* keyboard shortcuts */
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') {
        setCtxMenu(null);
        return;
      }

      const s = stateRef.current;
      const h = handlersRef.current;
      const tag = e.target.tagName?.toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;

      /* spell-mode global (when NOT in input) */
      if (s.activeTab === 'spell' && !typing) {
        if (e.key === 'ArrowRight') { e.preventDefault(); h.nextSpell(); return; }
        if (e.key === 'ArrowLeft') { e.preventDefault(); h.prevSpell(); return; }
      }

      /* flash-mode */
      if (s.activeTab !== 'flash' || typing) return;
      if (e.code === 'Space') { e.preventDefault(); h.flip(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); h.nextCard(); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); h.prevCard(); return; }
      if (e.key === 'e' || e.key === 'E') { e.preventDefault(); h.easyReview(); return; }
      if (e.key === 'h' || e.key === 'H') { e.preventDefault(); h.hardReview(); }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* close context menu on click / scroll */
  useEffect(() => {
    const close = () => setCtxMenu(null);
    document.addEventListener('click', close);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('scroll', close, true);
    };
  }, []);

  /* cleanup exit timer */
  useEffect(() => () => clearExit(), []);

  /* ──────────────────────────── render ──────────────────────────── */

  const activeIndex =
    activeTab === 'flash'
      ? effectiveIndex
      : activeTab === 'spell'
        ? spellIndex
        : null;

  return (
    <Container>
      <TopBar>
        <BackLink to="/bookshelf">← Back to Bookshelf</BackLink>
        <ProgressRow>
          <span>
            Added Today: <strong>{progress.addedToday}</strong>
          </span>
          <span>
            Reviewed Today: <strong>{progress.reviewedToday}</strong>
          </span>
          <span>
            Streak:{' '}
            <strong>
              {progress.streak} day{progress.streak === 1 ? '' : 's'}
            </strong>
          </span>
        </ProgressRow>
        <DailyBtn onClick={handleStartDailyStudy}>▶ Start Daily Study</DailyBtn>
      </TopBar>

      <BookTitle>{book?.title}</BookTitle>

      <Layout>
        <VocabList
          visibleWords={visibleWords}
          activeIndex={activeIndex}
          selectionMode={selectionMode}
          selectedWordIds={selectedIds}
          searchText={searchText}
          activeFilter={activeFilter}
          isQuizActive={activeTab === 'spell'}
          onSearchChange={setSearchText}
          onFilterChange={setActiveFilter}
          onWordClick={handleWordClick}
          onWordContextMenu={handleWordCtx}
          onToggleSelect={toggleSelect}
          onDeleteSelected={handleDeleteSelected}
          deleteCount={selectedIds.size}
        />

        <RightPanel>
          <TabBar>
            <TabBtn $active={activeTab === 'add'} onClick={() => handleSwitchTab('add')}>
              Add
            </TabBtn>
            <TabBtn $active={activeTab === 'flash'} onClick={() => handleSwitchTab('flash')}>
              Flash Cards
            </TabBtn>
            <TabBtn $active={activeTab === 'spell'} onClick={() => handleSwitchTab('spell')}>
              Spelling Quiz
            </TabBtn>
            <TabBtn $active={activeTab === 'stats'} onClick={() => handleSwitchTab('stats')}>
              Statistics
            </TabBtn>
          </TabBar>

          {activeTab === 'add' && <AddWords onSave={handleSaveWords} />}

          {activeTab === 'flash' && (
            <FlashCards
              word={effectiveIndex >= 0 ? words[effectiveIndex] : null}
              showBack={showBack}
              position={flashPosition + 1}
              total={currentFlashIndices.length}
              message={flashMessage}
              canInteract={canFlip}
              dailyProgress={ds.active ? dsProgress : null}
              showComplete={showDsComplete}
              summary={dsSummary}
              onFlip={handleFlip}
              onNext={handleNextCard}
              onPrev={handlePrevCard}
              onEasy={() => handleReview('easy')}
              onHard={() => handleReview('hard')}
            />
          )}

          {activeTab === 'spell' && (
            <SpellingQuiz
              word={words[spellIndex]}
              position={spellIndex + 1}
              total={words.length}
              onCheck={handleCheckSpell}
              onNext={handleNextSpell}
              onPrev={handlePrevSpell}
            />
          )}

          {activeTab === 'stats' && <Statistics bookId={bookId} />}
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
    </Container>
  );
}
