import { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';

/* ─── styled ─── */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 2px;
`;

const IdleBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 24px;
  text-align: center;
`;

const IdleTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 800;
  color: ${p => p.theme.text};
  letter-spacing: -0.02em;
`;

const IdleSubtitle = styled.p`
  font-size: 0.95rem;
  color: ${p => p.theme.textSecondary};
  max-width: 340px;
  line-height: 1.6;
`;

const StartBtn = styled.button`
  padding: 14px 40px;
  background: ${p => p.theme.primary};
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.16s ease;

  &:hover:not(:disabled) {
    background: ${p => p.theme.primaryStrong};
    transform: translateY(-1px);
    box-shadow: ${p => p.theme.shadowPrimary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const NotEnoughBox = styled.div`
  padding: 20px;
  text-align: center;
  color: ${p => p.theme.textSecondary};
  font-size: 0.92rem;
  line-height: 1.6;

  strong {
    color: ${p => p.theme.text};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const ProgressTrack = styled.div`
  flex: 1;
  height: 6px;
  background: ${p => p.theme.progressTrack};
  border-radius: 99px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${p => p.theme.progressGradient[0]}, ${p => p.theme.progressGradient[1]});
  border-radius: 99px;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${p => p.$pct}%;
`;

const Counter = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${p => p.theme.textSecondary};
  white-space: nowrap;
`;

const QuestionCard = styled.div`
  background: ${p => p.theme.bg};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 28px 26px;
  min-height: 120px;
`;

const QuestionLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${p => p.theme.primary};
  margin-bottom: 10px;
`;

const DefinitionText = styled.div`
  font-size: 1.05rem;
  color: ${p => p.theme.text};
  line-height: 1.65;
  white-space: pre-line;
`;

const ChoicesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ChoiceBtn = styled.button`
  padding: 16px 14px;
  border-radius: ${p => p.theme.radiusSm};
  font-size: 0.97rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.14s ease;
  border: 2px solid
    ${p => {
      if (p.$correct) return p.theme.correctBorder;
      if (p.$wrong) return p.theme.wrongBorder;
      return p.theme.border;
    }};
  background: ${p => {
    if (p.$correct) return p.theme.correctBg;
    if (p.$wrong) return p.theme.wrongBg;
    return p.theme.panel;
  }};
  color: ${p => {
    if (p.$correct) return p.theme.correctText;
    if (p.$wrong) return p.theme.wrongText;
    return p.theme.text;
  }};
  cursor: ${p => (p.$answered ? 'default' : 'pointer')};
  box-shadow: ${p => p.theme.shadow};

  &:hover:not(:disabled):not([data-answered='true']) {
    border-color: ${p => p.theme.primary};
    background: ${p => p.theme.primaryMuted};
    transform: translateY(-1px);
    box-shadow: ${p => p.theme.shadowLg};
  }
`;

const RevealCard = styled.div`
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.completeBorder};
  border-radius: ${p => p.theme.radius};
  padding: 20px 22px;
`;

const RevealWord = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${p => p.theme.text};
  letter-spacing: -0.02em;
  margin-bottom: 6px;
`;

const RevealPos = styled.span`
  display: inline-block;
  padding: 2px 9px;
  background: ${p => p.theme.primaryMuted};
  color: ${p => p.theme.primary};
  border-radius: 999px;
  font-size: 0.73rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 10px;
`;

const RevealDef = styled.div`
  font-size: 0.93rem;
  color: ${p => p.theme.textSecondary};
  line-height: 1.6;
  white-space: pre-line;
`;

const ResultFeedback = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${p => (p.$correct ? p.theme.correctText : p.theme.wrongText)};
  margin-bottom: 8px;
`;

const NextBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: ${p => p.theme.primary};
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 700;
  font-size: 0.97rem;
  transition: all 0.16s ease;

  &:hover {
    background: ${p => p.theme.primaryStrong};
    transform: translateY(-1px);
    box-shadow: ${p => p.theme.shadowPrimary};
  }
`;

const CompleteBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 24px;
  text-align: center;
`;

const CompleteTitle = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${p => p.theme.text};
  letter-spacing: -0.02em;
`;

const ScoreBadge = styled.div`
  font-size: 3rem;
  font-weight: 900;
  color: ${p => (p.$pct >= 70 ? p.theme.correctText : p.$pct >= 50 ? p.theme.okayText : p.theme.wrongText)};
  letter-spacing: -0.03em;
`;

const ScoreLabel = styled.div`
  font-size: 0.95rem;
  color: ${p => p.theme.textSecondary};
`;

const RestartBtn = styled(StartBtn)``;

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
  const pool = studyWords.filter(w => w.id !== correct.id);
  const distractors = shuffle(pool).slice(0, 3);
  return shuffle([correct, ...distractors]);
}

/* ─── component ─── */

export default function StudyMode({ words }) {
  const studyable = useMemo(
    () => words.filter(w => w.translation && w.translation.trim()),
    [words],
  );

  const [phase, setPhase] = useState('idle'); // idle | playing | complete
  const [studyWords, setStudyWords] = useState([]);
  const [pos, setPos] = useState(0);
  const [choices, setChoices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const canStudy = studyable.length >= 4;
  const current = studyWords[pos] ?? null;
  const isAnswered = selectedId !== null;
  const isCorrect = selectedId !== null && selectedId === current?.id;

  const startStudy = useCallback(() => {
    const sq = shuffle(studyable);
    setStudyWords(sq);
    setPos(0);
    setChoices(buildChoices(sq, 0));
    setSelectedId(null);
    setScore({ correct: 0, total: 0 });
    setPhase('playing');
  }, [studyable]); // eslint-disable-line react-hooks/exhaustive-deps

  /* reset to idle if word list changes significantly */
  useEffect(() => {
    if (phase === 'playing' && studyable.length < 4) setPhase('idle');
  }, [studyable.length]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChoiceClick(word) {
    if (isAnswered) return;
    const correct = word.id === current.id;
    setSelectedId(word.id);
    setScore(prev => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }));
  }

  function handleNext() {
    const next = pos + 1;
    if (next >= studyWords.length) {
      setPhase('complete');
    } else {
      setPos(next);
      setChoices(buildChoices(studyWords, next));
      setSelectedId(null);
    }
  }

  const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  const progressPct = studyWords.length > 0 ? Math.round(((pos + (isAnswered ? 1 : 0)) / studyWords.length) * 100) : 0;

  /* ── idle ── */
  if (phase === 'idle') {
    return (
      <Wrapper>
        {!canStudy ? (
          <NotEnoughBox>
            <strong>Need at least 4 words to start Study Mode.</strong>
            <br />
            Add more words using the "Add Word" tab.
          </NotEnoughBox>
        ) : (
          <IdleBox>
            <IdleTitle>Study Mode</IdleTitle>
            <IdleSubtitle>
              You'll see a definition and pick the matching word from 4 choices.
              {studyable.length} cards ready.
            </IdleSubtitle>
            <StartBtn onClick={startStudy}>Start Session</StartBtn>
          </IdleBox>
        )}
      </Wrapper>
    );
  }

  /* ── complete ── */
  if (phase === 'complete') {
    const msg = pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good effort!' : 'Keep practicing!';
    return (
      <Wrapper>
        <CompleteBox>
          <CompleteTitle>Session Complete</CompleteTitle>
          <ScoreBadge $pct={pct}>{pct}%</ScoreBadge>
          <ScoreLabel>
            {score.correct} / {score.total} correct — {msg}
          </ScoreLabel>
          <RestartBtn onClick={startStudy}>Study Again</RestartBtn>
        </CompleteBox>
      </Wrapper>
    );
  }

  /* ── playing ── */
  return (
    <Wrapper>
      <Header>
        <ProgressTrack>
          <ProgressFill $pct={progressPct} />
        </ProgressTrack>
        <Counter>
          {pos + 1} / {studyWords.length}
        </Counter>
      </Header>

      <QuestionCard>
        <QuestionLabel>What word matches this definition?</QuestionLabel>
        <DefinitionText>{current?.translation ?? ''}</DefinitionText>
      </QuestionCard>

      <ChoicesGrid>
        {choices.map(choice => {
          const isThis = choice.id === selectedId;
          const isCorrectChoice = choice.id === current?.id;
          return (
            <ChoiceBtn
              key={choice.id}
              $correct={isAnswered && isCorrectChoice}
              $wrong={isAnswered && isThis && !isCorrectChoice}
              $answered={isAnswered}
              data-answered={isAnswered ? 'true' : undefined}
              onClick={() => handleChoiceClick(choice)}
              disabled={isAnswered}
            >
              {choice.term}
            </ChoiceBtn>
          );
        })}
      </ChoicesGrid>

      {isAnswered && (
        <>
          <RevealCard>
            <ResultFeedback $correct={isCorrect}>
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </ResultFeedback>
            <RevealWord>{current.term}</RevealWord>
            {current.apiMetadata?.partOfSpeech && (
              <RevealPos>{current.apiMetadata.partOfSpeech}</RevealPos>
            )}
            <RevealDef>{current.translation}</RevealDef>
          </RevealCard>

          <NextBtn onClick={handleNext}>
            {pos + 1 < studyWords.length ? 'Next →' : 'See Results'}
          </NextBtn>
        </>
      )}
    </Wrapper>
  );
}
