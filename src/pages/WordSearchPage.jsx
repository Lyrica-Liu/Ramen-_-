import { useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: ${p => p.theme.bodyBg};
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

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: ${p => p.theme.textSecondary};
  text-align: center;
  margin-bottom: 32px;
`;

const SearchBox = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  font-size: 0.95rem;
  color: ${p => p.theme.text};
  background: ${p => p.theme.bodyBg};

  &:focus {
    outline: none;
    border-color: ${p => p.theme.primary};
    box-shadow: 0 0 0 3px ${p => p.theme.primaryMuted};
  }

  &::placeholder {
    color: ${p => p.theme.textSecondary};
  }
`;

const SearchBtn = styled.button`
  padding: 12px 24px;
  background: ${p => p.theme.primary};
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s ease;

  &:hover:not(:disabled) {
    background: ${p => p.theme.primaryStrong};
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const ErrorMessage = styled.div`
  color: #d87a7a;
  background: #ffe8e8;
  padding: 12px 16px;
  border-radius: ${p => p.theme.radiusSm};
  margin-bottom: 16px;
  font-size: 0.9rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: ${p => p.theme.textSecondary};
  padding: 24px;
  font-size: 0.95rem;
`;

const PreviewCard = styled.div`
  background: ${p => p.theme.bodyBg};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  padding: 20px;
  margin-bottom: 24px;
`;

const WordTerm = styled.h2`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  margin-bottom: 12px;
`;

const Definition = styled.p`
  font-size: 0.95rem;
  color: ${p => p.theme.text};
  margin-bottom: 16px;
  line-height: 1.5;
`;

const Example = styled.p`
  font-size: 0.85rem;
  color: ${p => p.theme.textSecondary};
  font-style: italic;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 3px solid ${p => p.theme.primary};
`;

const MCOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
`;

const Option = styled.div`
  padding: 12px;
  background: ${p => p.theme.btnBg};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  font-size: 0.9rem;
  color: ${p => p.theme.text};
`;

const ModeButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ModeBtn = styled.button`
  flex: 1;
  padding: 12px 16px;
  background: ${p => p.$primary ? p.theme.primary : p.theme.btnBg};
  color: ${p => p.$primary ? '#fff' : p.theme.text};
  border: 1px solid ${p => p.$primary ? 'transparent' : p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const SuccessBox = styled.div`
  background: #F5FFFB;
  border: 1px solid #B3E8D9;
  border-radius: ${p => p.theme.radiusSm};
  padding: 24px;
  text-align: center;
  margin-bottom: 24px;
`;

const SuccessIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 12px;
`;

const SuccessMsg = styled.p`
  font-size: 1.1rem;
  font-weight: 600;
  color: #55C89A;
  margin-bottom: 8px;
`;

const SuccessDetail = styled.p`
  font-size: 0.9rem;
  color: ${p => p.theme.textSecondary};
  margin-bottom: 16px;
`;

export default function WordSearchPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedWord, setSavedWord] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError('');
    setSearchResult(null);
    setSavedWord(null);

    try {
      const response = await fetch(`/api/books/${bookId}/words/search?term=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Word not found');
      }
      const data = await response.json();
      setSearchResult(data);
    } catch (err) {
      setError(err.message || 'Failed to search word. Try another term.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLearnMode = async () => {
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/books/${bookId}/words/from-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm })
      });
      if (!response.ok) {
        throw new Error('Failed to save word');
      }
      const word = await response.json();
      setSavedWord(word);
      setSearchResult(null);
      setSearchTerm('');
    } catch (err) {
      setError('Failed to save word: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>📚 Learn Vocabulary</Title>
        <Subtitle>Search for any word to begin</Subtitle>

        {savedWord && (
          <>
            <SuccessBox>
              <SuccessIcon>✅</SuccessIcon>
              <SuccessMsg>Word Added!</SuccessMsg>
              <SuccessDetail>"{savedWord.term}" has been added to your collection.</SuccessDetail>
            </SuccessBox>

            <ModeButtons>
              <ModeBtn $primary onClick={() => setSearchTerm('')}>
                Search Another
              </ModeBtn>
              <ModeBtn onClick={() => navigate(`/book/${bookId}`)}>
                Back to Collection
              </ModeBtn>
            </ModeButtons>
          </>
        )}

        {!savedWord && (
          <>
            <SearchBox>
              <SearchInput
                type="text"
                placeholder="e.g., coincidentally"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              />
              <SearchBtn onClick={handleSearch} disabled={isLoading || !searchTerm.trim()}>
                {isLoading ? 'Searching...' : 'Search'}
              </SearchBtn>
            </SearchBox>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {isLoading && <LoadingMessage>Searching word definition...</LoadingMessage>}

            {searchResult && (
              <div>
                <PreviewCard>
                  <WordTerm>{searchResult.term}</WordTerm>
                  <Definition>{searchResult.definition}</Definition>
                  {searchResult.example && <Example>"{searchResult.example}"</Example>}
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Multiple choice options:
                    </p>
                    <MCOptions>
                      {searchResult.distractors.map((option, i) => (
                        <Option key={i}>{option}</Option>
                      ))}
                    </MCOptions>
                  </div>
                </PreviewCard>

                <ModeButtons>
                  <ModeBtn $primary onClick={handleLearnMode} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Learn Mode'}
                  </ModeBtn>
                  <ModeBtn onClick={() => setSearchResult(null)}>
                    Search Again
                  </ModeBtn>
                </ModeButtons>
              </div>
            )}
          </>
        )}
      </Card>
    </Container>
  );
}
