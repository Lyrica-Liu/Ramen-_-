import { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as api from '../api';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
`;

const MonthTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${p => p.theme.text};
`;

const NavBtn = styled.button`
  padding: 6px 12px;
  border: 1px solid ${p => p.theme.border};
  background: ${p => p.theme.panel};
  border-radius: ${p => p.theme.radiusSm};
  color: ${p => p.theme.text};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: ${p => p.theme.btnHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const CalendarBox = styled.div`
  background: ${p => p.theme.panel};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 18px;
`;

const WeekdayRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 12px;
`;

const Weekday = styled.div`
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${p => p.theme.textSecondary};
  padding: 6px;
`;

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

const DayCell = styled.div`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${p => p.theme.radiusSm};
  font-size: 0.8rem;
  font-weight: 500;
  cursor: default;
  background: ${p => {
    if (p.$today) return p.theme.primary;
    if (p.$studied) return p.theme.easyBg;
    if (p.$notInMonth) return 'transparent';
    return p.theme.btnBg;
  }};
  color: ${p => {
    if (p.$today) return '#fff';
    if (p.$studied) return p.theme.easyText;
    return p.theme.textSecondary;
  }};
  border: ${p => (p.$today ? `2px solid ${p.theme.easyBorder}` : 'none')};
  font-weight: ${p => (p.$today ? 700 : 500)};
`;

const StreakBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const StreakCard = styled.div`
  background: ${p => p.theme.panel};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 16px;
  text-align: center;
`;

const StreakLabel = styled.div`
  font-size: 0.85rem;
  color: ${p => p.theme.textSecondary};
  margin-bottom: 6px;
  font-weight: 500;
`;

const StreakNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${p => p.theme.primary};
`;

const Legend = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  font-size: 0.85rem;
  color: ${p => p.theme.textSecondary};
  padding: 0 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: ${p => p.theme.radiusSm};
  background: ${p => p.$color};
  border: ${p => (p.$bordered ? `2px solid ${p.$borderColor}` : 'none')};
`;

export default function Statistics({ bookId }) {
  const [stats, setStats] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.fetchDailyStats(bookId, 365);
        setStats(data);
        calculateStreaks(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [bookId]);

  const calculateStreaks = (data) => {
    if (!data.length) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    const studiedDates = new Set(
      data.filter(d => d.reviewedCount > 0).map(d => d.date)
    );

    let current = 0;
    let longest = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      if (studiedDates.has(dateStr)) {
        current++;
      } else if (i === 0) {
        current = 0;
        break;
      } else {
        break;
      }
    }

    let tempStreak = 0;
    for (const dateStr of studiedDates) {
      const date = new Date(dateStr);
      if (date <= today) {
        tempStreak++;
      } else {
        tempStreak = 0;
      }
      longest = Math.max(longest, tempStreak);
    }

    setCurrentStreak(current);
    setLongestStreak(longest);
  };

  const studiedDates = new Set(
    stats.filter(d => d.reviewedCount > 0).map(d => d.date)
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days = [];
  let current = new Date(startDate);
  while (current <= lastDay || current.getDay() !== 0) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Wrapper>
      <Header>
        <NavBtn onClick={handlePrevMonth}>← Prev</NavBtn>
        <MonthTitle>{monthName}</MonthTitle>
        <NavBtn onClick={handleNextMonth}>Next →</NavBtn>
      </Header>

      <CalendarBox>
        <WeekdayRow>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Weekday key={day}>{day}</Weekday>
          ))}
        </WeekdayRow>

        <DayGrid>
          {days.map((date, i) => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = date.getTime() === today.getTime();
            const isInMonth = date.getMonth() === month;
            const isStudied = studiedDates.has(dateStr);

            return (
              <DayCell
                key={i}
                $today={isToday}
                $studied={isStudied && isInMonth}
                $notInMonth={!isInMonth}
              >
                {isInMonth && date.getDate()}
              </DayCell>
            );
          })}
        </DayGrid>
      </CalendarBox>

      <Legend>
        <LegendItem>
          <LegendColor $color="#F0FFF5" />
          Studied
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#F5F7FB" />
          Not studied
        </LegendItem>
        <LegendItem>
          <LegendColor $bordered $color="#6DA3FF" $borderColor="#A3D4FF" />
          Today
        </LegendItem>
      </Legend>

      <StreakBox>
        <StreakCard>
          <StreakLabel>Current Streak</StreakLabel>
          <StreakNumber>{currentStreak}</StreakNumber>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            days
          </div>
        </StreakCard>
        <StreakCard>
          <StreakLabel>Longest Streak</StreakLabel>
          <StreakNumber>{longestStreak}</StreakNumber>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            days
          </div>
        </StreakCard>
      </StreakBox>
    </Wrapper>
  );
}
