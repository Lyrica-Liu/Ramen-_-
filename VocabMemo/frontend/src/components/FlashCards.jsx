import styled from 'styled-components';

/* ─── styled ─── */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Banner = styled.div`
  background: ${p => p.theme.bannerBg};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  padding: 12px 20px;
  font-size: 0.9rem;
  color: ${p => p.theme.text};
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ProgressTrack = styled.div`
  flex: 1;
  height: 7px;
  background: ${p => p.theme.progressTrack};
  border-radius: 8px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${p => p.theme.progressGradient[0]}, ${p => p.theme.progressGradient[1]});
  border-radius: 8px;
  transition: width 0.3s ease;
  width: ${p => p.$percent}%;
`;

const CardContainer = styled.div`
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 28px 28px;
  text-align: center;
`;

const FlashCard = styled.div`
  min-height: 240px;
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
  color: ${p => p.theme.textSecondary};
`;

const Message = styled.div`
  font-size: 1.1rem;
  color: ${p => p.theme.muted};
`;

const NavRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
`;

const NavBtn = styled.button`
  padding: 10px 22px;
  background: ${p => p.theme.btnBg};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 600;
  font-size: 0.92rem;
  color: ${p => p.theme.text};

  &:hover:not(:disabled) {
    background: ${p => p.theme.btnHover};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;

const ReviewRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 6px;
`;

const HardBtn = styled(NavBtn)`
  background: ${p => p.theme.hardBg};
  border-color: ${p => p.theme.hardBorder};
  color: ${p => p.theme.hardText};

  &:hover:not(:disabled) {
    background: ${p => p.theme.hardHover};
  }
`;

const EasyBtn = styled(NavBtn)`
  background: ${p => p.theme.easyBg};
  border-color: ${p => p.theme.easyBorder};
  color: ${p => p.theme.easyText};

  &:hover:not(:disabled) {
    background: ${p => p.theme.easyHover};
  }
`;

const CardIndex = styled.div`
  font-size: 0.85rem;
  color: ${p => p.theme.muted};
  margin-top: 10px;
`;

const CompleteBox = styled.div`
  background: ${p => p.theme.completeBg};
  border: 1.5px solid ${p => p.theme.completeBorder};
  border-radius: ${p => p.theme.radius};
  padding: 24px 28px;
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
