import { useState } from 'react';
import styled from 'styled-components';

const Section = styled.div`
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 22px 24px;
`;

const Heading = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${p => p.theme.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 140px;
  padding: 12px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 10px;
  resize: vertical;
  font-size: 0.95rem;
  line-height: 1.6;
  outline: none;
  background: #fff;

  &:focus {
    border-color: ${p => p.theme.primary};
  }
`;

const SaveBtn = styled.button`
  margin-top: 12px;
  padding: 10px 28px;
  background: ${p => p.theme.primary};
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radius};
  font-weight: 600;

  &:hover {
    background: ${p => p.theme.primaryStrong};
    transform: translateY(-1px);
  }
`;

const Hint = styled.p`
  margin-top: 14px;
  font-size: 0.88rem;
  color: #9ca3af;
  line-height: 1.7;
`;

export default function AddWords({ onSave }) {
  const [text, setText] = useState('');

  const handleSave = async () => {
    if (!text.trim()) {
      alert('Please enter at least one line');
      return;
    }
    const ok = await onSave(text);
    if (ok) setText('');
  };

  return (
    <Section>
      <Heading>Add multiple words</Heading>
      <TextArea
        placeholder={'apple 苹果\nbanana 香蕉'}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <SaveBtn onClick={handleSave}>Save Words</SaveBtn>
      <Hint>
        Enter one word per line: <strong>word translation</strong>
        <br />
        Example: <code>apple 苹果</code>
      </Hint>
    </Section>
  );
}
