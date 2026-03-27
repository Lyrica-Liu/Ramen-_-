const bookContextMenu = document.createElement('div');
bookContextMenu.className = 'context-menu hidden';
document.body.appendChild(bookContextMenu);

bookContextMenu.addEventListener('click', (event) => {
  event.stopPropagation();
});

bookContextMenu.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  event.stopPropagation();
});

function hideBookMenu() {
  bookContextMenu.classList.add('hidden');
  bookContextMenu.innerHTML = '';
}

function showBookMenu(x, y, book) {
  bookContextMenu.innerHTML = '';

  const renameBtn = document.createElement('button');
  renameBtn.textContent = 'Rename Book';
  renameBtn.addEventListener('click', async () => {
    hideBookMenu();
    const newTitle = prompt('Enter new book name:', book.title);
    if (!newTitle || !newTitle.trim()) return;

    const updateRes = await fetch(`/api/books/${book.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim() })
    });

    if (!updateRes.ok) {
      alert('Failed to rename book.');
      return;
    }
    await loadBooks();
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete Book';
  deleteBtn.className = 'danger';
  deleteBtn.addEventListener('click', async () => {
    hideBookMenu();
    const confirmed = confirm(`Delete book "${book.title}"?`);
    if (!confirmed) return;

    const deleteRes = await fetch(`/api/books/${book.id}`, { method: 'DELETE' });
    if (!deleteRes.ok) {
      alert('Failed to delete book.');
      return;
    }
    await loadBooks();
  });

  bookContextMenu.appendChild(renameBtn);
  bookContextMenu.appendChild(deleteBtn);

  bookContextMenu.classList.remove('hidden');
  const menuWidth = bookContextMenu.offsetWidth || 180;
  const menuHeight = bookContextMenu.offsetHeight || 100;
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 8);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 8);
  bookContextMenu.style.left = `${Math.max(8, clampedX)}px`;
  bookContextMenu.style.top = `${Math.max(8, clampedY)}px`;
  bookContextMenu.classList.remove('hidden');
}

async function loadBooks() {
  const res = await fetch('/api/books');
  const books = await res.json();
  const grid = document.getElementById('bookGrid');
  grid.innerHTML = '';

  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `<h3>${book.title}</h3><p>ID: ${book.id}</p>`;
    card.addEventListener('click', () => window.location.href = `/book/${book.id}`);
    card.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      showBookMenu(event.clientX, event.clientY, book);
    });
    grid.appendChild(card);
  });
}

async function createBook() {
  const title = prompt('Enter new vocabulary book title:');
  if (!title || !title.trim()) return;

  await fetch('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title.trim() })
  });

  await loadBooks();
}

document.getElementById('createBookBtn').addEventListener('click', createBook);
document.addEventListener('click', hideBookMenu);
document.addEventListener('contextmenu', (event) => {
  if (!event.target.closest('.book-card') && !event.target.closest('.context-menu')) {
    hideBookMenu();
  }
});
document.addEventListener('scroll', hideBookMenu, true);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    hideBookMenu();
  }
});
loadBooks();
