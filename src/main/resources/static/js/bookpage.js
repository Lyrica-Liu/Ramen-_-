const path = window.location.pathname;
const bookIdFromPath = path.match(/\/book\/(\d+)/);
const bookId = bookIdFromPath ? bookIdFromPath[1] : null;

const dom = {
  progressHeader: document.getElementById('progressHeader'),
  addedTodayCount: document.getElementById('addedTodayCount'),
  reviewedTodayCount: document.getElementById('reviewedTodayCount'),
  streakCount: document.getElementById('streakCount'),
  startDailyStudyBtn: document.getElementById('startDailyStudyBtn'),
  bookTitle: document.getElementById('bookTitle'),
  vocabList: document.getElementById('vocabList'),
  searchInput: document.getElementById('searchInput'),
  toggleSelectBtn: document.getElementById('toggleSelectBtn'),
  filterBar: document.getElementById('filterBar'),
  selectActions: document.getElementById('selectActions'),
  deleteSelectedBtn: document.getElementById('deleteSelectedBtn'),
  tabAdd: document.getElementById('tabAdd'),
  tabFlash: document.getElementById('tabFlash'),
  tabSpell: document.getElementById('tabSpell'),
  tabStats: document.getElementById('tabStats'),
  addSection: document.getElementById('addSection'),
  flashSection: document.getElementById('flashSection'),
  spellSection: document.getElementById('spellSection'),
  statsSection: document.getElementById('statsSection'),
  statsGraph: document.getElementById('statsGraph'),
  statsHint: document.getElementById('statsHint'),
  statsPointDetail: document.getElementById('statsPointDetail'),
  wordInput: document.getElementById('wordInput'),
  saveWordsBtn: document.getElementById('saveWordsBtn'),
  flashTerm: document.getElementById('flashTerm'),
  flashTranslation: document.getElementById('flashTranslation'),
  flashcard: document.getElementById('flashcard'),
  prevCard: document.getElementById('prevCard'),
  nextCard: document.getElementById('nextCard'),
  flipCard: document.getElementById('flipCard'),
  hardReview: document.getElementById('hardReview'),
  easyReview: document.getElementById('easyReview'),
  cardIndex: document.getElementById('cardIndex'),
  dailySessionBanner: document.getElementById('dailySessionBanner'),
  dailySessionProgressText: document.getElementById('dailySessionProgressText'),
  dailySessionProgressBar: document.getElementById('dailySessionProgressBar'),
  dailySessionComplete: document.getElementById('dailySessionComplete'),
  dailySessionSummary: document.getElementById('dailySessionSummary'),
  spellPrompt: document.getElementById('spellPrompt'),
  spellInput: document.getElementById('spellInput'),
  checkSpell: document.getElementById('checkSpell'),
  spellFeedback: document.getElementById('spellFeedback'),
  prevSpell: document.getElementById('prevSpell'),
  nextSpell: document.getElementById('nextSpell'),
  spellIndex: document.getElementById('spellIndex')
};

let words = [];
let currentIndex = 0;
let showBack = false;
let dueIndices = [];
let dueCursor = 0;
let manualSelection = false;
let spellCurrentIndex = 0;
let spellManualSelection = false;
let selectionMode = false;
let selectedWordIds = new Set();
let lastSelectedVisibleIndex = null;
let activeFilter = 'all';
let dailySessionActive = false;
let dailySessionIndices = [];
let dailySessionPointer = 0;
let dailySessionReviewedSet = new Set();
let dailySessionEasyCount = 0;
let dailySessionHardCount = 0;
let dailySessionExitTimer = null;

function clearDailySessionExitTimer() {
  if (dailySessionExitTimer) {
    clearTimeout(dailySessionExitTimer);
    dailySessionExitTimer = null;
  }
}

const DIFFICULTY_HIGH_THRESHOLD = 3;

function renderProgressHeader(progress) {
  if (!progress) return;

  dom.addedTodayCount.textContent = progress.addedToday ?? 0;
  dom.reviewedTodayCount.textContent = progress.reviewedToday ?? 0;

  const streak = progress.streak ?? 0;
  dom.streakCount.textContent = `${streak} day${streak === 1 ? '' : 's'}`;
}

async function fetchProgressHeader() {
  const resp = await fetch(`/api/books/${bookId}/words/progress`);
  if (!resp.ok) {
    return;
  }

  const progress = await resp.json();
  renderProgressHeader(progress);
}

async function recordProgressActivity(type, amount = 1, wordId = null) {
  const resp = await fetch(`/api/books/${bookId}/words/progress/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, amount, wordId })
  });

  if (!resp.ok) {
    return null;
  }

  const progress = await resp.json();
  renderProgressHeader(progress);
  return progress;
}

function getFirstSelectedVisibleIndex(visibleWords) {
  for (let idx = 0; idx < visibleWords.length; idx++) {
    const word = visibleWords[idx];
    if (word && word.id && selectedWordIds.has(word.id)) {
      return idx;
    }
  }
  return null;
}

const vocabContextMenu = document.createElement('div');
vocabContextMenu.className = 'context-menu hidden';
document.body.appendChild(vocabContextMenu);

vocabContextMenu.addEventListener('click', (event) => {
  event.stopPropagation();
});

vocabContextMenu.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  event.stopPropagation();
});

function hideVocabMenu() {
  vocabContextMenu.classList.add('hidden');
  vocabContextMenu.innerHTML = '';
}

function showVocabMenu(x, y, selectedWord) {
  vocabContextMenu.innerHTML = '';

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit Word';
  editBtn.addEventListener('click', async () => {
    hideVocabMenu();
    const newTerm = prompt('Edit English word:', selectedWord.term);
    if (!newTerm || !newTerm.trim()) return;
    const newTranslation = prompt('Edit translation:', selectedWord.translation);
    if (!newTranslation || !newTranslation.trim()) return;

    const updateRes = await fetch(`/api/books/${bookId}/words/${selectedWord.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term: newTerm.trim(), translation: newTranslation.trim() })
    });

    if (!updateRes.ok) {
      alert('Failed to update word.');
      return;
    }

    await fetchWords();
    if (dom.spellSection.classList.contains('active')) {
      renderSpellCard();
    }
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete Word';
  deleteBtn.className = 'danger';
  deleteBtn.addEventListener('click', async () => {
    hideVocabMenu();
    const confirmed = confirm(`Delete word "${selectedWord.term}"?`);
    if (!confirmed) return;

    const deleteRes = await fetch(`/api/books/${bookId}/words/${selectedWord.id}`, {
      method: 'DELETE'
    });

    if (!deleteRes.ok) {
      alert('Failed to delete word.');
      return;
    }

    await fetchWords();
    if (dom.spellSection.classList.contains('active')) {
      if (spellCurrentIndex >= words.length) {
        spellCurrentIndex = Math.max(0, words.length - 1);
      }
      renderSpellCard();
    }
  });

  vocabContextMenu.appendChild(editBtn);
  vocabContextMenu.appendChild(deleteBtn);

  vocabContextMenu.classList.remove('hidden');
  const menuWidth = vocabContextMenu.offsetWidth || 180;
  const menuHeight = vocabContextMenu.offsetHeight || 100;
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 8);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 8);
  vocabContextMenu.style.left = `${Math.max(8, clampedX)}px`;
  vocabContextMenu.style.top = `${Math.max(8, clampedY)}px`;
  vocabContextMenu.classList.remove('hidden');
}

function isDue(word) {
  if (!word || !word.nextReviewTime) {
    return true;
  }
  return new Date() >= new Date(word.nextReviewTime);
}

function matchesFilter(word) {
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
    case 'all':
    default:
      return true;
  }
}

function getVisibleWords(searchText = dom.searchInput.value) {
  const normalized = (searchText || '').trim().toLowerCase();
  return words
    .map((w, i) => ({ ...w, index: i }))
    .filter(item => {
      if (!matchesFilter(item)) {
        return false;
      }
      if (!normalized) {
        return true;
      }
      return item.term.toLowerCase().includes(normalized) || item.translation.toLowerCase().includes(normalized);
    });
}

function getFlashCandidateIndices(searchText = dom.searchInput.value) {
  return getVisibleWords(searchText).map(item => item.index);
}

function updateFilterUi() {
  if (!dom.filterBar) return;
  dom.filterBar.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === activeFilter);
  });
}

function applyFilter(nextFilter) {
  activeFilter = nextFilter || 'all';
  updateFilterUi();
  updateVocabList(dom.searchInput.value);

  if (dom.flashSection.classList.contains('active')) {
    startFlashSession();
  }
}

function rebuildDueQueue() {
  dueIndices = getFlashCandidateIndices()
    .map((index) => ({ word: words[index], index }))
    .filter(item => isDue(item.word))
    .map(item => item.index);

  const matchedCursor = dueIndices.indexOf(currentIndex);
  dueCursor = matchedCursor >= 0 ? matchedCursor : 0;
}

function setFlashControlsDisabled(disabled) {
  dom.prevCard.disabled = disabled;
  dom.flipCard.disabled = disabled;
  dom.nextCard.disabled = disabled;
  dom.hardReview.disabled = disabled;
  dom.easyReview.disabled = disabled;
}

function canCountFlashInteraction() {
  const candidateIndices = getCurrentFlashIndices();
  if (!words.length || candidateIndices.length === 0) {
    return false;
  }

  if (!dailySessionActive && !manualSelection && dueIndices.length === 0) {
    return false;
  }

  return candidateIndices.includes(currentIndex);
}

function isTypingTarget(target) {
  if (!target) {
    return false;
  }

  const tagName = target.tagName?.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
}

function isFlashModeActive() {
  return dom.flashSection.classList.contains('active');
}

function updateQuizMaskState() {
  const isQuizActive = dom.spellSection.classList.contains('active');
  dom.vocabList.classList.toggle('quiz-masked', isQuizActive);
}

function getCurrentFlashIndices() {
  if (dailySessionActive && dailySessionIndices.length) {
    return dailySessionIndices;
  }
  return getFlashCandidateIndices();
}

function syncDailySessionPointer() {
  if (!dailySessionActive) return;
  const pointer = dailySessionIndices.indexOf(currentIndex);
  if (pointer >= 0) {
    dailySessionPointer = pointer;
  }
}

function updateDailySessionUi() {
  if (!dailySessionActive || !dailySessionIndices.length) {
    dom.dailySessionBanner.classList.add('hidden');
    return;
  }

  dom.dailySessionBanner.classList.remove('hidden');
  const currentCard = Math.min(dailySessionPointer + 1, dailySessionIndices.length);
  dom.dailySessionProgressText.textContent = `Card ${currentCard} / ${dailySessionIndices.length}`;
  const progressPercent = (currentCard / dailySessionIndices.length) * 100;
  dom.dailySessionProgressBar.style.width = `${Math.max(0, Math.min(100, progressPercent))}%`;
}

function getPriorityQueueIndices() {
  const due = [];
  const difficult = [];
  const fresh = [];
  const remaining = [];

  words.forEach((word, index) => {
    if (isDue(word)) {
      due.push(index);
    } else if ((word.difficultyScore || 0) >= DIFFICULTY_HIGH_THRESHOLD) {
      difficult.push(index);
    } else if (!word.lastReviewedTime) {
      fresh.push(index);
    } else {
      remaining.push(index);
    }
  });

  const queue = [];
  const seen = new Set();
  const pushUnique = (indices) => {
    indices.forEach((idx) => {
      if (!seen.has(idx)) {
        seen.add(idx);
        queue.push(idx);
      }
    });
  };

  pushUnique(due);
  pushUnique(difficult);
  pushUnique(fresh);

  const totalWords = words.length;
  const minTarget = Math.min(20, totalWords);
  const maxTarget = Math.min(40, totalWords);
  const preferredTarget = Math.min(30, maxTarget);

  if (queue.length < minTarget) {
    pushUnique(remaining);
  }

  const targetSize = queue.length >= preferredTarget ? preferredTarget : Math.max(minTarget, queue.length);
  return queue.slice(0, Math.min(maxTarget, targetSize));
}

function completeDailyStudySession() {
  dailySessionActive = false;
  dom.dailySessionBanner.classList.add('hidden');

  const reviewed = dailySessionReviewedSet.size;
  const mastered = Array.from(dailySessionReviewedSet)
    .map((index) => words[index])
    .filter((word) => word && (word.reviewLevel || 1) >= 5)
    .length;
  const attempts = dailySessionEasyCount + dailySessionHardCount;
  const accuracy = attempts > 0 ? Math.round((dailySessionEasyCount / attempts) * 100) : null;

  dom.dailySessionSummary.innerHTML = `
    Words reviewed today: <strong>${reviewed}</strong><br>
    Words mastered: <strong>${mastered}</strong>${accuracy !== null ? `<br>Accuracy rate: <strong>${accuracy}%</strong>` : ''}
  `;
  dom.dailySessionComplete.classList.remove('hidden');

  dailySessionIndices = [];
  dailySessionPointer = 0;
  fetchProgressHeader();

  clearDailySessionExitTimer();
  dailySessionExitTimer = setTimeout(() => {
    dom.dailySessionComplete.classList.add('hidden');
    dailySessionReviewedSet = new Set();
    dailySessionEasyCount = 0;
    dailySessionHardCount = 0;
    manualSelection = false;
    showBack = false;
    if (dom.flashSection.classList.contains('active')) {
      startFlashSession();
    }
    clearDailySessionExitTimer();
  }, 2400);
}

function markDailySessionViewed() {
  if (!dailySessionActive || !dailySessionIndices.length) {
    return;
  }

  if (!dailySessionIndices.includes(currentIndex)) {
    return;
  }

  dailySessionReviewedSet.add(currentIndex);

  if (dailySessionReviewedSet.size >= dailySessionIndices.length) {
    completeDailyStudySession();
    return;
  }

  updateDailySessionUi();
}

function markDailySessionInteraction(outcome = 'interaction') {
  if (!dailySessionActive || !dailySessionIndices.length) {
    return;
  }

  if (!dailySessionIndices.includes(currentIndex)) {
    return;
  }

  dailySessionReviewedSet.add(currentIndex);
  if (outcome === 'easy') {
    dailySessionEasyCount++;
  } else if (outcome === 'hard') {
    dailySessionHardCount++;
  }
}

function startDailyStudySession() {
  if (!words.length) {
    alert('No words available for daily study. Add some words first.');
    return;
  }

  const queue = getPriorityQueueIndices();
  if (!queue.length) {
    alert('No suitable words found for today’s study session.');
    return;
  }

  switchTab(dom.tabFlash);

  clearDailySessionExitTimer();

  dailySessionActive = true;
  dailySessionIndices = queue;
  dailySessionPointer = 0;
  dailySessionReviewedSet = new Set();
  dailySessionEasyCount = 0;
  dailySessionHardCount = 0;
  currentIndex = dailySessionIndices[0];
  showBack = false;
  manualSelection = true;

  activeFilter = 'all';
  updateFilterUi();
  dom.searchInput.value = '';
  dom.dailySessionComplete.classList.add('hidden');
  updateVocabList('');
  updateDailySessionUi();
  renderCard();
}

function startFlashSession() {
  if (dailySessionActive && dailySessionIndices.length) {
    syncDailySessionPointer();
    updateDailySessionUi();
    updateVocabList(dom.searchInput.value);
    renderCard();
    return;
  }

  dom.dailySessionBanner.classList.add('hidden');
  dom.dailySessionComplete.classList.add('hidden');
  manualSelection = false;
  showBack = false;
  rebuildDueQueue();
  const candidateIndices = getFlashCandidateIndices();

  if (dueIndices.length > 0) {
    dueCursor = 0;
    currentIndex = dueIndices[dueCursor];
  } else if (candidateIndices.length > 0) {
    currentIndex = candidateIndices[0];
  } else {
    currentIndex = 0;
  }

  updateVocabList(dom.searchInput.value);
  renderCard();
}

function updateSpellPrompt() {
  if (!words.length) {
    dom.spellPrompt.textContent = 'No words yet.';
    return;
  }
  dom.spellPrompt.textContent = words[spellCurrentIndex].translation;
}

function switchTab(tab) {
  const tabs = [dom.tabAdd, dom.tabFlash, dom.tabSpell, dom.tabStats];
  const sections = [dom.addSection, dom.flashSection, dom.spellSection, dom.statsSection];

  if (tab !== dom.tabFlash) {
    clearDailySessionExitTimer();
  }

  tabs.forEach((btn, i) => {
    if (btn === tab) {
      btn.classList.add('active');
      sections[i].classList.add('active');
    } else {
      btn.classList.remove('active');
      sections[i].classList.remove('active');
    }
  });

  updateQuizMaskState();
}

function updateSelectUi() {
  dom.toggleSelectBtn.textContent = selectionMode ? 'Done' : 'Select';
  dom.selectActions.classList.toggle('hidden', !selectionMode);
  dom.deleteSelectedBtn.textContent = `Delete Selected (${selectedWordIds.size})`;
  dom.deleteSelectedBtn.disabled = selectedWordIds.size === 0;
}

function setSelectionMode(enabled) {
  selectionMode = enabled;
  if (!selectionMode) {
    selectedWordIds = new Set();
    lastSelectedVisibleIndex = null;
  }
  hideVocabMenu();
  updateSelectUi();
  updateVocabList(dom.searchInput.value);
}

async function deleteSelectedWords() {
  if (!selectedWordIds.size) return;
  const confirmed = confirm(`Delete ${selectedWordIds.size} selected word(s)?`);
  if (!confirmed) return;

  const ids = Array.from(selectedWordIds);
  const results = await Promise.all(ids.map((id) => fetch(`/api/books/${bookId}/words/${id}`, {
    method: 'DELETE'
  })));

  if (results.some((res) => !res.ok)) {
    alert('Some words could not be deleted.');
  }

  selectedWordIds = new Set();
  lastSelectedVisibleIndex = null;
  await fetchWords();
  updateSelectUi();
}

function updateVocabList(filter='') {
  dom.vocabList.innerHTML = '';
  const visibleWords = getVisibleWords(filter);

  visibleWords.forEach((item, visibleIndex) => {
      const li = document.createElement('li');
      li.dataset.wordIndex = String(item.index);
      li.innerHTML = `<span>${item.term}</span><span>${item.translation}</span>`;
      
      const isFlashActive = dom.flashSection.classList.contains('active');
      const isSpellActive = dom.spellSection.classList.contains('active');
      
      if (!selectionMode && isFlashActive && item.index === currentIndex) {
        li.classList.add('active-item');
      } else if (!selectionMode && isSpellActive && item.index === spellCurrentIndex) {
        li.classList.add('active-item');
      }

      if (selectionMode && item.id && selectedWordIds.has(item.id)) {
        li.classList.add('selected-item');
      }

      if (!selectionMode) {
        const level = item.reviewLevel || 1;
        if (level <= 2) {
          li.classList.add('level-low');
        } else if (level <= 4) {
          li.classList.add('level-mid');
        } else {
          li.classList.add('level-high');
        }
      }
      
      li.addEventListener('click', (event) => {
        if (selectionMode) {
          if (!item.id) return;

          if (event.shiftKey) {
            const anchorIndex = lastSelectedVisibleIndex ?? getFirstSelectedVisibleIndex(visibleWords) ?? 0;
            const start = Math.min(anchorIndex, visibleIndex);
            const end = Math.max(anchorIndex, visibleIndex);
            for (let idx = start; idx <= end; idx++) {
              const word = visibleWords[idx];
              if (word && word.id) {
                selectedWordIds.add(word.id);
              }
            }
            lastSelectedVisibleIndex = anchorIndex;
          } else {
            if (selectedWordIds.has(item.id)) {
              selectedWordIds.delete(item.id);
            } else {
              selectedWordIds.add(item.id);
            }
            lastSelectedVisibleIndex = visibleIndex;
          }

          updateSelectUi();
          updateVocabList(dom.searchInput.value);
          return;
        }

        if (isSpellActive) {
          spellCurrentIndex = item.index;
          spellManualSelection = true;
          dom.spellInput.value = '';
          dom.spellFeedback.textContent = '';
          updateVocabList(dom.searchInput.value);
          renderSpellCard();
        } else {
          if (dailySessionActive && !dailySessionIndices.includes(item.index)) {
            return;
          }
          currentIndex = item.index;
          if (dailySessionActive) {
            syncDailySessionPointer();
            updateDailySessionUi();
          }
          manualSelection = true;
          showBack = false;
          rebuildDueQueue();
          updateVocabList(dom.searchInput.value);
          renderCard();
        }
      });

      li.addEventListener('contextmenu', async (event) => {
        if (selectionMode) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        const selectedWord = words[item.index];
        if (!selectedWord || !selectedWord.id) {
          return;
        }
        showVocabMenu(event.clientX, event.clientY, selectedWord);
      });
      dom.vocabList.appendChild(li);
    });

  keepActiveWordVisible();
}

function keepActiveWordVisible() {
  if (selectionMode) {
    return;
  }

  let activeIndex = null;
  if (dom.flashSection.classList.contains('active')) {
    activeIndex = currentIndex;
  } else if (dom.spellSection.classList.contains('active')) {
    activeIndex = spellCurrentIndex;
  }

  if (activeIndex === null || activeIndex === undefined) {
    return;
  }

  const activeItem = dom.vocabList.querySelector(`[data-word-index="${activeIndex}"]`);
  if (!activeItem) {
    return;
  }

  const listRect = dom.vocabList.getBoundingClientRect();
  const itemRect = activeItem.getBoundingClientRect();
  const isAbove = itemRect.top < listRect.top;
  const isBelow = itemRect.bottom > listRect.bottom;

  if (isAbove || isBelow) {
    activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

async function loadStats() {
  const resp = await fetch(`/api/books/${bookId}/words/stats/daily?days=7`);
  if (!resp.ok) {
    dom.statsHint.textContent = 'Unable to load statistics.';
    dom.statsPointDetail.classList.add('hidden');
    return;
  }

  const stats = await resp.json();
  renderStatsGraph(stats);

  if (!stats.length) {
    dom.statsHint.textContent = 'No statistics yet.';
    dom.statsPointDetail.classList.add('hidden');
    return;
  }
  dom.statsHint.textContent = 'Click a point to view the day’s exact values.';
}

function renderStatsGraph(stats) {
  const svg = dom.statsGraph;
  if (!svg) return;

  if (!stats || stats.length === 0) {
    svg.innerHTML = '';
    dom.statsPointDetail.classList.add('hidden');
    return;
  }

  const width = 760;
  const height = 280;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
  const padding = { top: 20, right: 20, bottom: 56, left: 52 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(1, ...stats.map((item) => Math.max(item.reviewedCount, item.addedCount)));
  const yTickCount = 4;
  const yStep = Math.ceil(maxValue / yTickCount);
  const yMax = Math.max(yStep * yTickCount, 1);
  const stepX = stats.length > 1 ? plotWidth / (stats.length - 1) : 0;

  const toX = (index) => padding.left + index * stepX;
  const toY = (value) => padding.top + plotHeight - (value / yMax) * plotHeight;

  const reviewedPoints = stats.map((item, index) => `${toX(index)},${toY(item.reviewedCount)}`).join(' ');
  const addedPoints = stats.map((item, index) => `${toX(index)},${toY(item.addedCount)}`).join(' ');

  const labelStep = Math.max(1, Math.ceil(stats.length / 7));
  const xLabels = stats.map((item, index) => {
    if (index % labelStep !== 0 && index !== stats.length - 1) {
      return '';
    }
    const label = item.date.slice(5);
    return `<text x="${toX(index)}" y="${height - 18}" text-anchor="middle" font-size="11" fill="#6b7280">${label}</text>`;
  }).join('');

  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => {
    const value = i * yStep;
    const y = toY(value);
    return `
      <line x1="${padding.left}" y1="${y}" x2="${padding.left + plotWidth}" y2="${y}" stroke="#e8ecfb" />
      <text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="#6b7280">${value}</text>
    `;
  }).join('');

  const reviewedDots = stats.map((item, index) => `
    <circle class="stats-dot" data-index="${index}" data-series="reviewed" cx="${toX(index)}" cy="${toY(item.reviewedCount)}" r="4.5" fill="#6f8dff" />
  `).join('');

  const addedDots = stats.map((item, index) => `
    <circle class="stats-dot" data-index="${index}" data-series="added" cx="${toX(index)}" cy="${toY(item.addedCount)}" r="4.5" fill="#6cc8a1" />
  `).join('');

  svg.innerHTML = `
    ${yTicks}
    <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + plotHeight}" stroke="#cfd8f7" />
    <line x1="${padding.left}" y1="${padding.top + plotHeight}" x2="${padding.left + plotWidth}" y2="${padding.top + plotHeight}" stroke="#cfd8f7" />
    <polyline fill="none" stroke="#6f8dff" stroke-width="3" points="${reviewedPoints}" />
    <polyline fill="none" stroke="#6cc8a1" stroke-width="3" points="${addedPoints}" />
    ${reviewedDots}
    ${addedDots}
    <text x="12" y="18" font-size="11" fill="#6b7280">Words</text>
    ${xLabels}
  `;

  svg.querySelectorAll('.stats-dot').forEach((dot) => {
    dot.addEventListener('click', (event) => {
      event.stopPropagation();
      const index = Number(dot.getAttribute('data-index'));
      const series = dot.getAttribute('data-series');
      const point = stats[index];
      if (!point) return;

      const cx = Number(dot.getAttribute('cx'));
      const cy = Number(dot.getAttribute('cy'));
      const value = series === 'added' ? point.addedCount : point.reviewedCount;
      const labelText = `${series === 'added' ? 'Added' : 'Reviewed'}: ${value}`;
      const labelX = Math.min(cx + 10, width - 120);
      const labelY = Math.max(cy - 12, 16);

      const previousLabel = svg.querySelector('.stats-point-label');
      if (previousLabel) {
        previousLabel.remove();
      }

      const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      labelGroup.setAttribute('class', 'stats-point-label');
      labelGroup.innerHTML = `
        <rect x="${labelX - 6}" y="${labelY - 12}" width="112" height="22" rx="7" fill="#ffffff" stroke="#dbe7ff" />
        <text x="${labelX}" y="${labelY + 3}">${labelText}</text>
      `;
      svg.appendChild(labelGroup);

      dom.statsPointDetail.innerHTML = `
        <strong>${point.date}</strong>
        <div>Words reviewed: ${point.reviewedCount}</div>
        <div>Words added: ${point.addedCount}</div>
      `;
      dom.statsPointDetail.classList.remove('hidden');
    });
  });

  svg.addEventListener('click', () => {
    const previousLabel = svg.querySelector('.stats-point-label');
    if (previousLabel) {
      previousLabel.remove();
    }
    dom.statsPointDetail.classList.add('hidden');
  });
}

function renderCard() {
  const candidateIndices = getCurrentFlashIndices();

  if (words.length === 0) {
    dom.flashTerm.textContent = '-';
    dom.flashTranslation.textContent = '-';
    dom.cardIndex.textContent = 'No words yet';
    setFlashControlsDisabled(true);
    return;
  }

  if (candidateIndices.length === 0) {
    dom.flashTerm.textContent = 'No words match this filter.';
    dom.flashTranslation.textContent = '-';
    dom.cardIndex.textContent = '0/0';
    dom.flashTranslation.classList.add('hidden');
    dom.flashTerm.classList.remove('hidden');
    setFlashControlsDisabled(true);
    return;
  }

  if (!candidateIndices.includes(currentIndex)) {
    currentIndex = candidateIndices[0];
  }

  if (!dailySessionActive && !manualSelection && dueIndices.length === 0) {
    dom.flashTerm.textContent = 'All words reviewed for now.';
    dom.flashTranslation.textContent = '-';
    dom.cardIndex.textContent = 'No due cards';
    dom.flashTranslation.classList.add('hidden');
    dom.flashTerm.classList.remove('hidden');
    setFlashControlsDisabled(true);
    return;
  }

  setFlashControlsDisabled(false);
  const w = words[currentIndex];
  const currentPosition = candidateIndices.indexOf(currentIndex);
  if (dailySessionActive && currentPosition >= 0) {
    dailySessionPointer = currentPosition;
    updateDailySessionUi();
    markDailySessionViewed();
  }
  dom.flashTerm.textContent = w.term;
  dom.flashTranslation.textContent = w.translation;
  dom.cardIndex.textContent = `${currentPosition + 1}/${candidateIndices.length}`;
  dom.flashTranslation.classList.toggle('hidden', !showBack);
  dom.flashTerm.classList.toggle('hidden', showBack);
}

function nextCard() {
  const candidateIndices = getCurrentFlashIndices();
  if (!candidateIndices.length) return;
  const currentPosition = candidateIndices.indexOf(currentIndex);
  const startPosition = currentPosition >= 0 ? currentPosition : 0;
  const nextPosition = (startPosition + 1) % candidateIndices.length;
  currentIndex = candidateIndices[nextPosition];
  manualSelection = true;

  showBack = false;
  rebuildDueQueue();
  updateVocabList(dom.searchInput.value);
  renderCard();
  updateSpellPrompt();
}

function prevCard() {
  const candidateIndices = getCurrentFlashIndices();
  if (!candidateIndices.length) return;
  const currentPosition = candidateIndices.indexOf(currentIndex);
  const startPosition = currentPosition >= 0 ? currentPosition : 0;
  const prevPosition = (startPosition - 1 + candidateIndices.length) % candidateIndices.length;
  currentIndex = candidateIndices[prevPosition];
  manualSelection = true;

  showBack = false;
  rebuildDueQueue();
  updateVocabList(dom.searchInput.value);
  renderCard();
}

function flipCard() {
  if (!canCountFlashInteraction()) {
    return;
  }
  showBack = !showBack;
  recordProgressActivity('reviewed', 1, words[currentIndex]?.id ?? null);
  markDailySessionInteraction('interaction');
  renderCard();
}

async function fetchBook() {
  const resp = await fetch(`/api/books/${bookId}`);
  if (!resp.ok) return;
  const book = await resp.json();
  dom.bookTitle.textContent = book.title;
}

async function fetchWords() {
  const resp = await fetch(`/api/books/${bookId}/words`);
  words = await resp.json();

  const availableIds = new Set(words.filter((word) => word.id).map((word) => word.id));
  selectedWordIds = new Set(Array.from(selectedWordIds).filter((id) => availableIds.has(id)));

  if (currentIndex >= words.length) {
    currentIndex = 0;
  }
  if (spellCurrentIndex >= words.length) {
    spellCurrentIndex = 0;
  }

  if (dailySessionActive) {
    dailySessionIndices = dailySessionIndices.filter((idx) => idx >= 0 && idx < words.length);
    if (!dailySessionIndices.length) {
      dailySessionActive = false;
      dom.dailySessionBanner.classList.add('hidden');
    } else if (!dailySessionIndices.includes(currentIndex)) {
      currentIndex = dailySessionIndices[0];
      dailySessionPointer = 0;
    }
  }

  rebuildDueQueue();
  updateVocabList(dom.searchInput.value);
  renderCard();
  updateSpellPrompt();
  updateSelectUi();
}

async function submitReview(result, options = {}) {
  if (!words.length) {
    return null;
  }

  const targetWordId = options.targetWordId || words[currentIndex]?.id;
  if (!targetWordId) {
    return null;
  }

  const resp = await fetch(`/api/books/${bookId}/words/${targetWordId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result })
  });

  if (!resp.ok) {
    alert('Review update failed');
    return null;
  }

  const updatedWord = await resp.json();
  markDailySessionInteraction(result === 'hard' ? 'hard' : 'easy');
  await fetchProgressHeader();

  if (options.refresh !== false) {
    await fetchWords();
  }

  if (options.restartFlash) {
    manualSelection = false;
    startFlashSession();
  }

  return updatedWord;
}

async function saveWords() {
  const raw = dom.wordInput.value.trim();
  if (!raw) {
    alert('Please enter at least one line');
    return;
  }

  const payload = [];
  raw.split('\n').forEach((line, i) => {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 2) {
      payload.push({ term: parts[0], translation: parts.slice(1).join(' ') });
    }
  });

  if (payload.length === 0) {
    alert('Wrong format; use "word translation" each line.');
    return;
  }

  const res = await fetch(`/api/books/${bookId}/words/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    alert('Save failed');
    return;
  }

  dom.wordInput.value = '';
  await fetchProgressHeader();
  await fetchWords();
  switchTab(dom.tabFlash);
}

async function checkSpell() {
  if (!words.length) return;
  const word = words[spellCurrentIndex];
  const target = word.term.trim().toLowerCase();
  const guess = dom.spellInput.value.trim().toLowerCase();
  
  if (!guess) {
    dom.spellFeedback.textContent = 'Please type the English word.';
    return;
  }

  if (guess === target) {
    dom.spellFeedback.textContent = 'Correct! 🎉';
    dom.spellInput.value = '';
    const previousLevel = word.reviewLevel || 1;
    const updatedWord = await submitReview('easy', {
      targetWordId: word.id,
      refresh: true,
      restartFlash: false
    });

    if (updatedWord && (updatedWord.reviewLevel || previousLevel) === previousLevel && previousLevel < 6) {
      dom.spellFeedback.textContent = 'Correct! 🎉 Daily level-up cap reached for this word.';
    }
  } else {
    dom.spellFeedback.textContent = `Wrong. Correct answer: ${word.term}`;
  }
}

function startSpellSession() {
  spellManualSelection = false;
  dom.spellInput.value = '';
  dom.spellFeedback.textContent = '';
  spellCurrentIndex = 0;
  renderSpellCard();
}

function renderSpellCard() {
  if (words.length === 0) {
    dom.spellPrompt.textContent = 'No words yet.';
    dom.spellIndex.textContent = '';
    dom.spellInput.disabled = true;
    dom.checkSpell.disabled = true;
    dom.prevSpell.disabled = true;
    dom.nextSpell.disabled = true;
    return;
  }

  dom.spellInput.disabled = false;
  dom.checkSpell.disabled = false;
  dom.prevSpell.disabled = false;
  dom.nextSpell.disabled = false;

  const word = words[spellCurrentIndex];
  dom.spellPrompt.textContent = word.translation;
  dom.spellIndex.textContent = `${spellCurrentIndex + 1}/${words.length}`;
  updateVocabList(dom.searchInput.value);
}

function nextSpell() {
  if (words.length === 0) return;
  spellCurrentIndex = (spellCurrentIndex + 1) % words.length;
  spellManualSelection = false;
  dom.spellInput.value = '';
  dom.spellFeedback.textContent = '';
  renderSpellCard();
}

function prevSpell() {
  if (words.length === 0) return;
  spellCurrentIndex = (spellCurrentIndex - 1 + words.length) % words.length;
  spellManualSelection = false;
  dom.spellInput.value = '';
  dom.spellFeedback.textContent = '';
  renderSpellCard();
}

if (bookId) {
  dom.tabAdd.addEventListener('click', () => switchTab(dom.tabAdd));
  dom.tabFlash.addEventListener('click', () => {
    switchTab(dom.tabFlash);
    startFlashSession();
  });
  dom.tabSpell.addEventListener('click', () => {
    switchTab(dom.tabSpell);
    startSpellSession();
  });
  dom.tabStats.addEventListener('click', async () => {
    switchTab(dom.tabStats);
    await loadStats();
  });
  dom.startDailyStudyBtn?.addEventListener('click', startDailyStudySession);
  dom.saveWordsBtn.addEventListener('click', saveWords);
  dom.toggleSelectBtn.addEventListener('click', () => setSelectionMode(!selectionMode));
  dom.deleteSelectedBtn.addEventListener('click', deleteSelectedWords);
  dom.searchInput.addEventListener('input', (e) => {
    updateVocabList(e.target.value);
    if (dom.flashSection.classList.contains('active')) {
      startFlashSession();
    }
  });
  dom.filterBar?.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });
  dom.nextCard.addEventListener('click', nextCard);
  dom.prevCard.addEventListener('click', prevCard);
  dom.flipCard.addEventListener('click', flipCard);
  dom.easyReview.addEventListener('click', () => submitReview('easy', { restartFlash: false }));
  dom.hardReview.addEventListener('click', () => submitReview('hard', { restartFlash: false }));
  dom.nextSpell.addEventListener('click', nextSpell);
  dom.prevSpell.addEventListener('click', prevSpell);
  dom.checkSpell.addEventListener('click', checkSpell);
  dom.spellInput.addEventListener('keydown', (event) => {
    if (!dom.spellSection.classList.contains('active')) {
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      nextSpell();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      event.stopPropagation();
      prevSpell();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      checkSpell();
    }
  });
  dom.flashcard.addEventListener('click', flipCard);
  document.addEventListener('click', hideVocabMenu);
  document.addEventListener('contextmenu', (event) => {
    if (!event.target.closest('#vocabList') && !event.target.closest('.context-menu')) {
      hideVocabMenu();
    }
  });
  document.addEventListener('scroll', hideVocabMenu, true);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      hideVocabMenu();
      return;
    }

    if (dom.spellSection.classList.contains('active')) {
      if (event.target === dom.spellInput) {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextSpell();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevSpell();
        return;
      }
    }

    if (!isFlashModeActive() || isTypingTarget(event.target)) {
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault();
      flipCard();
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextCard();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prevCard();
      return;
    }

    if (event.key === 'e' || event.key === 'E') {
      event.preventDefault();
      submitReview('easy', { restartFlash: false });
      return;
    }

    if (event.key === 'h' || event.key === 'H') {
      event.preventDefault();
      submitReview('hard', { restartFlash: false });
    }
  });

  fetchBook();
  fetchProgressHeader();
  fetchWords();
  dom.dailySessionComplete.classList.add('hidden');
  updateFilterUi();
  updateQuizMaskState();
  updateSelectUi();
}
