import { useEffect, useRef } from 'react';
import styled from 'styled-components';

const Menu = styled.div`
  position: fixed;
  z-index: 1000;
  background: #fff;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 10px;
  padding: 6px 0;
  min-width: 160px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
`;

const MenuItem = styled.button`
  display: block;
  width: 100%;
  padding: 9px 18px;
  border: none;
  background: none;
  text-align: left;
  font-size: 0.95rem;
  color: ${p => (p.$danger ? '#ef4444' : p.theme.text)};
  cursor: pointer;

  &:hover {
    background: ${p => (p.$danger ? '#fef2f2' : '#f3f4f6')};
  }
`;

export default function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const menuW = el.offsetWidth || 180;
    const menuH = el.offsetHeight || 100;
    el.style.left = `${Math.max(8, Math.min(x, window.innerWidth - menuW - 8))}px`;
    el.style.top = `${Math.max(8, Math.min(y, window.innerHeight - menuH - 8))}px`;
  }, [x, y]);

  return (
    <Menu ref={ref} onClick={e => e.stopPropagation()}>
      {items.map((item, i) => (
        <MenuItem
          key={i}
          $danger={item.danger}
          onClick={() => {
            item.onClick();
            onClose();
          }}
        >
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  );
}
