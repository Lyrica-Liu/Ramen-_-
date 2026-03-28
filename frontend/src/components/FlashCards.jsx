import styled from 'styled-components';

/* ─── styled ─── */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Banner = styled.div`
  background: #eef3ff;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 0.9rem;
  color: ${p => p.theme.text};
  display: flex;
  align-items: center;
  gap: 14px;
`;

const ProgressTrack = styled.div`
  flex: 1;
  height: 7px;
  background: #dde3f7;
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #6f8dff, #6cc8a1);
  border-radius: 6px;
  transition: width 0.3s ease;
  width: ${p => p.$percent}%;
`;

const CardContainer = styled.div`
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 22px 24px;
  text-align: center;
`;

const FlashCard = styled.div`
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
`;

const Term = styled.div`
  font-size: 1.62rem;
  font-weight: 700;
  color: ${p => p.theme.text};
`;

const Translation = styled.div`
  font-size: 1.1rem;
  color: #6b7280;
`;

const Message = styled.div`
  font-size: 1.1rem;
  color: #9ca3af;
`;

const NavRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 6px;
`;

const NavBtn = styled.button`
  padding: 8px 18px;
  background: #eef1fb;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.92rem;
  color: ${p => p.theme.text};

  &:hover:not(:disabled) {
    background: #e0e5f6;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;

const ReviewRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 4px;
`;

const HardBtn = styled(NavBtn)`
  background: #fff0ed;
  border-color: #fca5a5;
  color: #ef4444;

  &:hover:not(:disabled) {
    background: #fee2e2;
  }
`;

const EasyBtn = styled(NavBtn)`
  background: #ecfdf5;
  border-color: #86efac;
  color: #16a34a;

  &:hover:not(:disabled) {
    background: #d1fae5;
  }
`;

const CardIndex = styled.div`
  font-size: 0.85rem;
  color: #9ca3af;
  margin-top: 8px;
`;

const CompleteBox = styled.div`
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: ${p => p.theme.radius};
  padding: 20px 24px;
  text-align: center;
  font-size: 0.95rem;
  line-height: 1.8;
  color: ${p => p.theme.text};

  strong {
    font-weight: 700;
  }
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
  onHard,
}) {
  const disabled = !!message || !canInteract;

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
            <Term>{word?.term ?? '-'}</Term>
          )}
        </FlashCard>
      </CardContainer>

      {/* Navigation */}
      <NavRow>
        <NavBtn disabled={disabled} onClick={onPrev}>
          ←
        </NavBtn>
        <NavBtn disabled={disabled} onClick={onFlip}>
          Flip
        </NavBtn>
        <NavBtn disabled={disabled} onClick={onNext}>
          →
        </NavBtn>
      </NavRow>

      {/* Review buttons */}
      <ReviewRow>
        <HardBtn disabled={disabled} onClick={onHard}>
          Hard
        </HardBtn>
        <EasyBtn disabled={disabled} onClick={onEasy}>
          Easy
        </EasyBtn>
      </ReviewRow>

      {/* Card index */}
      <CardIndex>
        {message ? (total === 0 ? 'No words yet' : '0/0') : `${position}/${total}`}
      </CardIndex>
    </Wrapper>
  );
}
