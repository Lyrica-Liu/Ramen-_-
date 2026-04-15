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
  padding: 20px 28px 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TopBar = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${p => p.theme.border};

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
  background: linear-gradient(135deg, ${p => p.theme.primary} 0%, ${p => p.theme.primaryStrong} 100%);
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  padding: 10px 22px;
  font-weight: 600;
  font-size: 0.92rem;
  white-space: nowrap;
  transition: all 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${p => p.theme.shadowPrimary};
  }

  &:active {
    transform: translateY(0);
  }
`;

const BookTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  letter-spacing: -0.02em;
  margin-bottom: 14px;
  flex-shrink: 0;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 26px;
  flex: 1;
  min-height: 0;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const RightPanel = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const TabBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  flex-shrink: 0;
`;

const TabContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
`;

const TabBtn = styled.button`
  flex: 1;
  padding: 11px 10px;
  background: ${p => (p.$active
    ? `linear-gradient(135deg, ${p.theme.primary} 0%, ${p.theme.primaryStrong} 100%)`
    : p.theme.panel)};
  color: ${p => (p.$active ? '#fff' : p.theme.textSecondary)};
  border: 1px solid ${p => (p.$active ? 'transparent' : p.theme.border)};
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.16s ease;
  box-shadow: ${p => (p.$active ? p.theme.shadowPrimary : p.theme.shadow)};

  &:hover {
    background: ${p => (p.$active
      ? `linear-gradient(135deg, ${p.theme.primaryStrong} 0%, #3730a3 100%)`
      : p.theme.btnHover)};
    color: ${p => (p.$active ? '#fff' : p.theme.text)};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

/* ─── daily study layout ─── */

const DailyLayout = styled.div`
  max-width: 760px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 24px;
`;

const DailyTitleBlock = styled.div``;

const DailyTitleText = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${p => p.theme.text};
`;

const DailyPhase = styled.div`
  font-size: 0.85rem;
  color: ${p => p.theme.muted};
  margin-top: 2px;
`;

const ExitDailyBtn = styled.button`
  padding: 8px 18px;
  background: ${p => p.theme.panel};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 600;
  font-size: 0.88rem;
  color: ${p => p.theme.textSecondary};
  transition: all 0.16s ease;

  &:hover {
    background: ${p => p.theme.btnHover};
    border-color: ${p => p.theme.borderStrong};
    color: ${p => p.theme.text};
  }
`;

const QuizPromptBox = styled.div`
  margin-top: 20px;
  background: ${p => p.theme.panel};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 36px 40px;
  text-align: center;
  box-shadow: ${p => p.theme.shadow};
`;

const QuizPromptTitle = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  margin-bottom: 8px;
`;

const QuizPromptSub = styled.div`
  font-size: 0.93rem;
  color: ${p => p.theme.textSecondary};
  margin-bottom: 28px;
`;

const QuizPromptBtns = styled.div`
  display: flex;
  gap: 14px;
  justify-content: center;
`;

const StartQuizBtn = styled.button`
  padding: 13px 30px;
  background: linear-gradient(135deg, ${p => p.theme.primary}, ${p => p.theme.primaryStrong});
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 600;
  font-size: 0.97rem;
  transition: all 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${p => p.theme.shadowPrimary};
  }

  &:active {
    transform: translateY(0);
  }
`;

const SkipQuizBtn = styled.button`
  padding: 13px 30px;
  background: ${p => p.theme.panel};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 600;
  font-size: 0.97rem;
  color: ${p => p.theme.textSecondary};
  transition: all 0.16s ease;

  &:hover {
    background: ${p => p.theme.btnHover};
    border-color: ${p => p.theme.borderStrong};
    color: ${p => p.theme.text};
  }
`;

const FinishRow = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const FinishBtn = styled.button`
  padding: 13px 32px;
  background: linear-gradient(135deg, ${p => p.theme.primary}, ${p => p.theme.primaryStrong});
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 600;
  font-size: 0.97rem;
  transition: all 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${p => p.theme.shadowPrimary};
  }

  &:active {
    transform: translateY(0);
  }
`;

/* ──────────────────────────── constants ──────────────────────────── */

const DIFFICULTY_HIGH_THRESHOLD = 3;

function isDue(word) {
  if (!word || !word.nextReviewTime) return true;
  return new Date() >= new Date(word.nextReviewTime);
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
    okayCount: 0,
    hardCount: 0,
  });
  const [showDsComplete, setShowDsComplete] = useState(false);
  const [dsSummary, setDsSummary] = useState(null);

  /* daily study mode: 'off' | 'flash' | 'quizPrompt' | 'quiz' */
  const [dailyMode, setDailyMode] = useState('off');
  const [dailyBatchIndices, setDailyBatchIndices] = useState([]);
  const [dailyQuizPointer, setDailyQuizPointer] = useState(0);
  /* saves the last completed batch so daily study can be repeated */
  const [completedBatchIndices, setCompletedBatchIndices] = useState([]);

  /* ─── refs ─── */
  const exitTimer = useRef(null);
  const handlersRef = useRef({});
  const stateRef = useRef({});
  /* tracks word IDs whose familiarity level has already been updated today */
  const reviewedTodayIds = useRef({ date: '', ids: new Set() });

  function canUpdateLevel(wordId) {
    const today = new Date().toDateString();
    if (reviewedTodayIds.current.date !== today) {
      reviewedTodayIds.current = { date: today, ids: new Set() };
    }
    if (reviewedTodayIds.current.ids.has(wordId)) return false;
    reviewedTodayIds.current.ids.add(wordId);
    return true;
  }

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

  /* ─── daily session completion ─── */
  const completeDsRef = useRef();
  completeDsRef.current = () => {
    const reviewed = ds.reviewedSet.size;
    const mastered = [...ds.reviewedSet]
      .map(idx => words[idx])
      .filter(w => w && (w.reviewLevel || 1) >= 5).length;
    const attempts = ds.easyCount + ds.okayCount + ds.hardCount;
    const accuracy = attempts > 0 ? Math.round((ds.easyCount / attempts) * 100) : null;

    setDsSummary({ reviewed, mastered, accuracy });
    setShowDsComplete(true);
    setDs(prev => ({ ...prev, active: false, indices: [], pointer: 0 }));
    refreshProgress();

    if (dailyMode === 'flash') {
      setCompletedBatchIndices([...dailyBatchIndices]);
      setDailyMode('quizPrompt');
    } else {
      // Normal mode: auto-dismiss
      clearExit();
      exitTimer.current = setTimeout(() => {
        setShowDsComplete(false);
        setDs({
          active: false,
          indices: [],
          pointer: 0,
          reviewedSet: new Set(),
          easyCount: 0,
          okayCount: 0,
          hardCount: 0,
        });
        setManualSelection(false);
        setShowBack(false);
      }, 2400);
    }
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
      if (canUpdateLevel(word.id)) {
        await api.reviewWord(bookId, word.id, result);
        await Promise.all([refreshWords(), refreshProgress()]);
      }
      setDs(prev => {
        if (!prev.active) return prev;
        const s = new Set(prev.reviewedSet);
        s.add(currentIndex);
        return {
          ...prev,
          reviewedSet: s,
          easyCount: prev.easyCount + (result === 'easy' ? 1 : 0),
          okayCount: prev.okayCount + (result === 'okay' ? 1 : 0),
          hardCount: prev.hardCount + (result === 'hard' ? 1 : 0),
        };
      });
      handleNextCard();
    } catch {
      alert('Review update failed');
    }
  }

  async function handleStartDailyStudy() {
    if (!words.length) {
      alert('No words available for daily study. Add some words first.');
      return;
    }

    let reviewWords;
    try {
      reviewWords = await api.fetchDailyReviewWords(bookId);
    } catch {
      alert('Failed to load daily review words.');
      return;
    }

    let queue;

    if (reviewWords.length > 0) {
      queue = reviewWords
        .map(w => words.findIndex(local => local.id === w.id))
        .filter(i => i >= 0);
    } else if (completedBatchIndices.length > 0) {
      // No words due — repeat last session (levels won't double-update via canUpdateLevel)
      queue = completedBatchIndices.filter(i => i >= 0 && i < words.length);
    } else {
      // First run ever and no due words — use all available words
      queue = words.map((_, i) => i);
    }

    if (!queue.length) {
      alert('No words available for study.');
      return;
    }

    clearExit();
    const first = queue[0];
    setCurrentIndex(first);
    setShowBack(false);
    setManualSelection(true);
    setSearchText('');
    setActiveFilter('all');
    setShowDsComplete(false);
    setDsSummary(null);
    setDailyBatchIndices(queue);
    setDailyQuizPointer(0);
    setDailyMode('flash');
    setActiveTab('flash');
    setDs({
      active: true,
      indices: queue,
      pointer: 0,
      reviewedSet: new Set([first]),
      easyCount: 0,
      okayCount: 0,
      hardCount: 0,
    });
  }

  function handleStartQuiz() {
    setShowDsComplete(false);
    setDailyQuizPointer(0);
    setDailyMode('quiz');
  }

  function handleExitDailyStudy() {
    clearExit();
    setDailyMode('off');
    setDailyBatchIndices([]);
    setDailyQuizPointer(0);
    setShowDsComplete(false);
    setDsSummary(null);
    setDs({
      active: false,
      indices: [],
      pointer: 0,
      reviewedSet: new Set(),
      easyCount: 0,
      okayCount: 0,
      hardCount: 0,
    });
    setManualSelection(false);
    setShowBack(false);
    setActiveTab('flash');
    refreshProgress();
  }

  function handleNextDailyQuiz() {
    setDailyQuizPointer(prev => Math.min(prev + 1, dailyBatchIndices.length - 1));
  }

  function handlePrevDailyQuiz() {
    setDailyQuizPointer(prev => Math.max(prev - 1, 0));
  }

  async function handleCheckDailySpell(guess) {
    const idx = dailyBatchIndices[dailyQuizPointer];
    if (idx === undefined) return null;
    const word = words[idx];
    if (!word) return null;
    const target = word.term.trim().toLowerCase();
    const g = guess.trim().toLowerCase();
    if (!g) return { correct: false, message: 'Please type the English word.' };
    if (g === target) {
      if (canUpdateLevel(word.id)) {
        try {
          await api.reviewWord(bookId, word.id, 'easy');
          await Promise.all([refreshWords(), refreshProgress()]);
        } catch { /* ignore */ }
      }
      return { correct: true, message: 'Correct!' };
    }
    return { correct: false, message: `Wrong. Correct answer: ${word.term}` };
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
      if (canUpdateLevel(word.id)) {
        try {
          await api.reviewWord(bookId, word.id, 'easy');
          await Promise.all([refreshWords(), refreshProgress()]);
        } catch { /* ignore */ }
      }
      return { correct: true, message: 'Correct!' };
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
  stateRef.current = { activeTab, ds, dailyMode };
  handlersRef.current = {
    flip: handleFlip,
    nextCard: handleNextCard,
    prevCard: handlePrevCard,
    easyReview: () => handleReview('easy'),
    okayReview: () => handleReview('okay'),
    hardReview: () => handleReview('hard'),
    nextSpell: handleNextSpell,
    prevSpell: handlePrevSpell,
    nextDailyQuiz: handleNextDailyQuiz,
    prevDailyQuiz: handlePrevDailyQuiz,
  };

  /* ──────────────────────────── effects ──────────────────────────── */

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

  useEffect(() => {
    if (!ds.active || ds.indices.length === 0) return;
    if (ds.reviewedSet.size < ds.indices.length) return;
    completeDsRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ds.reviewedSet.size, ds.active, ds.indices.length]);

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

      /* daily quiz mode: arrow navigation only, block all flash shortcuts */
      if (s.dailyMode === 'quiz') {
        if (!typing) {
          if (e.key === 'ArrowRight') { e.preventDefault(); h.nextDailyQuiz(); return; }
          if (e.key === 'ArrowLeft') { e.preventDefault(); h.prevDailyQuiz(); return; }
        }
        return;
      }

      /* quiz prompt: block all shortcuts */
      if (s.dailyMode === 'quizPrompt') return;

      /* normal spell mode */
      if (s.activeTab === 'spell' && !typing) {
        if (e.key === 'ArrowRight') { e.preventDefault(); h.nextSpell(); return; }
        if (e.key === 'ArrowLeft') { e.preventDefault(); h.prevSpell(); return; }
      }

      /* flash mode */
      if (s.activeTab !== 'flash' || typing) return;
      if (e.code === 'Space') { e.preventDefault(); h.flip(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); h.nextCard(); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); h.prevCard(); return; }
      if (e.key === 'a' || e.key === 'A') { e.preventDefault(); h.hardReview(); return; }
      if (e.key === 's' || e.key === 'S') { e.preventDefault(); h.okayReview(); return; }
      if (e.key === 'd' || e.key === 'D') { e.preventDefault(); h.easyReview(); }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const close = () => setCtxMenu(null);
    document.addEventListener('click', close);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('scroll', close, true);
    };
  }, []);

  useEffect(() => () => clearExit(), []);

  /* ──────────────────────────── render ──────────────────────────── */

  const inDailyStudy = dailyMode !== 'off';

  const activeIndex =
    activeTab === 'flash'
      ? effectiveIndex
      : activeTab === 'spell'
        ? spellIndex
        : null;

  return (
    <Container>
      <TopBar>
        {inDailyStudy ? (
          <>
            <DailyTitleBlock>
              <DailyTitleText>Daily Study</DailyTitleText>
              <DailyPhase>
                {dailyMode === 'flash' && `Flash Cards · ${dailyBatchIndices.length} words`}
                {dailyMode === 'quizPrompt' && 'Flash Cards Complete'}
                {dailyMode === 'quiz' && `Spelling Quiz · ${dailyBatchIndices.length} words`}
              </DailyPhase>
            </DailyTitleBlock>
            <ProgressRow>
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
            <ExitDailyBtn onClick={handleExitDailyStudy}>✕ Exit</ExitDailyBtn>
          </>
        ) : (
          <>
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
          </>
        )}
      </TopBar>

      {inDailyStudy ? (
        <DailyLayout>
          {/* Flash cards phase */}
          {(dailyMode === 'flash' || dailyMode === 'quizPrompt') && (
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
              onOkay={() => handleReview('okay')}
              onHard={() => handleReview('hard')}
            />
          )}

          {/* Quiz prompt */}
          {dailyMode === 'quizPrompt' && (
            <QuizPromptBox>
              <QuizPromptTitle>Flash cards complete!</QuizPromptTitle>
              <QuizPromptSub>
                Would you like to reinforce today's words with a spelling quiz?
              </QuizPromptSub>
              <QuizPromptBtns>
                <StartQuizBtn onClick={handleStartQuiz}>Start Spelling Quiz</StartQuizBtn>
                <SkipQuizBtn onClick={handleExitDailyStudy}>No, I'm Done</SkipQuizBtn>
              </QuizPromptBtns>
            </QuizPromptBox>
          )}

          {/* Spelling quiz phase */}
          {dailyMode === 'quiz' && (
            <>
              <SpellingQuiz
                word={words[dailyBatchIndices[dailyQuizPointer]]}
                position={dailyQuizPointer + 1}
                total={dailyBatchIndices.length}
                onCheck={handleCheckDailySpell}
                onNext={handleNextDailyQuiz}
                onPrev={handlePrevDailyQuiz}
                large
              />
              <FinishRow>
                <FinishBtn onClick={handleExitDailyStudy}>Finish &amp; Exit Daily Study</FinishBtn>
              </FinishRow>
            </>
          )}
        </DailyLayout>
      ) : (
        <>
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

              <TabContent>
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
                    onOkay={() => handleReview('okay')}
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
              </TabContent>
            </RightPanel>
          </Layout>
        </>
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
    </Container>
  );
}
