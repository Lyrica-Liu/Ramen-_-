import { useNavigate } from 'react-router-dom';
import studyBg from '../assets/studypage.png';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Page = styled.div`
  min-height: 100vh;
  background: url(${studyBg}) center/cover no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

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

const Center = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ComingSoon = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(120, 100, 90, 0.55);
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export default function CollectionPage() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

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
            <PillNavBtn $active>Collection</PillNavBtn>
            <PillNavBtn onClick={() => navigate('/statistics')}>Statistics</PillNavBtn>
          </PillSection>
          <PillSep />
          <PillSection>
            <PillEmail>{auth?.email}</PillEmail>
            <PillSignOut onClick={() => { logout(); navigate('/login'); }}>Sign Out</PillSignOut>
          </PillSection>
        </TopPill>
      </TopBarArea>

      <Center>
        <ComingSoon>coming soon</ComingSoon>
      </Center>
    </Page>
  );
}
