import { useState, useRef } from 'react';
import styled from 'styled-components';
import * as api from '../api';

/* ─── styled ─── */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 2px;
`;

const SearchRow = styled.form`
  display: flex;
  gap: 10px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 13px 16px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  font-size: 1rem;
  color: ${p => p.theme.text};
  background: ${p => p.theme.bg};
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: ${p => p.theme.primary};
    box-shadow: 0 0 0 3px ${p => p.theme.primaryMuted};
  }

  &::placeholder {
    color: ${p => p.theme.muted};
  }
`;

const SearchBtn = styled.button`
  padding: 13px 24px;
  background: ${p => p.theme.primary};
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 700;
  font-size: 0.95rem;
  white-space: nowrap;
  transition: all 0.16s ease;

  &:hover:not(:disabled) {
    background: ${p => p.theme.primaryStrong};
    transform: translateY(-1px);
    box-shadow: ${p => p.theme.shadowPrimary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const ErrorBox = styled.div`
  padding: 12px 16px;
  background: ${p => p.theme.hardBg};
  border: 1px solid ${p => p.theme.hardBorder};
  border-radius: ${p => p.theme.radiusSm};
  color: ${p => p.theme.hardText};
  font-size: 0.92rem;
`;

const Loading = styled.div`
  text-align: center;
  padding: 24px;
  color: ${p => p.theme.textSecondary};
  font-size: 0.95rem;
`;

const ResultCard = styled.div`
  background: ${p => p.theme.bg};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 20px 22px;
`;

const WordHeading = styled.div`
  font-size: 1.7rem;
  font-weight: 800;
  color: ${p => p.theme.text};
  letter-spacing: -0.02em;
  margin-bottom: 4px;
`;

const PosLabel = styled.span`
  display: inline-block;
  padding: 2px 9px;
  background: ${p => p.theme.primaryMuted};
  color: ${p => p.theme.primary};
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 14px;
`;

const MeaningsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
`;

const MeaningRow = styled.label`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 14px;
  border: 1.5px solid ${p => p.$checked ? p.theme.primary : p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  background: ${p => p.$checked ? p.theme.primaryMuted : p.theme.panel};
  cursor: pointer;
  transition: all 0.13s ease;

  &:hover {
    border-color: ${p => p.theme.primary};
    background: ${p => p.theme.primaryMuted};
  }
`;

const Checkbox = styled.input`
  margin-top: 2px;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  accent-color: ${p => p.theme.primary};
  cursor: pointer;
`;

const MeaningText = styled.div`
  flex: 1;
`;

const DefText = styled.div`
  font-size: 0.93rem;
  color: ${p => p.theme.text};
  line-height: 1.5;
`;

const ExampleText = styled.div`
  font-size: 0.82rem;
  color: ${p => p.theme.textSecondary};
  font-style: italic;
  margin-top: 4px;
  padding-left: 10px;
  border-left: 2px solid ${p => p.theme.border};
`;

const ActionRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const SelectAllBtn = styled.button`
  padding: 8px 14px;
  background: transparent;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  font-size: 0.85rem;
  font-weight: 600;
  color: ${p => p.theme.textSecondary};
  transition: all 0.13s ease;

  &:hover {
    border-color: ${p => p.theme.borderStrong};
    color: ${p => p.theme.text};
    background: ${p => p.theme.btnHover};
  }
`;

const AddBtn = styled.button`
  flex: 1;
  padding: 12px 20px;
  background: ${p => p.theme.primary};
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.16s ease;

  &:hover:not(:disabled) {
    background: ${p => p.theme.primaryStrong};
    transform: translateY(-1px);
    box-shadow: ${p => p.theme.shadowPrimary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const SuccessBox = styled.div`
  padding: 18px 20px;
  background: ${p => p.theme.completeBg};
  border: 1.5px solid ${p => p.theme.completeBorder};
  border-radius: ${p => p.theme.radius};
  text-align: center;
`;

const SuccessWord = styled.div`
  font-size: 1.4rem;
  font-weight: 800;
  color: ${p => p.theme.text};
  letter-spacing: -0.02em;
  margin-bottom: 4px;
`;

const SuccessMsg = styled.div`
  font-size: 0.92rem;
  color: ${p => p.theme.easyText};
  font-weight: 600;
  margin-bottom: 14px;
`;

const SearchAnotherBtn = styled.button`
  padding: 10px 22px;
  background: ${p => p.theme.primary};
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  font-weight: 700;
  font-size: 0.92rem;
  transition: all 0.16s ease;

  &:hover {
    background: ${p => p.theme.primaryStrong};
    transform: translateY(-1px);
    box-shadow: ${p => p.theme.shadowPrimary};
  }
`;

const EmptyHint = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${p => p.theme.muted};
  font-size: 0.95rem;
  line-height: 1.7;
`;

/* ─── component ─── */

export default function AddWordPanel({ bookId, onWordAdded }) {
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // AllMeaningsResult
  const [selected, setSelected] = useState(new Set()); // indices of selected meanings
  const [saving, setSaving] = useState(false);
  const [addedWord, setAddedWord] = useState(null);
  const inputRef = useRef(null);

  async function handleSearch(e) {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setResult(null);
    setAddedWord(null);

    try {
      const data = await api.searchWordMeanings(bookId, q);
      if (!data || !data.meanings || data.meanings.length === 0) {
        setError(`No definitions found for "${q}". Try a different spelling.`);
      } else {
        setResult(data);
        // select all by default
        setSelected(new Set(data.meanings.map((_, i) => i)));
      }
    } catch {
      setError('Search failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function toggleMeaning(idx) {
    setSelected(prev => {
      const s = new Set(prev);
      if (s.has(idx)) s.delete(idx);
      else s.add(idx);
      return s;
    });
  }

  function selectAll() {
    if (!result) return;
    if (selected.size === result.meanings.length) {
      setSelected(new Set([0])); // keep at least one
    } else {
      setSelected(new Set(result.meanings.map((_, i) => i)));
    }
  }

  async function handleAdd() {
    if (!result || selected.size === 0) return;
    setSaving(true);
    setError('');

    const defs = [...selected]
      .sort((a, b) => a - b)
      .map(i => result.meanings[i].definition);

    try {
      const word = await api.addWordFromSearch(bookId, result.term, defs);
      setAddedWord(word);
      setResult(null);
      setTerm('');
      onWordAdded(word);
    } catch {
      setError('Failed to add word. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setAddedWord(null);
    setResult(null);
    setError('');
    setTerm('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  /* group meanings by part of speech for display */
  const grouped = result
    ? result.meanings.reduce((acc, m, i) => {
        const pos = m.partOfSpeech || 'other';
        if (!acc[pos]) acc[pos] = [];
        acc[pos].push({ ...m, idx: i });
        return acc;
      }, {})
    : {};

  return (
    <Wrapper>
      {addedWord ? (
        <SuccessBox>
          <SuccessWord>{addedWord.term}</SuccessWord>
          <SuccessMsg>Added to your deck</SuccessMsg>
          <SearchAnotherBtn onClick={reset}>Search Another Word</SearchAnotherBtn>
        </SuccessBox>
      ) : (
        <>
          <SearchRow onSubmit={handleSearch}>
            <SearchInput
              ref={inputRef}
              type="text"
              placeholder="e.g. coincidentally"
              value={term}
              onChange={e => setTerm(e.target.value)}
              autoFocus
            />
            <SearchBtn type="submit" disabled={loading || !term.trim()}>
              {loading ? 'Searching…' : 'Search'}
            </SearchBtn>
          </SearchRow>

          {error && <ErrorBox>{error}</ErrorBox>}
          {loading && <Loading>Looking up "{term}"…</Loading>}

          {result && (
            <ResultCard>
              <WordHeading>{result.term}</WordHeading>

              {Object.entries(grouped).map(([pos, entries]) => (
                <div key={pos}>
                  <PosLabel>{pos}</PosLabel>
                  <MeaningsList>
                    {entries.map(({ idx, definition, example }) => (
                      <MeaningRow
                        key={idx}
                        $checked={selected.has(idx)}
                        onClick={() => toggleMeaning(idx)}
                      >
                        <Checkbox
                          type="checkbox"
                          checked={selected.has(idx)}
                          onChange={() => toggleMeaning(idx)}
                          onClick={e => e.stopPropagation()}
                        />
                        <MeaningText>
                          <DefText>{definition}</DefText>
                          {example && <ExampleText>"{example}"</ExampleText>}
                        </MeaningText>
                      </MeaningRow>
                    ))}
                  </MeaningsList>
                </div>
              ))}

              <ActionRow>
                <SelectAllBtn type="button" onClick={selectAll}>
                  {selected.size === result.meanings.length ? 'Deselect All' : 'Select All'}
                </SelectAllBtn>
                <AddBtn onClick={handleAdd} disabled={saving || selected.size === 0}>
                  {saving
                    ? 'Adding…'
                    : `Add Card (${selected.size} meaning${selected.size !== 1 ? 's' : ''})`}
                </AddBtn>
              </ActionRow>
            </ResultCard>
          )}

          {!result && !loading && !error && (
            <EmptyHint>
              Search any SAT vocabulary word to see its definitions,
              then choose which meanings to include on your flashcard.
            </EmptyHint>
          )}
        </>
      )}
    </Wrapper>
  );
}
