import { createContext, useContext, useState, useCallback } from 'react';

const StudyContext = createContext();

export function StudyProvider({ children }) {
  const [words, setWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [dailyProgress, setDailyProgress] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    mastered: 0,
    easyCount: 0,
    okayCount: 0,
    hardCount: 0,
  });
  const [dailyStudyPhase, setDailyStudyPhase] = useState(null);
  const [reviewIndices, setReviewIndices] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const updateWords = useCallback((newWords) => {
    setWords(newWords);
  }, []);

  const updateSelectedWord = useCallback((word) => {
    setSelectedWord(word);
  }, []);

  const updateSessionStats = useCallback((stats) => {
    setSessionStats(prev => ({ ...prev, ...stats }));
  }, []);

  const resetSessionStats = useCallback(() => {
    setSessionStats({
      reviewed: 0,
      mastered: 0,
      easyCount: 0,
      okayCount: 0,
      hardCount: 0,
    });
  }, []);

  const value = {
    // Word data
    words,
    updateWords,
    selectedWord,
    updateSelectedWord,

    // Daily study
    dailyProgress,
    setDailyProgress,
    dailyStudyPhase,
    setDailyStudyPhase,
    reviewIndices,
    setReviewIndices,
    currentReviewIndex,
    setCurrentReviewIndex,

    // Session tracking
    sessionStats,
    updateSessionStats,
    resetSessionStats,
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within StudyProvider');
  }
  return context;
}
