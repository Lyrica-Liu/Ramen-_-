import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 32px;
  min-height: 100%;
  background: ${p => p.theme.bodyBg};
`;

const Card = styled.div`
  background: ${p => p.theme.panel};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 32px;
  text-align: center;
  max-width: 400px;
  box-shadow: ${p => p.theme.shadowLg};
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: ${p => p.theme.textSecondary};
  margin-bottom: 24px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 24px 0;
  padding: 20px;
  background: ${p => p.theme.btnBg};
  border-radius: ${p => p.theme.radiusSm};
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${p => p.theme.textSecondary};
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${p => p.theme.primary};
`;

const DifficultyBreakdown = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 16px 0;
  font-size: 0.9rem;
`;

const DiffTag = styled.span`
  padding: 6px 12px;
  border-radius: ${p => p.theme.radiusSm};
  background: ${p => {
    if (p.$level === 'hard') return '#FFE8E8';
    if (p.$level === 'medium') return '#FFFBF0';
    return '#F5FFFB';
  }};
  color: ${p => {
    if (p.$level === 'hard') return '#D87A7A';
    if (p.$level === 'medium') return '#D9A355';
    return '#55C89A';
  }};
  font-weight: 600;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
`;

const Button = styled.button`
  padding: 12px 28px;
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.16s ease;

  &:hover:not(:disabled) {
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

const StartBtn = styled(Button)`
  background: ${p => p.theme.primary};
  color: #fff;
  flex: 1;

  &:hover:not(:disabled) {
    background: ${p => p.theme.primaryStrong};
  }
`;

const SkipBtn = styled(Button)`
  background: ${p => p.theme.btnBg};
  color: ${p => p.theme.text};
  border: 1px solid ${p => p.theme.border};

  &:hover:not(:disabled) {
    background: ${p => p.theme.btnHover};
  }
`;

const Icon = styled.span`
  font-size: 2.5rem;
  margin-bottom: 8px;
`;

export default function DailyStudyPreview({
  wordCount = 0,
  hardCount = 0,
  mediumCount = 0,
  easyCount = 0,
  currentStreak = 0,
  onStart,
  onSkip,
  disabled = false
}) {
  const estimatedMinutes = Math.max(1, Math.ceil(wordCount * 1));

  return (
    <Container>
      <Card>
        <Icon>📚</Icon>
        <Title>Daily Study Session</Title>
        <Subtitle>Ready to review your vocabulary?</Subtitle>

        <Stats>
          <StatItem>
            <StatLabel>Words Due</StatLabel>
            <StatValue>{wordCount}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Estimated Time</StatLabel>
            <StatValue>{estimatedMinutes} min</StatValue>
          </StatItem>
        </Stats>

        {wordCount > 0 && (
          <>
            <div>Difficulty Breakdown:</div>
            <DifficultyBreakdown>
              {hardCount > 0 && <DiffTag $level="hard">Hard {hardCount}</DiffTag>}
              {mediumCount > 0 && <DiffTag $level="medium">Medium {mediumCount}</DiffTag>}
              {easyCount > 0 && <DiffTag $level="easy">Easy {easyCount}</DiffTag>}
            </DifficultyBreakdown>

            {currentStreak > 0 && (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
                ⚡ Current streak: <strong>{currentStreak} days</strong>
              </div>
            )}
          </>
        )}

        <ButtonRow>
          <StartBtn onClick={onStart} disabled={disabled || wordCount === 0}>
            ▶ Start Session
          </StartBtn>
          <SkipBtn onClick={onSkip} disabled={disabled}>
            Skip for now
          </SkipBtn>
        </ButtonRow>
      </Card>
    </Container>
  );
}
