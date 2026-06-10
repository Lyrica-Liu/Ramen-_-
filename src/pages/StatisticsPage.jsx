import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import studyBg from '../assets/studypage.png';
import styled, { keyframes } from 'styled-components';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';

/* ─── keyframes ─── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── page shell ─── */
const Page = styled.div`
  min-height: 100vh;
  background: url(${studyBg}) center/cover no-repeat;
  overflow-y: auto;
  overflow-x: hidden;
`;

/* ─── top bar ─── */
const TopBarArea = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  padding: 20px 28px 0;
  pointer-events: none;
`;

const TopPill = styled.div`
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  background: rgba(253, 248, 244, 0.70);
  backdrop-filter: blur(22px) saturate(1.4);
  -webkit-backdrop-filter: blur(22px) saturate(1.4);
  border: 1px solid rgba(255, 250, 247, 0.88);
  border-radius: 999px;
  padding: 5px 6px;
  box-shadow: 0 4px 28px rgba(160, 80, 80, 0.10), inset 0 1px 0 rgba(255,255,255,0.95);
  gap: 0;
`;

const PillSection = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 3px;
`;

const PillSep = styled.div`
  width: 1px;
  height: 20px;
  background: rgba(196, 132, 138, 0.22);
  flex-shrink: 0;
`;

const PillTitle = styled.div`
  cursor: pointer;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.22rem;
  font-weight: 400;
  font-style: italic;
  letter-spacing: -0.01em;
  background: linear-gradient(135deg, #3A2020 0%, #8C4848 55%, #C4848A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  user-select: none;
  white-space: nowrap;
  padding-right: 2px;
`;

const PillEmoji = styled.span`
  font-size: 1.15rem;
  margin-left: -5px;
  position: relative;
  top: 1px;
`;

const PillNavBtn = styled.button`
  padding: 7px 13px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  border: none;
  white-space: nowrap;
  transition: all 0.14s ease;
  background: ${p => p.$active ? 'rgba(196, 132, 138, 0.14)' : 'transparent'};
  color: ${p => p.$active ? p.theme.primary : p.theme.textSecondary};
  &:hover { background: rgba(196, 132, 138, 0.10); color: ${p => p.theme.primary}; }
`;

const PillEmail = styled.span`
  font-size: 0.74rem;
  color: ${p => p.theme.textSecondary};
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PillSignOut = styled.button`
  padding: 7px 13px;
  border-radius: 999px;
  background: rgba(196, 132, 138, 0.08);
  border: 1px solid rgba(196, 132, 138, 0.18);
  color: ${p => p.theme.textSecondary};
  font-size: 0.76rem;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.14s;
  &:hover { background: rgba(196,132,138,0.16); border-color: rgba(196,132,138,0.34); color: ${p => p.theme.text}; }
`;

/* ─── content ─── */
const Content = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding: 108px 28px 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${fadeUp} 0.4s ease both;
`;

const PageTitle = styled.h1`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.7rem;
  font-weight: 700;
  font-style: italic;
  letter-spacing: -0.02em;
  color: #3A2020;
  margin: 0;
`;

/* ─── glass panel base ─── */
const Panel = styled.div`
  background: rgba(253, 248, 244, 0.78);
  backdrop-filter: blur(18px) saturate(1.3);
  -webkit-backdrop-filter: blur(18px) saturate(1.3);
  border: 1px solid rgba(255, 250, 247, 0.85);
  border-radius: 22px;
  box-shadow: 0 4px 28px rgba(160, 80, 80, 0.08);
`;

/* ─── streak + level cards ─── */
const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
`;

const StatCard = styled(Panel)`
  padding: 22px 18px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const StatIcon = styled.div`
  font-size: 1.4rem;
  line-height: 1;
  margin-bottom: 2px;
`;

const StatValue = styled.div`
  font-size: 2.4rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: ${p => p.$muted ? p.theme.muted : p.theme.primary};
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${p => p.theme.textSecondary};
`;

const StatSub = styled.div`
  font-size: 0.75rem;
  color: ${p => p.theme.muted};
`;

/* ─── calendar panel ─── */
const CalendarPanel = styled(Panel)`
  padding: 22px 24px 22px;
  display: flex;
  flex-direction: row;
  gap: 0;
  align-items: flex-start;
`;

const CalLeft = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CalDivider = styled.div`
  width: 1px;
  align-self: stretch;
  background: ${p => p.theme.border};
  margin: 0 24px;
  flex-shrink: 0;
`;

const CalRight = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  padding: 4px 0;
`;

const CalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const MonthLabel = styled.div`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1rem;
  font-weight: 700;
  font-style: italic;
  color: ${p => p.theme.text};
  white-space: nowrap;
`;

const CalNavBtn = styled.button`
  padding: 5px 10px;
  border-radius: 999px;
  border: 1.5px solid ${p => p.theme.border};
  background: transparent;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${p => p.theme.textSecondary};
  transition: all 0.13s;
  flex-shrink: 0;
  &:hover:not(:disabled) { background: ${p => p.theme.btnHover}; color: ${p => p.theme.text}; border-color: ${p => p.theme.borderStrong}; }
  &:disabled { opacity: 0.38; cursor: default; }
`;

const CELL = 32;
const GAP  = 6;

const DayLabels = styled.div`
  display: grid;
  grid-template-columns: repeat(7, ${CELL}px);
  gap: ${GAP}px;
`;

const DayLabelCell = styled.div`
  width: ${CELL}px;
  text-align: center;
  font-size: 0.65rem;
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
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: ${p => p.$today ? 700 : 500};
  color: ${p => {
    if (p.$empty) return 'transparent';
    if (p.$today) return p.theme.primary;
    if (p.$level >= 3) return '#5A2A2A';
    return 'rgba(80, 45, 45, 0.65)';
  }};
  background: ${p => p.$empty ? 'transparent' : p.$color};
  outline: ${p => p.$today ? `2px solid ${p.theme.primary}` : 'none'};
  outline-offset: 1px;
  visibility: ${p => p.$empty ? 'hidden' : 'visible'};
  cursor: default;
`;

/* ─── legend ─── */
const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const LegendLabel = styled.span`
  font-size: 0.68rem;
  color: ${p => p.theme.muted};
`;

const LegendSwatch = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${p => p.$color};
`;

/* ─── insight cards (right side) ─── */
const InsightCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const InsightLabel = styled.div`
  font-size: 0.70rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${p => p.theme.muted};
`;

const InsightValue = styled.div`
  font-size: 0.92rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  letter-spacing: -0.01em;
`;

const InsightSub = styled.div`
  font-size: 0.78rem;
  color: ${p => p.theme.textSecondary};
`;

/* ─── helpers ─── */
const HEAT_COLORS = [
  'rgba(196,132,138,0.10)',
  'rgba(196,132,138,0.28)',
  'rgba(196,132,138,0.52)',
  'rgba(196,132,138,0.76)',
  '#C4848A',
];

function heatLevel(count) {
  if (!count) return 0;
  if (count <= 5)  return 1;
  if (count <= 15) return 2;
  if (count <= 30) return 3;
  return 4;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/* ─── component ─── */
export default function StatisticsPage() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [dailyMap, setDailyMap] = useState({});
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });

  useEffect(() => {
    api.fetchGlobalStats(365).then(data => {
      setCurrentStreak(data.currentStreak);
      setLongestStreak(data.longestStreak);
      const m = {};
      for (const d of data.daily) m[d.date] = d;
      setDailyMap(m);
    }).catch(console.error);
  }, []);

  const year  = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDow    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /* calendar cells: leading nulls + day numbers + trailing nulls */
  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function toDateStr(day) {
    return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }

  function isToday(day) {
    if (!day) return false;
    return new Date(year, month, day).getTime() === today.getTime();
  }

  /* right-side insights for the viewed month */
  const insights = useMemo(() => {
    let maxReviews = { count: 0, date: null };
    let maxAdded   = { count: 0, date: null };
    let daysStudied = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const entry = dailyMap[dateStr];
      if (!entry) continue;
      if (entry.reviewedCount > maxReviews.count) maxReviews = { count: entry.reviewedCount, date: dateStr };
      if (entry.addedCount    > maxAdded.count)   maxAdded   = { count: entry.addedCount,    date: dateStr };
      if (entry.reviewedCount > 0) daysStudied++;
    }
    return { maxReviews, maxAdded, daysStudied };
  }, [dailyMap, year, month, daysInMonth]);

  const canGoNext = new Date(year, month + 1, 1) <= new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <Page>
      <TopBarArea>
        <TopPill>
          <PillSection>
            <PillTitle onClick={() => navigate('/bookshelf')}>Ramen Vocab</PillTitle>
            <PillEmoji>🍜</PillEmoji>
          </PillSection>
          <PillSep />
          <PillSection>
            <PillNavBtn onClick={() => navigate('/bookshelf')}>Bookshelf</PillNavBtn>
            <PillNavBtn onClick={() => navigate('/collection')}>Collection</PillNavBtn>
            <PillNavBtn $active>Statistics</PillNavBtn>
          </PillSection>
          <PillSep />
          <PillSection>
            <PillEmail>{auth?.email}</PillEmail>
            <PillSignOut onClick={() => { logout(); navigate('/login'); }}>Sign Out</PillSignOut>
          </PillSection>
        </TopPill>
      </TopBarArea>

      <Content>
        <PageTitle>Statistics</PageTitle>

        {/* ── streak + level ── */}
        <StatRow>
          <StatCard>
            <StatIcon>🔥</StatIcon>
            <StatValue>{currentStreak}</StatValue>
            <StatLabel>Current Streak</StatLabel>
            <StatSub>{currentStreak === 1 ? '1 day' : `${currentStreak} days`}</StatSub>
          </StatCard>
          <StatCard>
            <StatIcon>🏆</StatIcon>
            <StatValue>{longestStreak}</StatValue>
            <StatLabel>Longest Streak</StatLabel>
            <StatSub>{longestStreak === 1 ? '1 day' : `${longestStreak} days`}</StatSub>
          </StatCard>
          <StatCard>
            <StatIcon>⭐</StatIcon>
            <StatValue $muted>1</StatValue>
            <StatLabel>Level</StatLabel>
            <StatSub>coming soon</StatSub>
          </StatCard>
        </StatRow>

        {/* ── calendar ── */}
        <CalendarPanel>
          {/* left: heatmap */}
          <CalLeft>
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
                const entry = dailyMap[dateStr];
                const count = entry?.reviewedCount ?? 0;
                const level = heatLevel(count);
                return (
                  <DayCell
                    key={dateStr}
                    $color={HEAT_COLORS[level]}
                    $level={level}
                    $today={isToday(day)}
                    title={count ? `${count} reviews` : undefined}
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
          </CalLeft>

          <CalDivider />

          {/* right: monthly insights */}
          <CalRight>
            <InsightCard>
              <InsightLabel>Most Active Day</InsightLabel>
              {insights.maxReviews.date ? (
                <>
                  <InsightValue>{formatDate(insights.maxReviews.date)}</InsightValue>
                  <InsightSub>{insights.maxReviews.count} reviews</InsightSub>
                </>
              ) : (
                <InsightValue>—</InsightValue>
              )}
            </InsightCard>

            <InsightCard>
              <InsightLabel>Most Words Added</InsightLabel>
              {insights.maxAdded.date ? (
                <>
                  <InsightValue>{formatDate(insights.maxAdded.date)}</InsightValue>
                  <InsightSub>{insights.maxAdded.count} words added</InsightSub>
                </>
              ) : (
                <InsightValue>—</InsightValue>
              )}
            </InsightCard>

            <InsightCard>
              <InsightLabel>Days Studied</InsightLabel>
              <InsightValue>
                {insights.daysStudied} / {daysInMonth}
              </InsightValue>
              <InsightSub>days this month</InsightSub>
            </InsightCard>
          </CalRight>
        </CalendarPanel>
      </Content>
    </Page>
  );
}
