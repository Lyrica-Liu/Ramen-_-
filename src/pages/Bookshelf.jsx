import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import * as api from '../api';
import ContextMenu from '../components/ContextMenu';
import { useAuth } from '../context/AuthContext';

/* ─── word wall ─── */
const VOCAB_ROWS = [
  ['serendipity', 'ephemeral', 'perspicacious', 'loquacious', 'melancholy', 'sycophant', 'ineffable', 'recalcitrant', 'ubiquitous'],
  ['pulchritudinous', 'magnanimous', 'obsequious', 'perfidious', 'verisimilitude', 'sesquipedalian', 'mnemonic', 'quixotic', 'laconic'],
  ['ostensible', 'pernicious', 'sanguine', 'tenacious', 'vicarious', 'capricious', 'fastidious', 'garrulous', 'hegemony'],
  ['insipid', 'juxtapose', 'lugubrious', 'machiavellian', 'nonchalant', 'obfuscate', 'panacea', 'querulous', 'solipsism'],
  ['abdicate', 'bellicose', 'circumlocution', 'discombobulate', 'equivocate', 'facetious', 'grandiloquent', 'harbinger', 'inimical'],
];

/* ─── book palette ─── */
const BOOK_COLORS = [
  { bg: '#ECC8C0', spine: '#D8B0A8', text: '#5C2828' },
  { bg: '#E2D4C4', spine: '#CEBEAA', text: '#3C3020' },
  { bg: '#C8D8CC', spine: '#B0C8B4', text: '#1E3428' },
  { bg: '#D8C8DC', spine: '#C4B0CC', text: '#38244A' },
  { bg: '#EEDCBC', spine: '#DEC898', text: '#5A3A14' },
  { bg: '#DCCACC', spine: '#C8B4B8', text: '#462830' },
  { bg: '#C4CCD8', spine: '#B0BCCC', text: '#2A3040' },
  { bg: '#CAD8C8', spine: '#B4C8B0', text: '#243820' },
  { bg: '#E8D8C0', spine: '#D8C4A0', text: '#503C18' },
  { bg: '#E0C8D0', spine: '#CCAAB8', text: '#4A2438' },
  { bg: '#C8CED8', spine: '#B4BCCC', text: '#2A3448' },
  { bg: '#D8D0C4', spine: '#C4BCAC', text: '#3A3428' },
];
const BOOK_HEIGHTS = [186, 204, 172, 218, 192, 208, 174, 222, 196, 180, 210, 168];

function getBookColors(id) { return BOOK_COLORS[id % BOOK_COLORS.length]; }
function getBookHeight(id) { return BOOK_HEIGHTS[id % BOOK_HEIGHTS.length]; }

/* ─── keyframes ─── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const scrollLeft = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;
const scrollRight = keyframes`
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
`;

/* ─── shared background (top-left wavy rose) ─── */
const WAVE_BG = `
  radial-gradient(ellipse 210% 58% at -18% -2%,  rgba(196,132,138,0.30) 0%, transparent 60%),
  radial-gradient(ellipse 175% 46% at -10% 18%,  rgba(208,145,142,0.20) 0%, transparent 56%),
  radial-gradient(ellipse 140% 36% at  -3% 35%,  rgba(218,163,155,0.14) 0%, transparent 52%),
  radial-gradient(ellipse 108% 28% at   4% 50%,  rgba(226,177,168,0.09) 0%, transparent 50%),
  linear-gradient(162deg, #FAF0E8 0%, #F5E8D4 58%, #F2E0C8 100%)
`;

/* ─── page ─── */
const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  background: ${WAVE_BG};
`;

/* ─── integrated pill header ─── */
const TopBarArea = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 24px 28px 0;
  animation: ${fadeUp} 0.4s ease both;
  flex-shrink: 0;
`;

const TopPill = styled.div`
  display: inline-flex;
  align-items: center;
  background: rgba(253, 248, 244, 0.70);
  backdrop-filter: blur(22px) saturate(1.4);
  -webkit-backdrop-filter: blur(22px) saturate(1.4);
  border: 1px solid rgba(255, 250, 247, 0.88);
  border-radius: 999px;
  padding: 5px 6px;
  box-shadow:
    0 4px 28px rgba(160, 80, 80, 0.10),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  gap: 0;
`;

const PillSection = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 3px;
`;

const PillSep = styled.div`
  width: 1px;
  height: 20px;
  background: rgba(196, 132, 138, 0.22);
  flex-shrink: 0;
`;

const PillTitle = styled.div`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.22rem;
  font-weight: 400;
  font-style: italic;
  letter-spacing: -0.01em;
  background: linear-gradient(135deg, #3A2020 0%, #8C4848 55%, #C4848A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  user-select: none;
  white-space: nowrap;
  padding-right: 2px;
`;

const PillEmoji = styled.span`
  font-size: 1.15rem;
  margin-left: -5px;
  position: relative;
  top: 1px;
`;

const PillNavBtn = styled.button`
  padding: 7px 13px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  border: none;
  white-space: nowrap;
  transition: all 0.14s ease;
  background: ${p => p.$active ? 'rgba(196, 132, 138, 0.14)' : 'transparent'};
  color: ${p => p.$active ? p.theme.primary : p.theme.textSecondary};

  &:hover {
    background: rgba(196, 132, 138, 0.10);
    color: ${p => p.theme.primary};
  }
`;

const PillEmail = styled.span`
  font-size: 0.74rem;
  color: ${p => p.theme.textSecondary};
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PillSignOut = styled.button`
  padding: 7px 13px;
  border-radius: 999px;
  background: rgba(196, 132, 138, 0.08);
  border: 1px solid rgba(196, 132, 138, 0.18);
  color: ${p => p.theme.textSecondary};
  font-size: 0.76rem;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.14s;

  &:hover {
    background: rgba(196, 132, 138, 0.16);
    border-color: rgba(196, 132, 138, 0.34);
    color: ${p => p.theme.text};
  }
`;

/* ─── hero ─── */
const ContentBody = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 24px 48px;
  animation: ${fadeUp} 0.5s 0.07s ease both;
  overflow: hidden;
`;

const WordWall = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  overflow: hidden;
  pointer-events: none;
`;

const WordRow = styled.div`
  display: flex;
  white-space: nowrap;
  animation: ${p => p.$dir === 'left' ? scrollLeft : scrollRight} ${p => p.$speed}s linear infinite;
  will-change: transform;
`;

const WordItem = styled.span`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 700;
  font-style: italic;
  color: #3A2828;
  opacity: 0.095;
  padding: 2px 12px;
  letter-spacing: 0.01em;
  user-select: none;
`;

const ContentFade = styled.div`
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 110px;
  background: linear-gradient(transparent, rgba(248, 238, 228, 0.60));
  pointer-events: none;
  z-index: 0;
`;

const TaglineWrapper = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
`;

const Tagline = styled.h1`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(3rem, 7.5vw, 5.4rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.12;
  color: #9A7070;
  margin: 0;
`;

const HighlightWord = styled.span`
  font-weight: 900;
  font-style: italic;
  color: #7A3A3A;
  background: linear-gradient(transparent 48%, rgba(196, 132, 138, 0.30) 48%);
  padding: 0 4px;
`;

const TaglineSub = styled.p`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 0.95rem;
  font-style: italic;
  color: #B89090;
  margin: 16px 0 0;
  letter-spacing: 0.02em;
`;

/* ─── shelf ─── */
const ShelfSection = styled.div`
  width: 100%;
  max-width: 980px;
  padding: 0 28px;
  animation: ${fadeUp} 0.55s 0.14s ease both;
`;

const LibraryLabel = styled.div`
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: rgba(196, 132, 138, 0.42);
  padding: 0 6px 10px;
`;

const ShelfWrapper = styled.div`
  background: linear-gradient(
    175deg,
    rgba(255, 253, 251, 0.72) 0%,
    rgba(250, 243, 238, 0.60) 100%
  );
  backdrop-filter: blur(36px) saturate(1.5);
  -webkit-backdrop-filter: blur(36px) saturate(1.5);
  border-radius: 28px 28px 0 0;
  border: 1px solid rgba(255, 250, 247, 0.90);
  border-bottom: none;
  padding: 36px 40px 0;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.95),
    0 16px 56px rgba(160, 80, 80, 0.08),
    0 6px 20px rgba(0, 0, 0, 0.05);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 60px;
    background: linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 100%);
    border-radius: 28px 28px 0 0;
    pointer-events: none;
  }
`;

const BooksRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  min-height: 252px;
  padding: 0 2px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const ShelfPlank = styled.div`
  height: 18px;
  margin: 0 -40px;
  background: linear-gradient(
    180deg,
    rgba(255, 253, 251, 1) 0%,
    rgba(236, 218, 208, 0.90) 100%
  );
  border-top: 1.5px solid rgba(255, 255, 255, 1);
  box-shadow:
    0 12px 36px rgba(160, 80, 80, 0.10),
    0 5px 14px rgba(0, 0, 0, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
`;

/* ─── book ─── */
const BookSpineWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;

  &:hover .spine {
    transform: translateY(-10px);
    filter: brightness(1.03);
    box-shadow:
      0 14px 24px rgba(0, 0, 0, 0.13),
      0 4px 10px rgba(0, 0, 0, 0.07),
      inset 1px 0 0 rgba(255, 255, 255, 0.72),
      inset 0 1px 0 rgba(255, 255, 255, 0.50);
  }
`;

const BookSpine = styled.div.attrs({ className: 'spine' })`
  width: 58px;
  height: ${p => p.$height}px;
  background: linear-gradient(
    90deg,
    ${p => p.$colors.spine}BB 0px,
    ${p => p.$colors.spine}EE 5px,
    ${p => p.$colors.bg}F8 9px,
    ${p => p.$colors.bg} 48%,
    ${p => p.$colors.bg}F2 86%,
    ${p => p.$colors.spine}99 100%
  );
  border-radius: 5px 5px 0 0;
  position: relative;
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.28s ease,
              filter 0.28s ease;
  box-shadow:
    0 5px 20px rgba(0, 0, 0, 0.11),
    inset 1px 0 0 rgba(255, 255, 255, 0.68),
    inset -1px 0 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const BookShineTop = styled.div`
  position: absolute;
  top: 0; left: 9px; right: 11px;
  height: 45%;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.44) 0%,
    rgba(255,255,255,0.12) 55%,
    rgba(255,255,255,0.00) 100%
  );
  border-radius: 0 0 70% 70%;
  pointer-events: none;
`;

const BookShineMid = styled.div`
  position: absolute;
  top: 28%; bottom: 28%;
  left: 11px;
  width: 3px;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.00) 0%,
    rgba(255,255,255,0.32) 50%,
    rgba(255,255,255,0.00) 100%
  );
  border-radius: 2px;
  pointer-events: none;
`;

const BookEdgeGlow = styled.div`
  position: absolute;
  top: 8%; bottom: 8%;
  left: 5px;
  width: 1.5px;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.00) 0%,
    rgba(255,255,255,0.50) 40%,
    rgba(255,255,255,0.50) 60%,
    rgba(255,255,255,0.00) 100%
  );
  border-radius: 1px;
  pointer-events: none;
`;

const BookPages = styled.div`
  position: absolute;
  right: 0; top: 2px; bottom: 2px;
  width: 6px;
  background: repeating-linear-gradient(
    180deg,
    #FAF7F2 0px, #FAF7F2 1.5px,
    #EDE6DA 1.5px, #EDE6DA 2px
  );
  border-radius: 0 4px 0 0;
  opacity: 0.80;
  box-shadow: inset -1px 0 0 rgba(0,0,0,0.07);
`;

const SpineTitle = styled.span`
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-size: 0.67rem;
  font-weight: 800;
  color: ${p => p.$colors.text};
  text-align: center;
  max-height: 78%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.08em;
  padding: 0 8px;
  position: relative;
  z-index: 1;
  opacity: 0.82;
`;

const SpineCount = styled.span`
  position: absolute;
  bottom: 8px;
  left: 0; right: 7px;
  font-size: 0.52rem;
  font-weight: 700;
  color: ${p => p.$colors.text};
  opacity: 0.42;
  text-align: center;
  letter-spacing: 0.04em;
`;

/* ─── add-book slot ─── */
const AddBookSlot = styled.div`
  width: 52px;
  height: 178px;
  border-radius: 5px 5px 0 0;
  border: 1.5px dashed rgba(196, 132, 138, 0.26);
  background: rgba(196, 132, 138, 0.03);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  gap: 5px;
  transition: all 0.18s ease;
  color: rgba(196, 132, 138, 0.44);

  &:hover {
    border-color: rgba(196, 132, 138, 0.50);
    background: rgba(196, 132, 138, 0.07);
    color: rgba(196, 132, 138, 0.76);
  }
`;

const AddIcon = styled.div`
  font-size: 1.5rem;
  line-height: 1;
  font-weight: 300;
`;

const AddLabel = styled.div`
  font-size: 0.52rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

/* ─── component ─── */
const BOOKS_CACHE = 'rv_books_v1';

export default function Bookshelf() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [books, setBooks] = useState(() => {
    try { const c = localStorage.getItem(BOOKS_CACHE); return c ? JSON.parse(c) : []; } catch { return []; }
  });
  const [ctx, setCtx] = useState(null);

  const updateBooks = useCallback(updater => {
    setBooks(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem(BOOKS_CACHE, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const loadBooks = useCallback(async () => {
    try { updateBooks(await api.fetchBooks()); } catch (e) { console.error(e); }
  }, [updateBooks]);

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
    try {
      const newBook = await api.createBook(title.trim());
      updateBooks(prev => [...prev, newBook]);
    } catch { alert('Failed to create book.'); }
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
    try {
      const updated = await api.updateBook(book.id, t.trim());
      updateBooks(prev => prev.map(b => b.id === book.id ? updated : b));
    } catch { alert('Failed to rename.'); }
  };

  const handleDelete = async () => {
    if (!ctx) return;
    const { book } = ctx;
    setCtx(null);
    if (!confirm(`Delete "${book.title}"?`)) return;
    try {
      await api.deleteBook(book.id);
      updateBooks(prev => prev.filter(b => b.id !== book.id));
    } catch { alert('Failed to delete.'); }
  };

  return (
    <Page>
      <TopBarArea>
        <TopPill>
          <PillSection>
            <PillTitle>Ramen Vocab</PillTitle>
            <PillEmoji>🍜</PillEmoji>
          </PillSection>
          <PillSep />
          <PillSection>
            <PillNavBtn $active>Bookshelf</PillNavBtn>
            <PillNavBtn onClick={() => navigate('/statistics')}>Statistics</PillNavBtn>
          </PillSection>
          <PillSep />
          <PillSection>
            <PillEmail>{auth?.email}</PillEmail>
            <PillSignOut onClick={() => { logout(); navigate('/login'); }}>Sign Out</PillSignOut>
          </PillSection>
        </TopPill>
      </TopBarArea>

      <ContentBody>
        <WordWall aria-hidden="true">
          {VOCAB_ROWS.map((words, i) => {
            const doubled = [...words, ...words];
            return (
              <WordRow key={i} $dir={i % 2 === 0 ? 'left' : 'right'} $speed={20 + i * 5}>
                {doubled.map((w, j) => <WordItem key={j}>{w}</WordItem>)}
              </WordRow>
            );
          })}
        </WordWall>
        <ContentFade />
        <TaglineWrapper>
          <Tagline>
            Ready to <HighlightWord>grind</HighlightWord> some vocab?
          </Tagline>
          <TaglineSub>add words · study daily · grow your vocabulary</TaglineSub>
        </TaglineWrapper>
      </ContentBody>

      <ShelfSection>
        <LibraryLabel>Your Library</LibraryLabel>
        <ShelfWrapper>
          <BooksRow>
            {books.map(book => {
              const colors = getBookColors(book.id);
              const height = getBookHeight(book.id);
              return (
                <BookSpineWrapper
                  key={book.id}
                  onClick={() => navigate(`/book/${book.id}`, { state: { title: book.title } })}
                  onContextMenu={e => handleContextMenu(e, book)}
                  title={book.title}
                >
                  <BookSpine $colors={colors} $height={height}>
                    <BookShineTop />
                    <BookShineMid />
                    <BookEdgeGlow />
                    <SpineTitle $colors={colors}>{book.title}</SpineTitle>
                    {book.wordCount > 0 && <SpineCount $colors={colors}>{book.wordCount}</SpineCount>}
                    <BookPages />
                  </BookSpine>
                </BookSpineWrapper>
              );
            })}
            <AddBookSlot onClick={handleCreate}>
              <AddIcon>+</AddIcon>
              <AddLabel>New</AddLabel>
            </AddBookSlot>
          </BooksRow>
          <ShelfPlank />
        </ShelfWrapper>
      </ShelfSection>

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
