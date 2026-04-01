import { useState } from 'react';
import styled from 'styled-components';

const Section = styled.div`
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 26px 28px;
`;

const Heading = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 14px;
  color: ${p => p.theme.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 14px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
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
  margin-top: 14px;
  padding: 12px 32px;
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
  margin-top: 16px;
  font-size: 0.88rem;
  color: ${p => p.theme.muted};
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
