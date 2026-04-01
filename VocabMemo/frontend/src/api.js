const BASE = '';

export async function fetchBooks() {
  const res = await fetch(`${BASE}/api/books`);
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}

export async function createBook(title) {
  const res = await fetch(`${BASE}/api/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create book');
  return res.json();
}

export async function getBook(bookId) {
  const res = await fetch(`${BASE}/api/books/${bookId}`);
  if (!res.ok) throw new Error('Failed to get book');
  return res.json();
}

export async function updateBook(bookId, title) {
  const res = await fetch(`${BASE}/api/books/${bookId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to update book');
  return res.json();
}

export async function deleteBook(bookId) {
  const res = await fetch(`${BASE}/api/books/${bookId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete book');
}

export async function fetchWords(bookId) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words/all`);
  if (!res.ok) throw new Error('Failed to fetch words');
  return res.json();
}

export async function fetchWordsPaged(bookId, page = 1, size = 20) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words?page=${page}&size=${size}`);
  if (!res.ok) throw new Error('Failed to fetch words');
  return res.json();
}

export async function saveWordsBatch(bookId, words) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(words),
  });
  if (!res.ok) throw new Error('Failed to save words');
  return res.json();
}

export async function updateWord(bookId, wordId, data) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words/${wordId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update word');
  return res.json();
}

export async function deleteWord(bookId, wordId) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words/${wordId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete word');
}

export async function reviewWord(bookId, wordId, result) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words/${wordId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result }),
  });
  if (!res.ok) throw new Error('Failed to review word');
  return res.json();
}

export async function fetchDailyStats(bookId, days = 7) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words/stats/daily?days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchProgress(bookId) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words/progress`);
  if (!res.ok) throw new Error('Failed to fetch progress');
  return res.json();
}

export async function recordActivity(bookId, type, amount = 1, wordId = null) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words/progress/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, amount, wordId }),
  });
  if (!res.ok) throw new Error('Failed to record activity');
  return res.json();
}
