import { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
  const [activeTab, setActiveTab] = useState('vocab');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    level: 'all',
    added: 'all',
    favorited: false,
    phrase: 'all',
  });
  const [selectedWordIds, setSelectedWordIds] = useState(new Set());
  const [showWordDetail, setShowWordDetail] = useState(false);
  const [detailWordId, setDetailWordId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  const updateFilter = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }, []);

  const toggleWordSelection = useCallback((wordId) => {
    setSelectedWordIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  }, []);

  const clearSelections = useCallback(() => {
    setSelectedWordIds(new Set());
  }, []);

  const openContextMenu = useCallback((type, x, y) => {
    setContextMenu(type);
    setContextMenuPos({ x, y });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const showDetail = useCallback((wordId) => {
    setDetailWordId(wordId);
    setShowWordDetail(true);
  }, []);

  const hideDetail = useCallback(() => {
    setShowWordDetail(false);
  }, []);

  const value = {
    // Tab navigation
    activeTab,
    setActiveTab,

    // Search and filters
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,

    // Word selection
    selectedWordIds,
    toggleWordSelection,
    clearSelections,

    // Word detail panel
    showWordDetail,
    detailWordId,
    showDetail,
    hideDetail,

    // Context menu
    contextMenu,
    contextMenuPos,
    openContextMenu,
    closeContextMenu,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
}
