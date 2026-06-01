import { useState, useCallback, useMemo, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

/* ─── flip animations ─── */

const flipOut = keyframes`
  from { transform: perspective(900px) rotateY(0deg); opacity: 1; }
  to   { transform: perspective(900px) rotateY(90deg); opacity: 0; }
`;

const flipIn = keyframes`
  from { transform: perspective(900px) rotateY(-90deg); opacity: 0; }
  to   { transform: perspective(900px) rotateY(0deg); opacity: 1; }
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
  padding: 56px 24px;
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
    if (p.$anim === 'out') return css`${flipOut} 0.22s ease forwards`;
    if (p.$anim === 'in')  return css`${flipIn}  0.22s ease forwards`;
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

export default function StudyMode({ words }) {
  const studyable = useMemo(
    () => words.filter(w => w.translation?.trim()),
    [words],
  );
  const canStudy = studyable.length >= 4;

  const [phase, setPhase] = useState('idle');
  const [studyWords, setStudyWords] = useState([]);
  const [pos, setPos] = useState(0);
  const [choices, setChoices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [anim, setAnim] = useState('idle'); // idle | out | in
  const [face, setFace] = useState('question'); // question | result

  const animRef = useRef(null);

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
      }, 230);
    }, 220);
  }

  const startStudy = useCallback(() => {
    const sq = shuffle(studyable);
    setStudyWords(sq);
    setPos(0);
    setChoices(buildChoices(sq, 0));
    setSelectedId(null);
    setFace('question');
    setAnim('idle');
    setScore({ correct: 0, total: 0 });
    setPhase('playing');
  }, [studyable]);

  function handleChoice(word) {
    if (selectedId !== null || anim !== 'idle') return;
    const correct = word.id === current.id;
    setSelectedId(word.id);
    setScore(prev => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }));
    runFlip(() => setFace('result'), null);
  }

  function handleNext() {
    if (anim !== 'idle') return;
    const next = pos + 1;
    runFlip(() => {
      if (next >= studyWords.length) {
        setPhase('complete');
      } else {
        setPos(next);
        setChoices(buildChoices(studyWords, next));
        setSelectedId(null);
        setFace('question');
      }
    }, null);
  }

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
            <br />Use the "+ Add Word" tab to build your deck.
          </NeedMore>
        ) : (
          <CenterBox>
            <IdleTitle>Study Mode</IdleTitle>
            <IdleSub>
              See a definition — pick the right word from 4 choices.
              {' '}{studyable.length} cards ready.
            </IdleSub>
            <PillBtn onClick={startStudy}>Start Session</PillBtn>
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
          <PillBtn onClick={startStudy}>Study Again</PillBtn>
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
      </ProgressRow>

      <Card $anim={anim}>
        {face === 'question' ? (
          <>
            <QLabel>Which word matches this definition?</QLabel>
            <DefText>{current?.translation ?? ''}</DefText>
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
