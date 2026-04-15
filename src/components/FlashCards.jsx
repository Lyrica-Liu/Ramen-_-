import styled from 'styled-components';

/* ─── helpers ─── */

function levelColor(level) {
  if (level <= 2) return '#ef4444';
  if (level <= 4) return '#f59e0b';
  return '#22c55e';
}

function levelLabel(level) {
  if (level <= 2) return 'Beginner';
  if (level <= 4) return 'Familiar';
  return 'Mastered';
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatNextReview(isoStr) {
  if (!isoStr) return '—';
  const next = new Date(isoStr);
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextMid = new Date(next.getFullYear(), next.getMonth(), next.getDate());
  const diff = Math.round((nextMid - todayMid) / 86400000);
  const dateStr = next.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  if (diff <= 0) return `Today · ${dateStr}`;
  if (diff === 1) return `Tomorrow · ${dateStr}`;
  return `in ${diff} days · ${dateStr}`;
}

/* ─── styled ─── */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Banner = styled.div`
  background: ${p => p.theme.panel};
  border: 1px solid ${p => p.theme.border};
  border-left: 3px solid ${p => p.theme.primary};
  border-radius: ${p => p.theme.radiusSm};
  padding: 11px 18px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${p => p.theme.textSecondary};
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: ${p => p.theme.shadow};
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
  width: ${p => p.$percent}%;
`;

const CardContainer = styled.div`
  background: ${p => p.theme.panel};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 32px 32px 26px;
  text-align: center;
  box-shadow: ${p => p.theme.shadow};
`;

const FlashCard = styled.div`
  min-height: 190px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  gap: 6px;
`;

const Term = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  line-height: 1.2;
  letter-spacing: -0.02em;
`;

const Translation = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${p => p.theme.textSecondary};
  line-height: 1.4;
`;

const FlipHint = styled.div`
  font-size: 0.75rem;
  color: ${p => p.theme.muted};
  margin-top: 4px;
  letter-spacing: 0.02em;
`;

const Message = styled.div`
  font-size: 1.05rem;
  color: ${p => p.theme.muted};
  font-weight: 500;
`;

const NavRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
`;

const NavBtn = styled.button`
  padding: 11px 28px;
  background: ${p => p.theme.panel};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 600;
  font-size: 0.97rem;
  color: ${p => p.theme.text};
  transition: all 0.16s ease;

  &:hover:not(:disabled) {
    background: ${p => p.theme.btnHover};
    border-color: ${p => p.theme.borderStrong};
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const ReviewRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const ReviewBtn = styled(NavBtn)`
  flex: 1;
  max-width: 160px;
  padding: 14px 10px;
  font-size: 0.97rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
`;

const HardBtn = styled(ReviewBtn)`
  background: ${p => p.theme.hardBg};
  border-color: ${p => p.theme.hardBorder};
  color: ${p => p.theme.hardText};
  &:hover:not(:disabled) {
    background: ${p => p.theme.hardHover};
    border-color: #f87171;
    box-shadow: 0 3px 10px rgba(220,38,38,0.12);
  }
`;

const OkayBtn = styled(ReviewBtn)`
  background: ${p => p.theme.okayBg};
  border-color: ${p => p.theme.okayBorder};
  color: ${p => p.theme.okayText};
  &:hover:not(:disabled) {
    background: ${p => p.theme.okayHover};
    border-color: #fcd34d;
    box-shadow: 0 3px 10px rgba(217,119,6,0.12);
  }
`;

const EasyBtn = styled(ReviewBtn)`
  background: ${p => p.theme.easyBg};
  border-color: ${p => p.theme.easyBorder};
  color: ${p => p.theme.easyText};
  &:hover:not(:disabled) {
    background: ${p => p.theme.easyHover};
    border-color: #4ade80;
    box-shadow: 0 3px 10px rgba(22,163,74,0.12);
  }
`;

const BtnLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 500;
  opacity: 0.65;
  letter-spacing: 0.01em;
`;

const CardIndex = styled.div`
  font-size: 0.82rem;
  color: ${p => p.theme.muted};
  text-align: center;
  letter-spacing: 0.02em;
`;

const CompleteBox = styled.div`
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #bbf7d0;
  border-radius: ${p => p.theme.radius};
  padding: 24px 28px;
  text-align: center;
  font-size: 0.95rem;
  line-height: 1.9;
  color: ${p => p.theme.text};
  box-shadow: ${p => p.theme.shadow};

  strong {
    font-weight: 700;
    color: #15803d;
  }
`;

const DetailBox = styled.div`
  background: ${p => p.theme.panel};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  box-shadow: ${p => p.theme.shadow};
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
`;

const DetailLabel = styled.span`
  color: ${p => p.theme.muted};
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: ${p => p.theme.text};
  font-weight: 600;
`;

const LevelBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const LevelDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.$color};
  flex-shrink: 0;
`;

const HintRow = styled.div`
  text-align: center;
  font-size: 0.75rem;
  color: ${p => p.theme.muted};
  letter-spacing: 0.02em;
`;

/* ─── component ─── */

export default function FlashCards({
  word,
  showBack,
  position,
  total,
  message,
  canInteract,
  dailyProgress,
  showComplete,
  summary,
  onFlip,
  onNext,
  onPrev,
  onEasy,
  onOkay,
  onHard,
}) {
  const disabled = !!message || !canInteract;
  const level = word?.reviewLevel || 1;

  return (
    <Wrapper>
      {/* Daily session banner */}
      {dailyProgress && (
        <Banner>
          <span>{dailyProgress.text}</span>
          <ProgressTrack>
            <ProgressFill $percent={Math.max(0, Math.min(100, dailyProgress.percent))} />
          </ProgressTrack>
        </Banner>
      )}

      {/* Completion summary */}
      {showComplete && summary && (
        <CompleteBox>
          Words reviewed today: <strong>{summary.reviewed}</strong>
          <br />
          Words mastered: <strong>{summary.mastered}</strong>
          {summary.accuracy !== null && (
            <>
              <br />
              Accuracy rate: <strong>{summary.accuracy}%</strong>
            </>
          )}
        </CompleteBox>
      )}

      {/* Flash card */}
      <CardContainer>
        <FlashCard onClick={disabled ? undefined : onFlip}>
          {message ? (
            <Message>{message}</Message>
          ) : showBack ? (
            <Translation>{word?.translation ?? '-'}</Translation>
          ) : (
            <>
              <Term>{word?.term ?? '-'}</Term>
              {!disabled && <FlipHint>click or Space to flip</FlipHint>}
            </>
          )}
        </FlashCard>
      </CardContainer>

      {/* Navigation */}
      <NavRow>
        <NavBtn disabled={disabled} onClick={onPrev}>←</NavBtn>
        <NavBtn disabled={disabled} onClick={onFlip}>Flip</NavBtn>
        <NavBtn disabled={disabled} onClick={onNext}>→</NavBtn>
      </NavRow>

      {/* Review buttons */}
      <ReviewRow>
        <HardBtn disabled={disabled} onClick={onHard}>
          Hard
          <BtnLabel>A · level −1</BtnLabel>
        </HardBtn>
        <OkayBtn disabled={disabled} onClick={onOkay}>
          Okay
          <BtnLabel>S · level +1</BtnLabel>
        </OkayBtn>
        <EasyBtn disabled={disabled} onClick={onEasy}>
          Easy
          <BtnLabel>D · level +2</BtnLabel>
        </EasyBtn>
      </ReviewRow>

      {/* Card index */}
      <CardIndex>
        {message ? (total === 0 ? 'No words yet' : '–') : `${position} / ${total}`}
      </CardIndex>

      {/* Word detail */}
      {word && !message && (
        <DetailBox>
          <DetailRow>
            <DetailLabel>Familiarity</DetailLabel>
            <DetailValue>
              <LevelBadge>
                <LevelDot $color={levelColor(level)} />
                Level {level}/6 · {levelLabel(level)}
              </LevelBadge>
            </DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Added</DetailLabel>
            <DetailValue>{formatDate(word.createdTime)}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Next review</DetailLabel>
            <DetailValue>{formatNextReview(word.nextReviewTime)}</DetailValue>
          </DetailRow>
        </DetailBox>
      )}

      {/* Keyboard hints */}
      {!disabled && (
        <HintRow>
          Space · flip &nbsp;·&nbsp; ← → · navigate &nbsp;·&nbsp; A / S / D · hard / okay / easy
        </HintRow>
      )}
    </Wrapper>
  );
}
