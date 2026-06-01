import styled from 'styled-components';

/* ─── styled ─── */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 2px;
`;

const EmptyMsg = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: ${p => p.theme.muted};
  font-size: 0.95rem;
`;

const Card = styled.div`
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 36px 32px;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  text-align: center;
  box-shadow: ${p => p.theme.shadow};
  transition: box-shadow 0.15s, transform 0.12s;

  &:hover {
    box-shadow: ${p => p.theme.shadowLg};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FrontTerm = styled.div`
  font-size: 2.4rem;
  font-weight: 800;
  color: ${p => p.theme.text};
  letter-spacing: -0.03em;
  line-height: 1.2;
`;

const FlipHint = styled.div`
  font-size: 0.75rem;
  color: ${p => p.theme.muted};
  margin-top: 12px;
  letter-spacing: 0.02em;
`;

const BackLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${p => p.theme.primary};
  margin-bottom: 12px;
`;

const BackDef = styled.div`
  font-size: 1.08rem;
  color: ${p => p.theme.text};
  line-height: 1.7;
  max-width: 460px;
  white-space: pre-line;
`;

const NavRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
`;

const NavBtn = styled.button`
  padding: 11px 26px;
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 600;
  font-size: 0.95rem;
  color: ${p => p.theme.text};
  transition: all 0.14s ease;

  &:hover:not(:disabled) {
    background: ${p => p.theme.btnHover};
    border-color: ${p => p.theme.borderStrong};
    transform: translateY(-1px);
    box-shadow: ${p => p.theme.shadowLg};
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

const FlipBtn = styled(NavBtn)`
  background: ${p => p.theme.primaryMuted};
  border-color: transparent;
  color: ${p => p.theme.primary};
  font-weight: 700;

  &:hover:not(:disabled) {
    background: ${p => p.theme.primary};
    border-color: transparent;
    color: #fff;
  }
`;

const CardIndex = styled.div`
  text-align: center;
  font-size: 0.82rem;
  color: ${p => p.theme.muted};
  letter-spacing: 0.02em;
`;

const HintRow = styled.div`
  text-align: center;
  font-size: 0.74rem;
  color: ${p => p.theme.muted};
  letter-spacing: 0.01em;
`;

/* ─── component ─── */

export default function FlashCards({ word, showBack, position, total, onFlip, onNext, onPrev }) {
  const hasWords = total > 0 && word != null;

  if (!hasWords) {
    return (
      <Wrapper>
        <EmptyMsg>
          {total === 0
            ? 'No words in this deck yet. Add some words to get started!'
            : 'No cards to display.'}
        </EmptyMsg>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Card onClick={onFlip}>
        {showBack ? (
          <>
            <BackLabel>Definition</BackLabel>
            <BackDef>{word.translation || '—'}</BackDef>
          </>
        ) : (
          <>
            <FrontTerm>{word.term}</FrontTerm>
            <FlipHint>click to reveal definition</FlipHint>
          </>
        )}
      </Card>

      <NavRow>
        <NavBtn onClick={onPrev} disabled={total <= 1}>←</NavBtn>
        <FlipBtn onClick={onFlip}>Flip</FlipBtn>
        <NavBtn onClick={onNext} disabled={total <= 1}>→</NavBtn>
      </NavRow>

      <CardIndex>
        {position} / {total}
      </CardIndex>

      <HintRow>Space · flip &nbsp;·&nbsp; ← → · navigate</HintRow>
    </Wrapper>
  );
}
