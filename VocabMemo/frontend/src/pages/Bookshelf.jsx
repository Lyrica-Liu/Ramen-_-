import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import * as api from '../api';
import ContextMenu from '../components/ContextMenu';

/* ─── styled ─── */

const Container = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 48px 32px;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  margin-bottom: 32px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 22px;
  margin-bottom: 32px;
`;

const BookCard = styled.div`
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 28px 22px;
  cursor: pointer;
  transition: transform 0.12s, box-shadow 0.12s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${p => p.theme.text};
    margin-bottom: 6px;
    word-break: break-word;
  }

  p {
    font-size: 0.85rem;
    color: ${p => p.theme.muted};
  }
`;

const CreateBtn = styled.button`
  background: ${p => p.theme.primary};
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radius};
  padding: 14px 32px;
  font-weight: 600;
  font-size: 1rem;
  transition: background 0.15s, transform 0.1s;

  &:hover {
    background: ${p => p.theme.primaryStrong};
    transform: translateY(-1px);
  }
`;

const Guide = styled.div`
  margin-top: 40px;
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 26px 28px;
  line-height: 1.8;

  h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 10px;
  }

  ul {
    padding-left: 22px;
  }

  li {
    color: ${p => p.theme.textSecondary};
    font-size: 0.95rem;
  }
`;

/* ─── component ─── */

export default function Bookshelf() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [ctx, setCtx] = useState(null);

  const loadBooks = useCallback(async () => {
    try {
      setBooks(await api.fetchBooks());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  /* dismiss context menu on click / escape / scroll */
  useEffect(() => {
    const close = () => setCtx(null);
    const onKey = e => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('scroll', close, true);
    };
  }, []);

  const handleCreate = async () => {
    const title = prompt('Enter new vocabulary book title:');
    if (!title?.trim()) return;
    try {
      await api.createBook(title.trim());
      await loadBooks();
    } catch {
      alert('Failed to create book.');
    }
  };

  const handleContextMenu = (e, book) => {
    e.preventDefault();
    e.stopPropagation();
    setCtx({ x: e.clientX, y: e.clientY, book });
  };

  const handleRename = async () => {
    if (!ctx) return;
    const { book } = ctx;
    setCtx(null);
    const newTitle = prompt('Enter new book name:', book.title);
    if (!newTitle?.trim()) return;
    try {
      await api.updateBook(book.id, newTitle.trim());
      await loadBooks();
    } catch {
      alert('Failed to rename book.');
    }
  };

  const handleDelete = async () => {
    if (!ctx) return;
    const { book } = ctx;
    setCtx(null);
    if (!confirm(`Delete book "${book.title}"?`)) return;
    try {
      await api.deleteBook(book.id);
      await loadBooks();
    } catch {
      alert('Failed to delete book.');
    }
  };

  return (
    <Container>
      <Title>Vocabulary Bookshelf</Title>

      <Grid>
        {books.map(book => (
          <BookCard
            key={book.id}
            onClick={() => navigate(`/book/${book.id}`)}
            onContextMenu={e => handleContextMenu(e, book)}
          >
            <h3>{book.title}</h3>
            <p>ID: {book.id}</p>
          </BookCard>
        ))}
      </Grid>

      <CreateBtn onClick={handleCreate}>+ New Book</CreateBtn>

      <Guide>
        <h3>Quick Start Guide</h3>
        <ul>
          <li>
            Click <strong>+ New Book</strong> to create a vocabulary book
          </li>
          <li>Click a book card to open it and start studying</li>
          <li>Right-click a book to rename or delete it</li>
        </ul>
      </Guide>

      {ctx && (
        <ContextMenu
          x={ctx.x}
          y={ctx.y}
          items={[
            { label: 'Rename Book', onClick: handleRename },
            { label: 'Delete Book', onClick: handleDelete, danger: true },
          ]}
          onClose={() => setCtx(null)}
        />
      )}
    </Container>
  );
}
