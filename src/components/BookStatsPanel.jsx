import { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import * as api from '../api';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Wrapper = styled.div`
  padding: 4px 0;
  animation: ${fadeUp} 0.24s ease-out;
`;

const Box = styled.div`
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  box-shadow: ${p => p.theme.shadow};
  padding: 32px 36px;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 0;
  align-items: flex-start;
`;

/* ─── calendar side (left 50%) ─── */

const CalSide = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const SideLabel = styled.div`
  align-self: flex-start;
  font-size: 0.69rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: ${p => p.theme.muted};
`;

const CalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  max-width: ${7 * 38 + 6 * 8}px;
`;

const MonthLabel = styled.div`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.05rem;
  font-weight: 700;
  font-style: italic;
  color: ${p => p.theme.text};
  white-space: nowrap;
`;

const CalNavBtn = styled.button`
  padding: 5px 12px;
  border-radius: 999px;
  border: 1.5px solid ${p => p.theme.border};
  background: transparent;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${p => p.theme.textSecondary};
  transition: all 0.13s;
  flex-shrink: 0;
  &:hover:not(:disabled) { background: ${p => p.theme.btnHover}; color: ${p => p.theme.text}; border-color: ${p => p.theme.borderStrong}; }
  &:disabled { opacity: 0.35; cursor: default; }
`;

const CELL = 38;
const GAP  = 8;

const DayLabels = styled.div`
  display: grid;
  grid-template-columns: repeat(7, ${CELL}px);
  gap: ${GAP}px;
`;

const DayLabelCell = styled.div`
  width: ${CELL}px;
  text-align: center;
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${p => p.theme.muted};
  text-transform: uppercase;
`;

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, ${CELL}px);
  gap: ${GAP}px;
`;

const DayCell = styled.div`
  width: ${CELL}px;
  height: ${CELL}px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: ${p => p.$today ? 700 : 500};
  color: ${p => {
    if (p.$empty) return 'transparent';
    if (p.$today) return p.theme.primary;
    if (p.$level >= 3) return '#5A2A2A';
    return 'rgba(80,45,45,0.65)';
  }};
  background: ${p => p.$empty ? 'transparent' : p.$color};
  outline: ${p => p.$today ? `2px solid ${p.theme.primary}` : 'none'};
  outline-offset: 1px;
  visibility: ${p => p.$empty ? 'hidden' : 'visible'};
  cursor: default;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const LegendLabel = styled.span`
  font-size: 0.66rem;
  color: ${p => p.theme.muted};
`;

const LegendSwatch = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${p => p.$color};
`;

/* ─── divider ─── */

const Sep = styled.div`
  width: 1px;
  align-self: stretch;
  background: ${p => p.theme.border};
  margin: 0 32px;
  flex-shrink: 0;
`;

/* ─── stats side (right 50%) ─── */

const StatSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StatSideLabel = styled.div`
  font-size: 0.69rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: ${p => p.theme.muted};
  margin-bottom: 4px;
`;

const InsightList = styled.div`
  display: flex;
  flex-direction: column;
`;

const InsightRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid ${p => p.theme.border};
  &:last-child { border-bottom: none; }
`;

const InsightEmoji = styled.span`
  font-size: 1.3rem;
  line-height: 1;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
`;

const InsightContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const InsightLabel = styled.div`
  font-size: 0.69rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${p => p.theme.muted};
`;

const InsightValue = styled.div`
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: ${p => p.theme.text};
`;

const InsightSub = styled.div`
  font-size: 0.67rem;
  color: ${p => p.theme.muted};
  margin-top: 1px;
`;

/* ─── status ─── */

const StatusMsg = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: ${p => p.theme.muted};
  font-size: 0.92rem;
`;

/* ─── helpers ─── */

const HEAT_COLORS = [
  'rgba(196,132,138,0.10)',
  'rgba(196,132,138,0.30)',
  'rgba(196,132,138,0.54)',
  'rgba(196,132,138,0.78)',
  '#C4848A',
];

function heatLevel(count) {
  if (!count) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

function computeLongestStreak(daily) {
  let longest = 0, cur = 0;
  for (const d of daily) {
    if ((d.reviewedCount ?? 0) + (d.addedCount ?? 0) > 0) {
      cur++;
      if (cur > longest) longest = cur;
    } else {
      cur = 0;
    }
  }
  return longest;
}

const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

/* ─── component ─── */

export default function BookStatsPanel({ bookId, totalWords }) {
  const [streak, setStreak]       = useState(0);
  const [daily, setDaily]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    setError(false);
    Promise.all([
      api.fetchProgress(bookId),
      api.fetchBookDailyProgress(bookId, 365),
    ])
      .then(([progress, hist]) => {
        setStreak(progress.streak ?? 0);
        setDaily(hist);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [bookId]);

  const dailyMap = useMemo(() => {
    const m = {};
    for (const d of daily) m[d.date] = d;
    return m;
  }, [daily]);

  const year        = viewMonth.getFullYear();
  const month       = viewMonth.getMonth();
  const firstDow    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  }, []);

  const cells = useMemo(() => {
    const arr = [
      ...Array(firstDow).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [firstDow, daysInMonth]);

  const canGoNext = new Date(year, month + 1, 1) <= new Date(today.getFullYear(), today.getMonth(), 1);

  function toDateStr(day) {
    return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }
  function isToday(day) {
    return !!day && new Date(year, month, day).getTime() === today.getTime();
  }

  const daysStudied   = daily.filter(d => (d.reviewedCount ?? 0) + (d.addedCount ?? 0) > 0).length;
  const longestStreak = computeLongestStreak(daily);
  const avgPerDay     = daysStudied > 0 ? Math.round(totalWords / daysStudied) : totalWords;

  if (loading) return <StatusMsg>Loading…</StatusMsg>;
  if (error)   return <StatusMsg>Could not load statistics.</StatusMsg>;

  return (
    <Wrapper>
      <Box>
        {/* ── left 50%: calendar ── */}
        <CalSide>
          <SideLabel>Words Added</SideLabel>

          <CalHeader>
            <CalNavBtn onClick={() => setViewMonth(new Date(year, month - 1, 1))}>←</CalNavBtn>
            <MonthLabel>{MONTH_NAMES[month]} {year}</MonthLabel>
            <CalNavBtn onClick={() => setViewMonth(new Date(year, month + 1, 1))} disabled={!canGoNext}>→</CalNavBtn>
          </CalHeader>

          <DayLabels>
            {WEEKDAYS.map(d => <DayLabelCell key={d}>{d[0]}</DayLabelCell>)}
          </DayLabels>

          <DayGrid>
            {cells.map((day, i) => {
              if (!day) return <DayCell key={`e-${i}`} $empty />;
              const dateStr = toDateStr(day);
              const count   = dailyMap[dateStr]?.addedCount ?? 0;
              const level   = heatLevel(count);
              return (
                <DayCell
                  key={dateStr}
                  $color={HEAT_COLORS[level]}
                  $level={level}
                  $today={isToday(day)}
                  title={count ? `${count} words added` : undefined}
                >
                  {day}
                </DayCell>
              );
            })}
          </DayGrid>

          <Legend>
            <LegendLabel>Less</LegendLabel>
            {HEAT_COLORS.map((c, i) => <LegendSwatch key={i} $color={c} />)}
            <LegendLabel>More</LegendLabel>
          </Legend>
        </CalSide>

        <Sep />

        {/* ── right 50%: insights ── */}
        <StatSide>
          <StatSideLabel>Statistics</StatSideLabel>

          <InsightList>
            <InsightRow>
              <InsightEmoji>🔥</InsightEmoji>
              <InsightContent>
                <InsightLabel>Current Streak</InsightLabel>
                <InsightValue>{streak} {streak === 1 ? 'day' : 'days'}</InsightValue>
                {streak > 0 && <InsightSub>keep it going</InsightSub>}
              </InsightContent>
            </InsightRow>

            <InsightRow>
              <InsightEmoji>📅</InsightEmoji>
              <InsightContent>
                <InsightLabel>Days Studied</InsightLabel>
                <InsightValue>{daysStudied} {daysStudied === 1 ? 'day' : 'days'}</InsightValue>
              </InsightContent>
            </InsightRow>

            <InsightRow>
              <InsightEmoji>📚</InsightEmoji>
              <InsightContent>
                <InsightLabel>Words in Deck</InsightLabel>
                <InsightValue>{totalWords} {totalWords === 1 ? 'word' : 'words'}</InsightValue>
              </InsightContent>
            </InsightRow>

            <InsightRow>
              <InsightEmoji>🏆</InsightEmoji>
              <InsightContent>
                <InsightLabel>Best Streak</InsightLabel>
                <InsightValue>{longestStreak} {longestStreak === 1 ? 'day' : 'days'}</InsightValue>
              </InsightContent>
            </InsightRow>

            <InsightRow>
              <InsightEmoji>✨</InsightEmoji>
              <InsightContent>
                <InsightLabel>Avg Words / Day</InsightLabel>
                <InsightValue>{avgPerDay} {avgPerDay === 1 ? 'word' : 'words'}</InsightValue>
              </InsightContent>
            </InsightRow>
          </InsightList>
        </StatSide>
      </Box>
    </Wrapper>
  );
}
