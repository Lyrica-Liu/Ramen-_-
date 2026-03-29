import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

/* ─── styled ─── */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const PromptBox = styled.div`
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 30px 24px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${p => p.theme.text};
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InputRow = styled.div`
  display: flex;
  gap: 10px;
`;

const SpellInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 10px;
  outline: none;
  font-size: 1rem;
  background: #fff;

  &:focus {
    border-color: ${p => p.theme.primary};
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const CheckBtn = styled.button`
  padding: 10px 22px;
  background: ${p => p.theme.primary};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 600;

  &:hover:not(:disabled) {
    background: ${p => p.theme.primaryStrong};
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;

const NavRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
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

const SpellIndex = styled.div`
  font-size: 0.85rem;
  color: #9ca3af;
  text-align: center;
`;

const Feedback = styled.div`
  text-align: center;
  font-size: 0.95rem;
  min-height: 1.5em;
  color: ${p => p.theme.text};
`;

/* ─── component ─── */

export default function SpellingQuiz({ word, position, total, onCheck, onNext, onPrev }) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const inputRef = useRef(null);
  const empty = !word;

  /* Clear input when word changes */
  useEffect(() => {
    setInput('');
    setFeedback('');
  }, [word?.id, position]);

  const doCheck = async () => {
    if (empty) return;
    const result = await onCheck(input);
    if (result) {
      setFeedback(result.message);
      if (result.correct) setInput('');
    }
  };

  const doNext = () => {
    setInput('');
    setFeedback('');
    onNext();
  };

  const doPrev = () => {
    setInput('');
    setFeedback('');
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

  return (
    <Wrapper>
      <PromptBox>{empty ? 'No words yet.' : word.translation}</PromptBox>

      <InputRow>
        <SpellInput
          ref={inputRef}
          type="text"
          placeholder="Type the English word…"
          value={input}
          disabled={empty}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <CheckBtn disabled={empty} onClick={doCheck}>
          Check
        </CheckBtn>
      </InputRow>

      <NavRow>
        <NavBtn disabled={empty} onClick={doPrev}>
          ←
        </NavBtn>
        <NavBtn disabled={empty} onClick={doNext}>
          →
        </NavBtn>
      </NavRow>

      <SpellIndex>{empty ? '' : `${position}/${total}`}</SpellIndex>

      <Feedback>{feedback}</Feedback>
    </Wrapper>
  );
}
