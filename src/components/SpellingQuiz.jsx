import { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';

/* ─── styled ─── */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${p => (p.$large ? '22px' : '18px')};
`;

const PromptBox = styled.div`
  background: ${p =>
    p.$phase === 'correct'
      ? '#f0fdf4'
      : p.$phase === 'wrong'
        ? '#fef2f2'
        : p.theme.panel};
  border: 1px solid
    ${p =>
      p.$phase === 'correct'
        ? '#86efac'
        : p.$phase === 'wrong'
          ? '#fca5a5'
          : p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: ${p => (p.$large ? '52px 36px' : '36px 28px')};
  text-align: center;
  font-size: ${p => (p.$phase !== 'input' ? (p.$large ? '2.1rem' : '1.6rem') : p.$large ? '1.35rem' : '1.15rem')};
  font-weight: 600;
  color: ${p =>
    p.$phase === 'correct'
      ? '#15803d'
      : p.$phase === 'wrong'
        ? '#dc2626'
        : p.theme.text};
  min-height: ${p => (p.$large ? '220px' : '110px')};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${p =>
    p.$phase === 'correct'
      ? '0 4px 14px rgba(22,163,74,0.12)'
      : p.$phase === 'wrong'
        ? '0 4px 14px rgba(220,38,38,0.10)'
        : p.theme.shadow};
  transition: background 0.12s, border-color 0.12s, color 0.12s, box-shadow 0.12s;
  user-select: none;
  letter-spacing: ${p => p.$phase !== 'input' ? '-0.01em' : '0'};
`;

const HintRow = styled.div`
  text-align: center;
  font-size: 0.75rem;
  color: ${p => p.theme.muted};
  letter-spacing: 0.02em;
`;

const InputRow = styled.div`
  display: flex;
  gap: 12px;
`;

const SpellInput = styled.input`
  flex: 1;
  padding: ${p => (p.$large ? '14px 18px' : '12px 16px')};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  outline: none;
  font-size: ${p => (p.$large ? '1.05rem' : '1rem')};
  background: #fff;

  &:focus {
    border-color: ${p => p.theme.primary};
  }

  &:disabled {
    opacity: 0.45;
    background: ${p => p.theme.btnBg};
    cursor: default;
  }
`;

const largeBtnCss = css`
  padding: 14px 32px;
  font-size: 1.05rem;
`;

const CheckBtn = styled.button`
  padding: 12px 26px;
  background: linear-gradient(135deg, ${p => p.theme.primary}, ${p => p.theme.primaryStrong});
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.16s ease;

  ${p => p.$large && largeBtnCss}

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${p => p.theme.shadowPrimary};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const NavRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
`;

const NavBtn = styled.button`
  padding: ${p => (p.$large ? '13px 32px' : '10px 22px')};
  background: ${p => p.theme.panel};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 600;
  font-size: ${p => (p.$large ? '1rem' : '0.92rem')};
  color: ${p => p.theme.text};
  transition: all 0.16s ease;

  &:hover:not(:disabled) {
    background: ${p => p.theme.btnHover};
    border-color: ${p => p.theme.borderStrong};
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0,0,0,0.07);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const SpellIndex = styled.div`
  font-size: 0.85rem;
  color: ${p => p.theme.muted};
  text-align: center;
`;

/* ─── component ─── */

export default function SpellingQuiz({
  word,
  position,
  total,
  onCheck,
  onNext,
  onPrev,
  large = false,
}) {
  const [input, setInput] = useState('');
  // phase: 'input' | 'correct' | 'wrong'
  const [phase, setPhase] = useState('input');
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const advanceRef = useRef(null);

  const empty = !word;
  const showing = phase !== 'input';

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  /* keep advanceRef current so the Enter-skip handler never captures stale closures */
  advanceRef.current = function advance() {
    clearTimer();
    setPhase('input');
    setInput('');
    onNext();
  };

  /* reset when word changes */
  useEffect(() => {
    clearTimer();
    setInput('');
    setPhase('input');
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word?.id, position]);

  /* cleanup on unmount */
  useEffect(() => () => clearTimer(), []);

  /* capture Enter globally while showing feedback so user can skip it */
  useEffect(() => {
    if (!showing) return;
    const handler = e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopImmediatePropagation();
        advanceRef.current();
      }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [showing]);

  const doCheck = async () => {
    if (showing || empty || !input.trim()) return;
    const result = await onCheck(input);
    if (!result) return;

    setInput('');
    const isCorrect = result.correct;
    setPhase(isCorrect ? 'correct' : 'wrong');

    clearTimer();
    timerRef.current = setTimeout(() => advanceRef.current(), isCorrect ? 800 : 1200);
  };

  const doNext = () => {
    if (showing) return;
    clearTimer();
    setInput('');
    setPhase('input');
    onNext();
  };

  const doPrev = () => {
    if (showing) return;
    clearTimer();
    setInput('');
    setPhase('input');
    onPrev();
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      doCheck();
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      doNext();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      doPrev();
    }
  };

  const promptContent = showing
    ? word?.term
    : empty
      ? 'No words yet.'
      : word.translation;

  return (
    <Wrapper $large={large}>
      <PromptBox $phase={phase} $large={large}>
        {promptContent}
      </PromptBox>

      <InputRow>
        <SpellInput
          ref={inputRef}
          $large={large}
          type="text"
          placeholder="Type the English word…"
          value={input}
          disabled={empty || showing}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <CheckBtn $large={large} disabled={empty || showing} onClick={doCheck}>
          Check
        </CheckBtn>
      </InputRow>

      <NavRow>
        <NavBtn $large={large} disabled={empty || showing} onClick={doPrev}>
          ←
        </NavBtn>
        <NavBtn $large={large} disabled={empty || showing} onClick={doNext}>
          →
        </NavBtn>
      </NavRow>

      <SpellIndex>{empty ? '' : `${position} / ${total}`}</SpellIndex>

      {!empty && (
        <HintRow>
          {showing
            ? 'Press Enter to continue'
            : 'Enter · check &nbsp;·&nbsp; ← → · navigate'}
        </HintRow>
      )}
    </Wrapper>
  );
}
