import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 32px;
  min-height: 100%;
  background: linear-gradient(135deg, #f5fffb 0%, #ecfdf5 100%);
`;

const Card = styled.div`
  background: ${p => p.theme.panel};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 32px;
  text-align: center;
  max-width: 450px;
  box-shadow: ${p => p.theme.shadowLg};
`;

const CelebrationEmoji = styled.div`
  font-size: 4rem;
  margin-bottom: 12px;
  animation: bounce 0.6s ease-in-out;

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #15803d;
  margin-bottom: 24px;
`;

const Summary = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 24px 0;
`;

const SummaryItem = styled.div`
  padding: 16px;
  background: ${p => p.theme.btnBg};
  border-radius: ${p => p.theme.radiusSm};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.div`
  font-size: 0.8rem;
  color: ${p => p.theme.textSecondary};
  font-weight: 500;
`;

const Value = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${p => p.theme.primary};
`;

const QuizPrompt = styled.div`
  margin: 24px 0;
  padding: 16px;
  background: ${p => p.theme.primaryMuted};
  border-radius: ${p => p.theme.radiusSm};
  font-size: 0.9rem;
  color: ${p => p.theme.text};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
`;

const Button = styled.button`
  padding: 12px 24px;
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

const QuizBtn = styled(Button)`
  background: ${p => p.theme.primary};
  color: #fff;
  flex: 1;

  &:hover:not(:disabled) {
    background: ${p => p.theme.primaryStrong};
  }
`;

const HomeBtn = styled(Button)`
  background: ${p => p.theme.btnBg};
  color: ${p => p.theme.text};
  border: 1px solid ${p => p.theme.border};
  flex: 1;

  &:hover:not(:disabled) {
    background: ${p => p.theme.btnHover};
  }
`;

export default function DailyStudyCompletion({
  reviewed = 0,
  mastered = 0,
  accuracy = null,
  streak = 0,
  onStartQuiz,
  onExit,
  disabled = false
}) {
  return (
    <Container>
      <Card>
        <CelebrationEmoji>🎉</CelebrationEmoji>
        <Title>Great Job!</Title>

        <Summary>
          <SummaryItem>
            <Label>✅ Words Reviewed</Label>
            <Value>{reviewed}</Value>
          </SummaryItem>
          <SummaryItem>
            <Label>🏆 Words Mastered</Label>
            <Value>{mastered}</Value>
          </SummaryItem>
          {accuracy !== null && (
            <SummaryItem>
              <Label>📊 Accuracy</Label>
              <Value>{accuracy}%</Value>
            </SummaryItem>
          )}
          {streak > 0 && (
            <SummaryItem>
              <Label>⚡ Current Streak</Label>
              <Value>{streak}d</Value>
            </SummaryItem>
          )}
        </Summary>

        <QuizPrompt>
          Want to test your memory with a spelling quiz? It helps lock in what you just learned!
        </QuizPrompt>

        <ButtonRow>
          <QuizBtn onClick={onStartQuiz} disabled={disabled || reviewed === 0}>
            Try Spelling Quiz
          </QuizBtn>
          <HomeBtn onClick={onExit} disabled={disabled}>
            Skip & Go Home
          </HomeBtn>
        </ButtonRow>
      </Card>
    </Container>
  );
}
