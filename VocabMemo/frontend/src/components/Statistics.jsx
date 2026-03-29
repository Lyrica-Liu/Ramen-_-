import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as api from '../api';

/* ─── styled ─── */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const GraphScroll = styled.div`
  overflow-x: auto;
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 16px;
`;

const Legend = styled.div`
  display: flex;
  gap: 18px;
  justify-content: center;
  font-size: 0.88rem;
  color: #6b7280;
`;

const Dot = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${p => p.color};
  margin-right: 5px;
  vertical-align: middle;
`;

const Hint = styled.div`
  font-size: 0.85rem;
  color: #9ca3af;
  text-align: center;
`;

const PointDetail = styled.div`
  background: ${p => p.theme.panel};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 10px;
  padding: 12px 18px;
  font-size: 0.92rem;
  color: ${p => p.theme.text};

  strong {
    display: block;
    margin-bottom: 4px;
  }
`;

/* ─── component ─── */

export default function Statistics({ bookId }) {
  const [stats, setStats] = useState([]);
  const [hint, setHint] = useState('');
  const [detail, setDetail] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.fetchDailyStats(bookId);
        setStats(data);
        if (!data.length) setHint('No statistics yet.');
        else setHint("Click a point to view the day's exact values.");
      } catch {
        setHint('Unable to load statistics.');
      }
    })();
  }, [bookId]);

  /* ─── SVG rendering ─── */
  const width = 760;
  const height = 280;
  const pad = { top: 20, right: 20, bottom: 56, left: 52 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const maxVal = Math.max(1, ...stats.map(s => Math.max(s.reviewedCount, s.addedCount)));
  const yTickCount = 4;
  const yStep = Math.ceil(maxVal / yTickCount);
  const yMax = Math.max(yStep * yTickCount, 1);
  const stepX = stats.length > 1 ? plotW / (stats.length - 1) : 0;

  const toX = i => pad.left + i * stepX;
  const toY = v => pad.top + plotH - (v / yMax) * plotH;

  const reviewedPts = stats.map((s, i) => `${toX(i)},${toY(s.reviewedCount)}`).join(' ');
  const addedPts = stats.map((s, i) => `${toX(i)},${toY(s.addedCount)}`).join(' ');

  const labelStep = Math.max(1, Math.ceil(stats.length / 7));

  const handleDotClick = (e, index, series) => {
    e.stopPropagation();
    const pt = stats[index];
    if (!pt) return;
    setDetail({
      date: pt.date,
      reviewed: pt.reviewedCount,
      added: pt.addedCount,
    });
  };

  return (
    <Wrapper>
      <GraphScroll>
        {stats.length > 0 ? (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMinYMin meet"
            width="100%"
            style={{ minWidth: 500, display: 'block' }}
            onClick={() => setDetail(null)}
          >
            {/* Y gridlines + labels */}
            {Array.from({ length: yTickCount + 1 }, (_, i) => {
              const v = i * yStep;
              const y = toY(v);
              return (
                <g key={`yt-${i}`}>
                  <line x1={pad.left} y1={y} x2={pad.left + plotW} y2={y} stroke="#e8ecfb" />
                  <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#6b7280">
                    {v}
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="#cfd8f7" />
            <line
              x1={pad.left}
              y1={pad.top + plotH}
              x2={pad.left + plotW}
              y2={pad.top + plotH}
              stroke="#cfd8f7"
            />

            {/* Lines */}
            <polyline fill="none" stroke="#6f8dff" strokeWidth="3" points={reviewedPts} />
            <polyline fill="none" stroke="#6cc8a1" strokeWidth="3" points={addedPts} />

            {/* Dots */}
            {stats.map((s, i) => (
              <g key={`dots-${i}`}>
                <circle
                  cx={toX(i)}
                  cy={toY(s.reviewedCount)}
                  r="4.5"
                  fill="#6f8dff"
                  style={{ cursor: 'pointer' }}
                  onClick={e => handleDotClick(e, i, 'reviewed')}
                />
                <circle
                  cx={toX(i)}
                  cy={toY(s.addedCount)}
                  r="4.5"
                  fill="#6cc8a1"
                  style={{ cursor: 'pointer' }}
                  onClick={e => handleDotClick(e, i, 'added')}
                />
              </g>
            ))}

            {/* X labels */}
            {stats.map((s, i) => {
              if (i % labelStep !== 0 && i !== stats.length - 1) return null;
              return (
                <text
                  key={`xl-${i}`}
                  x={toX(i)}
                  y={height - 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#6b7280"
                >
                  {s.date.slice(5)}
                </text>
              );
            })}

            <text x="12" y="18" fontSize="11" fill="#6b7280">
              Words
            </text>
          </svg>
        ) : (
          <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            {hint || 'Loading…'}
          </div>
        )}
      </GraphScroll>

      {stats.length > 0 && (
        <Legend>
          <span>
            <Dot color="#6f8dff" /> Reviewed
          </span>
          <span>
            <Dot color="#6cc8a1" /> Added
          </span>
        </Legend>
      )}

      {hint && stats.length > 0 && <Hint>{hint}</Hint>}

      {detail && (
        <PointDetail>
          <strong>{detail.date}</strong>
          <div>Words reviewed: {detail.reviewed}</div>
          <div>Words added: {detail.added}</div>
        </PointDetail>
      )}
    </Wrapper>
  );
}
