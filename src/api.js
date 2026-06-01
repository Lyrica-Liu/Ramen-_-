const BASE = '';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

export async function fetchBooks() {
  const res = await fetch(`${BASE}/api/books`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}

export async function createBook(title) {
  const res = await fetch(`${BASE}/api/books`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create book');
  return res.json();
}

export async function getBook(bookId) {
  const res = await fetch(`${BASE}/api/books/${bookId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to get book');
  return res.json();
}

export async function updateBook(bookId, title) {
  const res = await fetch(`${BASE}/api/books/${bookId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to update book');
  return res.json();
}

export async function deleteBook(bookId) {
  const res = await fetch(`${BASE}/api/books/${bookId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete book');
}

export async function fetchWords(bookId) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch words');
  return res.json();
}

export async function saveWordsBatch(bookId, words) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words/batch`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(words),
  });
  if (!res.ok) throw new Error('Failed to save words');
  return res.json();
}

export async function updateWord(bookId, wordId, data) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words/${wordId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update word');
  return res.json();
}

export async function deleteWord(bookId, wordId) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words/${wordId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete word');
}

export async function reviewWord(bookId, wordId, result) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words/${wordId}/review`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ result }),
  });
  if (!res.ok) throw new Error('Failed to review word');
  return res.json();
}

/* ── Dictionary search: returns { term, meanings: [{partOfSpeech, definition, example}] } ── */
export async function searchWordMeanings(bookId, term) {
  const res = await fetch(
    `${BASE}/api/books/${bookId}/words/search?term=${encodeURIComponent(term)}`,
    { headers: authHeaders() },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

/* ── Add word from dictionary with user-selected definitions ── */
export async function addWordFromSearch(bookId, searchTerm, selectedDefinitions) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words/from-search`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ searchTerm, selectedDefinitions }),
  });
  if (!res.ok) throw new Error('Failed to add word');
  return res.json();
}

export async function fetchProgress(bookId) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words/progress`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch progress');
  return res.json();
}

export async function recordActivity(bookId, type, amount = 1, wordId = null) {
  const res = await fetch(`${BASE}/api/books/${bookId}/words/progress/activity`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ type, amount, wordId }),
  });
  if (!res.ok) throw new Error('Failed to record activity');
  return res.json();
}
