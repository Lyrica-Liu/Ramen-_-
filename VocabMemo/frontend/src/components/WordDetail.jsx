import { useEffect, useRef } from 'react';
import styled from 'styled-components';

/* ─── helpers ─── */

function levelColor(level) {
  if (level <= 2) return '#ef4444';
  if (level <= 4) return '#f59e0b';
  return '#22c55e';
}

function levelLabel(level) {
  if (level <= 2) return 'Beginner';
  if (level <= 4) return 'Familiar';
  return 'Mastered';
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatNextReview(isoStr) {
  if (!isoStr) return '—';
  const next = new Date(isoStr);
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextMid = new Date(next.getFullYear(), next.getMonth(), next.getDate());
  const diff = Math.round((nextMid - todayMid) / (1000 * 60 * 60 * 24));
  const dateStr = next.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  if (diff <= 0) return `Today · ${dateStr}`;
  if (diff === 1) return `Tomorrow · ${dateStr}`;
  return `in ${diff} days · ${dateStr}`;
}

/* ─── styled ─── */

const Panel = styled.div`
  position: fixed;
  z-index: 900;
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 20px 22px 18px;
  min-width: 260px;
  max-width: 310px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.10);
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 12px;
  background: none;
  border: none;
  font-size: 1rem;
  color: ${p => p.theme.muted};
  cursor: pointer;
  padding: 2px 7px;
  border-radius: 6px;
  line-height: 1;

  &:hover {
    background: ${p => p.theme.btnHover};
    color: ${p => p.theme.text};
  }
`;

const Term = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  padding-right: 24px;
  margin-bottom: 3px;
`;

const Translation = styled.div`
  font-size: 0.97rem;
  color: ${p => p.theme.textSecondary};
  margin-bottom: 14px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${p => p.theme.border};
  margin: 0 0 12px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.span`
  color: ${p => p.theme.muted};
  font-weight: 500;
`;

const Value = styled.span`
  color: ${p => p.theme.text};
  font-weight: 600;
  text-align: right;
`;

const LevelBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: ${p => p.theme.text};
`;

const LevelDot = styled.span`
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${p => p.$color};
  flex-shrink: 0;
`;

/* ─── component ─── */

export default function WordDetail({ word, x, y, onClose }) {
  const ref = useRef(null);

  /* position within viewport */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth || 310;
    const h = el.offsetHeight || 200;
    el.style.left = `${Math.max(8, Math.min(x + 12, window.innerWidth - w - 8))}px`;
    el.style.top = `${Math.max(8, Math.min(y, window.innerHeight - h - 8))}px`;
  }, [x, y]);

  if (!word) return null;

  const level = word.reviewLevel || 1;

  return (
    <Panel ref={ref} onClick={e => e.stopPropagation()}>
      <CloseBtn onClick={onClose}>✕</CloseBtn>
      <Term>{word.term}</Term>
      <Translation>{word.translation}</Translation>
      <Divider />
      <Row>
        <Label>Familiarity</Label>
        <Value>
          <LevelBadge>
            <LevelDot $color={levelColor(level)} />
            Level {level}/6 · {levelLabel(level)}
          </LevelBadge>
        </Value>
      </Row>
      <Row>
        <Label>Added</Label>
        <Value>{formatDate(word.createdTime)}</Value>
      </Row>
      <Row>
        <Label>Next review</Label>
        <Value>{formatNextReview(word.nextReviewTime)}</Value>
      </Row>
    </Panel>
  );
}
