import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import * as api from '../api';
import ContextMenu from '../components/ContextMenu';
import { useAuth } from '../context/AuthContext';

const Page = styled.div`
  min-height: 100vh;
  padding: 40px 36px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 36px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${p => p.theme.text};
  letter-spacing: -0.03em;
`;

const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const EmailLabel = styled.span`
  font-size: 0.87rem;
  color: ${p => p.theme.textSecondary};
`;

const LogoutBtn = styled.button`
  padding: 7px 18px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 999px;
  background: transparent;
  color: ${p => p.theme.textSecondary};
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.13s;

  &:hover {
    background: ${p => p.theme.btnHover};
    color: ${p => p.theme.text};
    border-color: ${p => p.theme.borderStrong};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 18px;
  margin-bottom: 28px;
`;

const BookCard = styled.div`
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 22px 20px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: ${p => p.theme.shadow};

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${p => p.theme.shadowLg};
    border-color: ${p => p.theme.borderStrong};
  }

  h3 {
    font-size: 1rem;
    font-weight: 700;
    color: ${p => p.theme.text};
    margin-bottom: 6px;
    word-break: break-word;
    line-height: 1.4;
  }

  p {
    font-size: 0.78rem;
    color: ${p => p.theme.muted};
  }
`;

const CreateBtn = styled.button`
  background: linear-gradient(135deg, ${p => p.theme.primary} 0%, ${p => p.theme.primaryStrong} 100%);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 13px 30px;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.15s;
  box-shadow: ${p => p.theme.shadowPrimary};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(139, 92, 246, 0.38);
  }

  &:active { transform: translateY(0); }
`;

export default function Bookshelf() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [ctx, setCtx] = useState(null);

  const loadBooks = useCallback(async () => {
    try { setBooks(await api.fetchBooks()); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  useEffect(() => {
    const close = () => setCtx(null);
    const onKey = e => { if (e.key === 'Escape') close(); };
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
    const title = prompt('New vocabulary book name:');
    if (!title?.trim()) return;
    try { await api.createBook(title.trim()); await loadBooks(); }
    catch { alert('Failed to create book.'); }
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
    const t = prompt('New name:', book.title);
    if (!t?.trim()) return;
    try { await api.updateBook(book.id, t.trim()); await loadBooks(); }
    catch { alert('Failed to rename.'); }
  };

  const handleDelete = async () => {
    if (!ctx) return;
    const { book } = ctx;
    setCtx(null);
    if (!confirm(`Delete "${book.title}"?`)) return;
    try { await api.deleteBook(book.id); await loadBooks(); }
    catch { alert('Failed to delete.'); }
  };

  return (
    <Page>
      <Header>
        <Title>My Vocab Books</Title>
        <UserRow>
          <EmailLabel>{auth?.email}</EmailLabel>
          <LogoutBtn onClick={() => { logout(); navigate('/login'); }}>Sign Out</LogoutBtn>
        </UserRow>
      </Header>

      <Grid>
        {books.map(book => (
          <BookCard
            key={book.id}
            onClick={() => navigate(`/book/${book.id}`, { state: { title: book.title } })}
            onContextMenu={e => handleContextMenu(e, book)}
          >
            <h3>{book.title}</h3>
            <p>Tap to study</p>
          </BookCard>
        ))}
      </Grid>

      <CreateBtn onClick={handleCreate}>+ New Book</CreateBtn>

      {ctx && (
        <ContextMenu
          x={ctx.x}
          y={ctx.y}
          items={[
            { label: 'Rename', onClick: handleRename },
            { label: 'Delete', onClick: handleDelete, danger: true },
          ]}
          onClose={() => setCtx(null)}
        />
      )}
    </Page>
  );
}
