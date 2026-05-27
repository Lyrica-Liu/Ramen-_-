import { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, #f5fffb 0%, #ecfdf5 100%);
`;

const Card = styled.div`
  background: ${p => p.theme.panel};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 32px;
  max-width: 500px;
  width: 100%;
  box-shadow: ${p => p.theme.shadowLg};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const WordTitle = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  margin-bottom: 8px;
`;

const Question = styled.p`
  font-size: 0.95rem;
  color: ${p => p.theme.textSecondary};
`;

const MCOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const Option = styled.button`
  padding: 16px;
  background: ${p => p.$selected ? p.theme.primary : p.theme.btnBg};
  color: ${p => p.$selected ? '#fff' : p.theme.text};
  border: 2px solid ${p => p.$selected ? p.theme.primary : p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.16s ease;
  text-align: left;

  &:hover:not(:disabled) {
    border-color: ${p => p.theme.primary};
    background: ${p => p.$selected ? p.theme.primary : p.theme.bodyBg};
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const RevealBox = styled.div`
  background: ${p => p.$correct ? '#F5FFFB' : '#FFE8E8'};
  border: 1px solid ${p => p.$correct ? '#B3E8D9' : '#FFAAAA'};
  border-radius: ${p => p.theme.radiusSm};
  padding: 20px;
  margin-bottom: 24px;
  text-align: center;
`;

const ResultIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 12px;
`;

const ResultText = styled.p`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${p => p.$correct ? '#55C89A' : '#D87A7A'};
  margin-bottom: 16px;
`;

const DefinitionBox = styled.div`
  background: ${p => p.theme.bodyBg};
  border-radius: ${p => p.theme.radiusSm};
  padding: 16px;
  margin-bottom: 12px;
`;

const Label = styled.p`
  font-size: 0.8rem;
  color: ${p => p.theme.textSecondary};
  font-weight: 600;
  margin-bottom: 4px;
`;

const Content = styled.p`
  font-size: 0.95rem;
  color: ${p => p.theme.text};
  line-height: 1.5;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
`;

const Btn = styled.button`
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const PrimaryBtn = styled(Btn)`
  background: ${p => p.theme.primary};
  color: #fff;

  &:hover:not(:disabled) {
    background: ${p => p.theme.primaryStrong};
  }
`;

const SecondaryBtn = styled(Btn)`
  background: ${p => p.theme.btnBg};
  color: ${p => p.theme.text};
  border: 1px solid ${p => p.theme.border};

  &:hover:not(:disabled) {
    background: ${p => p.theme.btnHover};
  }
`;

export default function LearnMode({ word, mcQuestion, onComplete, distractors, definition, example }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (distractors && definition) {
      const allOptions = [...distractors, definition].sort(() => Math.random() - 0.5);
      setOptions(allOptions);
    }
  }, [distractors, definition]);

  const handleSelectOption = (idx) => {
    if (!isRevealed) {
      setSelectedIdx(idx);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedIdx === null) return;
    setIsRevealed(true);
    setIsCorrect(options[selectedIdx] === definition);
  };

  const handleContinue = () => {
    if (onComplete) {
      onComplete(isCorrect);
    }
  };

  return (
    <Container>
      <Card>
        <Header>
          <WordTitle>{word}</WordTitle>
          <Question>Which is the correct meaning?</Question>
        </Header>

        {!isRevealed ? (
          <>
            <MCOptions>
              {options.map((option, idx) => (
                <Option
                  key={idx}
                  $selected={selectedIdx === idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isRevealed}
                >
                  {option}
                </Option>
              ))}
            </MCOptions>

            <ButtonRow>
              <PrimaryBtn onClick={handleCheckAnswer} disabled={selectedIdx === null}>
                Check Answer
              </PrimaryBtn>
            </ButtonRow>
          </>
        ) : (
          <>
            <RevealBox $correct={isCorrect}>
              <ResultIcon>{isCorrect ? '✅' : '❌'}</ResultIcon>
              <ResultText $correct={isCorrect}>
                {isCorrect ? 'Correct!' : 'Not quite'}
              </ResultText>
              <DefinitionBox>
                <Label>Correct Answer:</Label>
                <Content>{definition}</Content>
              </DefinitionBox>
              {example && (
                <DefinitionBox>
                  <Label>Example:</Label>
                  <Content>"{example}"</Content>
                </DefinitionBox>
              )}
            </RevealBox>

            <ButtonRow>
              <PrimaryBtn onClick={handleContinue}>
                Continue
              </PrimaryBtn>
            </ButtonRow>
          </>
        )}
      </Card>
    </Container>
  );
}
