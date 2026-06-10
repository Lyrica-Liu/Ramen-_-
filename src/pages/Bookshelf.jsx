import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import bowlImg from '../assets/ramen-bowl.png';
import bgImg from '../assets/background.png';
import shelfBg from '../assets/bookshelf.png';
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
  ['magniloquent', 'perspicacity', 'lassitude', 'effulgent', 'defenestrate', 'obdurate', 'propitious', 'recondite', 'supercilious'],
  ['assuage', 'bombastic', 'cacophony', 'didactic', 'effervescent', 'fugacious', 'hubristic', 'impecunious', 'jejune'],
  ['mendacious', 'nihilistic', 'plethora', 'raconteur', 'soporific', 'truculent', 'umbrage', 'vociferous', 'winsome'],
  ['alacrity', 'brouhaha', 'cogitate', 'dilettante', 'enervate', 'fatuous', 'gainsay', 'halcyon', 'imbroglio'],
  ['jocular', 'kismet', 'limpid', 'mordant', 'nadir', 'opprobrious', 'pellucid', 'restive', 'sycophancy'],
];

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
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${WAVE_BG};
`;

/* ─── integrated pill header ─── */
const TopBarArea = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  padding: 20px 28px 0;
  pointer-events: none;
  animation: ${fadeUp} 0.4s ease both;
`;

const TopPill = styled.div`
  pointer-events: auto;
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
  cursor: pointer;
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
const HeroSection = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  flex-shrink: 0;
  background: url(${bgImg}) center/cover no-repeat;
`;

const TaglineCenter = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  z-index: 1;
  padding: 13vh 24px 0;
`;

const StartBtn = styled.button`
  margin-top: 24px;
  padding: 15px 50px;
  border-radius: 999px;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  background: linear-gradient(135deg, #C4848A 0%, #A86C72 100%);
  color: #fff;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 36px rgba(160, 80, 80, 0.32);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  display: inline-flex;
  align-items: center;
  gap: 14px;

  &::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 7px 0 7px 13px;
    border-color: transparent transparent transparent rgba(255, 255, 255, 0.88);
    flex-shrink: 0;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 44px rgba(160, 80, 80, 0.42);
  }
  &:active { transform: translateY(0); }
`;

const WordWall = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 22px;
  padding: 14px 0 0;
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

/* ─── ramen bowl image ─── */
function PixelBowl({ add = false }) {
  return (
    <div style={{ position: 'relative', width: 194, height: 194 }}>
      <img
        src={bowlImg}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated',
          filter: 'drop-shadow(0 6px 16px rgba(60,30,0,0.42))' }}
      />
      {add && (
        <span style={{
          position: 'absolute', top: '42%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '3.2rem', fontWeight: 700, color: 'rgba(196,132,138,0.8)',
          lineHeight: 1, pointerEvents: 'none',
        }}>+</span>
      )}
    </div>
  );
}

/* ─── shelf section — bookshelf photo with overlaid bowls ─── */
const ShelfSection = styled.div`
  position: relative;
  width: 100%;
  flex-shrink: 0;
  background: #3D1F0A;
`;

const ShelfImg = styled.img`
  width: 100%;
  display: block;
`;

/* Rows of bowls sitting on each shelf board */
const BowlRow = styled.div`
  position: absolute;
  left: 7%;
  right: 7%;
  display: flex;
  justify-content: center;
  gap: 14px;
  align-items: flex-end;
  bottom: ${p => p.$bottom};
`;

/* Names rendered on the shelf board itself */
const NameRow = styled.div`
  position: absolute;
  left: 7%;
  right: 7%;
  display: flex;
  justify-content: center;
  gap: 14px;
  align-items: center;
  bottom: ${p => p.$bottom};
  pointer-events: none;
`;

const ShelfLabel = styled.div`
  width: 194px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.03em;
  text-shadow: 0 1px 4px rgba(0,0,0,0.55);
`;

const BowlCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 0 0 auto;
  transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1);

  &:hover { transform: translateY(-12px); }
`;

const AddBowlCard = styled(BowlCard)`
  opacity: 0.5;
  &:hover { opacity: 0.9; transform: translateY(-10px); }
`;

const EmptySlot = styled.div`
  flex: 0 0 auto;
  width: 194px;
  visibility: hidden;
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
  const shelfRef = useRef(null);
  const pageRef = useRef(null);

  const updateBooks = useCallback(updater => {
    setBooks(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem(BOOKS_CACHE, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const loadBooks = useCallback(async () => {
    if (!auth) return;
    try { updateBooks(await api.fetchBooks()); } catch (e) { console.error(e); }
  }, [updateBooks, auth]);

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
    if (!auth) { navigate('/login'); return; }
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
    <Page ref={pageRef}>
      <TopBarArea>
        <TopPill>
          <PillSection>
            <PillTitle onClick={() => pageRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}>
              Ramen Vocab
            </PillTitle>
            <PillEmoji>🍜</PillEmoji>
          </PillSection>
          <PillSep />
          <PillSection>
            <PillNavBtn $active>Bookshelf</PillNavBtn>
            <PillNavBtn onClick={() => navigate('/collection')}>Collection</PillNavBtn>
            <PillNavBtn onClick={() => navigate('/statistics')}>Statistics</PillNavBtn>
          </PillSection>
          <PillSep />
          <PillSection>
            {auth ? (
              <>
                <PillEmail>{auth.email}</PillEmail>
                <PillSignOut onClick={() => { logout(); }}>Sign Out</PillSignOut>
              </>
            ) : (
              <PillSignOut onClick={() => navigate('/login')}>Sign In</PillSignOut>
            )}
          </PillSection>
        </TopPill>
      </TopBarArea>

      <HeroSection>
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

        <TaglineCenter>
          <TaglineWrapper>
            <Tagline>
              Ready to <HighlightWord>grind</HighlightWord> some vocab?
            </Tagline>
            <StartBtn onClick={() => shelfRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              Start Cooking 🍜
            </StartBtn>
          </TaglineWrapper>
        </TaglineCenter>
      </HeroSection>

      <ShelfSection ref={shelfRef}>
        <ShelfImg src={shelfBg} alt="" draggable={false} />
        {(() => {
          // Image 1536×1024: outer frame ~6%, each board ~3% of height.
          // Board 1: 33–36% from top  →  bottom: 64–67%
          // Board 2: 63–66% from top  →  bottom: 34–37%
          // Bottom frame: 93–100%     →  bottom: 0–7%
          const ROWS = [
            { bowlBottom: '62%', nameBottom: '60%' },  // row 1 → board 1
            { bowlBottom: '37%', nameBottom: '35%' },  // row 2 → board 2
            { bowlBottom: '7%',  nameBottom: '4.5%' }, // row 3 → bottom frame
          ];
          const PER_ROW = 4;
          const slots = [...books.slice(0, ROWS.length * PER_ROW - 1), { id: 'add', isAdd: true }];
          const rows = ROWS.map(({ bowlBottom, nameBottom }, ri) => {
            const row = slots.slice(ri * PER_ROW, (ri + 1) * PER_ROW);
            while (row.length < PER_ROW) row.push({ id: `e-${ri}-${row.length}`, isEmpty: true });
            return { bowlBottom, nameBottom, row };
          });
          return rows.map(({ bowlBottom, nameBottom, row }, ri) => (
            <>
              <BowlRow key={`br-${ri}`} $bottom={bowlBottom}>
                {row.map(item =>
                  item.isEmpty ? (
                    <EmptySlot key={item.id} />
                  ) : item.isAdd ? (
                    <AddBowlCard key="add" onClick={handleCreate} title="Add new book">
                      <PixelBowl add />
                    </AddBowlCard>
                  ) : (
                    <BowlCard
                      key={item.id}
                      onClick={() => navigate(`/book/${item.id}`, { state: { title: item.title } })}
                      onContextMenu={e => handleContextMenu(e, item)}
                      title={item.title}
                    >
                      <PixelBowl />
                    </BowlCard>
                  )
                )}
              </BowlRow>
              <NameRow key={`nr-${ri}`} $bottom={nameBottom}>
                {row.map(item => (
                  <ShelfLabel key={item.id ?? 'add-lbl'}>
                    {item.isEmpty ? '' : item.isAdd ? 'New Book' : item.title}
                  </ShelfLabel>
                ))}
              </NameRow>
            </>
          ));
        })()}
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
