import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function WordSearchPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/book/${bookId}`, { replace: true });
  }, [bookId, navigate]);

  return null;
}
