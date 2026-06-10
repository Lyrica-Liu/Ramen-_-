import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import * as api from '../api';
import styled, { keyframes, css } from 'styled-components';

/* ─── flip animations ─── */

const cardOut = keyframes`
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.97); }
`;

const cardIn = keyframes`
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
`;

/* ─── styled ─── */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 680px;
  margin: 0 auto;
  padding: 4px 2px 24px;
`;

const CenterBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 24px;
  text-align: center;
`;

const IdleTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${p => p.theme.text};
  letter-spacing: -0.02em;
`;

const IdleSub = styled.p`
  font-size: 0.95rem;
  color: ${p => p.theme.textSecondary};
  max-width: 320px;
  line-height: 1.65;
`;

const ModeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  width: 100%;
  max-width: 480px;
  margin-top: 4px;
`;

const ModeCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 22px 20px;
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  box-shadow: ${p => p.theme.shadow};

  &:hover {
    border-color: ${p => p.theme.primary};
    background: ${p => p.theme.primaryMuted};
    transform: translateY(-2px);
    box-shadow: ${p => p.theme.shadowLg};
  }
`;

const ModeCardTitle = styled.div`
  font-size: 0.97rem;
  font-weight: 800;
  color: ${p => p.theme.text};
`;

const ModeCardSub = styled.div`
  font-size: 0.82rem;
  color: ${p => p.theme.textSecondary};
  line-height: 1.5;
`;

const PillBtn = styled.button`
  padding: 13px 38px;
  background: linear-gradient(135deg, ${p => p.theme.primary} 0%, ${p => p.theme.primaryStrong} 100%);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: ${p => p.theme.shadowPrimary};
  transition: all 0.16s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(139, 92, 246, 0.38);
  }
  &:disabled { opacity: 0.45; cursor: default; }
`;

const OutlineBtn = styled.button`
  padding: 12px 32px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.95rem;
  color: ${p => p.theme.text};
  background: ${p => p.theme.panel};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${p => p.theme.borderStrong};
    background: ${p => p.theme.btnHover};
  }
`;

const NeedMore = styled.div`
  padding: 24px;
  text-align: center;
  color: ${p => p.theme.textSecondary};
  font-size: 0.92rem;
  line-height: 1.65;
  strong { color: ${p => p.theme.text}; }
`;

/* progress */
const ProgressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Track = styled.div`
  flex: 1;
  height: 7px;
  background: ${p => p.theme.progressTrack};
  border-radius: 99px;
  overflow: hidden;
`;

const Fill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${p => p.theme.progressGradient[0]}, ${p => p.theme.progressGradient[1]});
  border-radius: 99px;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${p => p.$pct}%;
`;

const Counter = styled.div`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${p => p.theme.textSecondary};
  white-space: nowrap;
`;

const QuitBtn = styled.button`
  padding: 5px 13px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${p => p.theme.textSecondary};
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.13s ease;

  &:hover {
    border-color: #ef4444;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
  }
`;

/* the main card */
const Card = styled.div`
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 32px 28px;
  box-shadow: ${p => p.theme.shadowLg};
  display: flex;
  flex-direction: column;
  gap: 22px;

  animation: ${p => {
    if (p.$anim === 'out') return css`${cardOut} 0.10s ease-in  forwards`;
    if (p.$anim === 'in')  return css`${cardIn}  0.11s ease-out forwards`;
    return 'none';
  }};
`;

/* front face */
const QLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: ${p => p.theme.primary};
`;

const DefText = styled.div`
  font-size: 1.1rem;
  color: ${p => p.theme.text};
  line-height: 1.7;
  white-space: pre-line;
`;

const ChoicesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const ChoiceBtn = styled.button`
  padding: 16px 12px;
  border-radius: ${p => p.theme.radiusSm};
  font-size: 0.95rem;
  font-weight: 600;
  text-align: center;
  border: 1.5px solid ${p => p.theme.border};
  background: ${p => p.theme.bg};
  color: ${p => p.theme.text};
  transition: all 0.14s ease;
  box-shadow: ${p => p.theme.shadow};

  &:hover:not(:disabled) {
    border-color: ${p => p.theme.primary};
    background: ${p => p.theme.primaryMuted};
    transform: translateY(-2px);
    box-shadow: ${p => p.theme.shadowLg};
    color: ${p => p.theme.primary};
  }
  &:active:not(:disabled) { transform: translateY(0); }
`;

/* grind mode */
const GrindRow = styled.div`
  display: flex;
  gap: 10px;
`;

const GrindInput = styled.input`
  flex: 1;
  padding: 14px 16px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  font-size: 1rem;
  background: #fff;
  outline: none;

  &:focus {
    border-color: ${p => p.theme.primary};
  }

  &:disabled {
    opacity: 0.5;
    background: ${p => p.theme.btnBg};
    cursor: default;
  }
`;

const GrindCheckBtn = styled.button`
  padding: 14px 24px;
  background: linear-gradient(135deg, ${p => p.theme.primary} 0%, ${p => p.theme.primaryStrong} 100%);
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.16s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${p => p.theme.shadowPrimary};
  }
  &:disabled { opacity: 0.4; cursor: default; }
`;

/* back face */
const Feedback = styled.div`
  font-size: 1.05rem;
  font-weight: 800;
  color: ${p => (p.$correct ? p.theme.correctText : p.theme.wrongText)};
  letter-spacing: -0.01em;
`;

const RevealWord = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: ${p => p.theme.text};
  letter-spacing: -0.03em;
  line-height: 1.2;
`;

const PosPill = styled.span`
  display: inline-block;
  padding: 3px 11px;
  background: ${p => p.theme.primaryMuted};
  color: ${p => p.theme.primary};
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const RevealDef = styled.div`
  font-size: 0.97rem;
  color: ${p => p.theme.textSecondary};
  line-height: 1.65;
  white-space: pre-line;
`;

const NextBtn = styled(PillBtn)`
  align-self: center;
  padding: 12px 44px;
  font-size: 0.95rem;
`;

/* complete screen */
const ScoreBox = styled(CenterBox)``;
const ScoreTitle = styled(IdleTitle)``;
const ScoreNum = styled.div`
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: ${p => (p.$pct >= 70 ? p.theme.correctText : p.$pct >= 50 ? p.theme.okayText : p.theme.wrongText)};
`;
const ScoreSub = styled(IdleSub)``;
const ScoreBtns = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
`;

/* ─── helpers ─── */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildChoices(studyWords, pos) {
  const correct = studyWords[pos];
  const distractors = shuffle(studyWords.filter(w => w.id !== correct.id)).slice(0, 3);
  return shuffle([correct, ...distractors]);
}

/* ─── component ─── */

export default function StudyMode({ words, bookId }) {
  const studyable = useMemo(
    () => words.filter(w => w.translation?.trim()),
    [words],
  );
  const canStudy = studyable.length >= 4;

  const [studyMode, setStudyMode] = useState('normal'); // 'normal' | 'grind'
  const [phase, setPhase] = useState('idle');
  const [studyWords, setStudyWords] = useState([]);
  const [pos, setPos] = useState(0);
  const [choices, setChoices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [anim, setAnim] = useState('idle');
  const [face, setFace] = useState('question');

  const [grindInput, setGrindInput] = useState('');
  const grindInputRef = useRef(null);
  const animRef = useRef(null);
  const handleNextRef = useRef(null);

  const current = studyWords[pos] ?? null;
  const isCorrect = selectedId !== null && selectedId === current?.id;

  function runFlip(onMidpoint, onDone) {
    setAnim('out');
    clearTimeout(animRef.current);
    animRef.current = setTimeout(() => {
      onMidpoint();
      setAnim('in');
      animRef.current = setTimeout(() => {
        setAnim('idle');
        onDone?.();
      }, 110);
    }, 100);
  }

  const startStudy = useCallback((mode) => {
    setStudyMode(mode);
    const sq = shuffle(studyable);
    setStudyWords(sq);
    setPos(0);
    if (mode === 'normal') setChoices(buildChoices(sq, 0));
    setSelectedId(null);
    setFace('question');
    setAnim('idle');
    setScore({ correct: 0, total: 0 });
    setGrindInput('');
    setPhase('playing');
  }, [studyable]);

  function handleQuit() {
    clearTimeout(animRef.current);
    setPhase('idle');
  }

  /* auto-focus grind input on question face */
  useEffect(() => {
    if (studyMode === 'grind' && face === 'question' && phase === 'playing') {
      const t = setTimeout(() => grindInputRef.current?.focus(), 260);
      return () => clearTimeout(t);
    }
  }, [studyMode, face, phase, pos]);

  /* Enter key advances from result face */
  useEffect(() => {
    if (phase !== 'playing' || face !== 'result') return;
    const handler = e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      handleNextRef.current?.();
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [phase, face]);

  function handleChoice(choice) {
    if (selectedId !== null || anim !== 'idle') return;
    const correct = choice.id === current.id;
    setSelectedId(choice.id);
    setScore(prev => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }));
    runFlip(() => setFace('result'), null);
    if (bookId && current?.id) {
      api.reviewWord(bookId, current.id, correct ? 'correct' : 'incorrect').catch(() => {});
    }
  }

  function handleGrindCheck() {
    if (!grindInput.trim() || face !== 'question' || anim !== 'idle') return;
    const correct = grindInput.trim().toLowerCase() === current.term.toLowerCase();
    setGrindInput('');
    setSelectedId(correct ? current.id : '__wrong__');
    setScore(prev => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }));
    runFlip(() => setFace('result'), null);
    if (bookId && current?.id) {
      api.reviewWord(bookId, current.id, correct ? 'correct' : 'incorrect').catch(() => {});
    }
  }

  function handleNext() {
    if (anim !== 'idle') return;
    const next = pos + 1;
    runFlip(() => {
      if (next >= studyWords.length) {
        setPhase('complete');
      } else {
        setPos(next);
        if (studyMode === 'normal') setChoices(buildChoices(studyWords, next));
        setSelectedId(null);
        setFace('question');
        setGrindInput('');
      }
    }, null);
  }

  handleNextRef.current = handleNext;

  const progressPct = studyWords.length > 0
    ? Math.round(((pos + (face === 'result' ? 1 : 0)) / studyWords.length) * 100)
    : 0;
  const scorePct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  /* ── idle ── */
  if (phase === 'idle') {
    return (
      <Wrapper>
        {!canStudy ? (
          <NeedMore>
            <strong>Add at least 4 words to start Study Mode.</strong>
            <br />Use the &quot;+ Add Word&quot; tab to build your deck.
          </NeedMore>
        ) : (
          <CenterBox>
            <IdleTitle>Study Mode</IdleTitle>
            <IdleSub>{studyable.length} cards ready. Pick a mode to begin.</IdleSub>
            <ModeRow>
              <ModeCard onClick={() => startStudy('normal')}>
                <ModeCardTitle>Normal Mode</ModeCardTitle>
                <ModeCardSub>See a definition and pick the right word from 4 choices.</ModeCardSub>
              </ModeCard>
              <ModeCard onClick={() => startStudy('grind')}>
                <ModeCardTitle>Grind Mode</ModeCardTitle>
                <ModeCardSub>See a definition and type the answer from memory.</ModeCardSub>
              </ModeCard>
            </ModeRow>
          </CenterBox>
        )}
      </Wrapper>
    );
  }

  /* ── complete ── */
  if (phase === 'complete') {
    const msg = scorePct >= 80 ? 'Excellent work!' : scorePct >= 60 ? 'Good effort!' : 'Keep practicing!';
    return (
      <Wrapper>
        <ScoreBox>
          <ScoreTitle>Session Complete</ScoreTitle>
          <ScoreNum $pct={scorePct}>{scorePct}%</ScoreNum>
          <ScoreSub>{score.correct} / {score.total} correct — {msg}</ScoreSub>
          <ScoreBtns>
            <OutlineBtn onClick={() => setPhase('idle')}>Change Mode</OutlineBtn>
            <PillBtn onClick={() => startStudy(studyMode)}>Study Again</PillBtn>
          </ScoreBtns>
        </ScoreBox>
      </Wrapper>
    );
  }

  /* ── playing ── */
  return (
    <Wrapper>
      <ProgressRow>
        <Track><Fill $pct={progressPct} /></Track>
        <Counter>{pos + 1} / {studyWords.length}</Counter>
        <QuitBtn onClick={handleQuit}>Quit</QuitBtn>
      </ProgressRow>

      <Card $anim={anim}>
        {face === 'question' ? (
          <>
            <QLabel>
              {studyMode === 'grind' ? 'Type the word for this definition' : 'Which word matches this definition?'}
            </QLabel>
            <DefText>{current?.translation ?? ''}</DefText>
            {studyMode === 'normal' ? (
              <ChoicesGrid>
                {choices.map(choice => (
                  <ChoiceBtn
                    key={choice.id}
                    onClick={() => handleChoice(choice)}
                    disabled={selectedId !== null || anim !== 'idle'}
                  >
                    {choice.term}
                  </ChoiceBtn>
                ))}
              </ChoicesGrid>
            ) : (
              <GrindRow>
                <GrindInput
                  ref={grindInputRef}
                  type="text"
                  placeholder="Type the word…"
                  value={grindInput}
                  disabled={anim !== 'idle'}
                  onChange={e => setGrindInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleGrindCheck(); } }}
                />
                <GrindCheckBtn
                  disabled={!grindInput.trim() || anim !== 'idle'}
                  onClick={handleGrindCheck}
                >
                  Check
                </GrindCheckBtn>
              </GrindRow>
            )}
          </>
        ) : (
          <>
            <Feedback $correct={isCorrect}>
              {isCorrect ? '✓ Correct!' : `✗ Incorrect — the answer was "${current?.term}"`}
            </Feedback>
            <div>
              <RevealWord>{current?.term}</RevealWord>
              {current?.apiMetadata?.partOfSpeech && (
                <PosPill>{current.apiMetadata.partOfSpeech}</PosPill>
              )}
            </div>
            <RevealDef>{current?.translation}</RevealDef>
            <NextBtn onClick={handleNext}>
              {pos + 1 < studyWords.length ? 'Next →' : 'See Results'}
            </NextBtn>
          </>
        )}
      </Card>
    </Wrapper>
  );
}
