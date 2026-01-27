import {createContext, useContext, useState, useCallback, type ReactNode} from 'react';

interface QuickViewContextType {
  isOpen: boolean;
  productHandle: string | null;
  openQuickView: (handle: string) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextType | null>(null);

export function QuickViewProvider({children}: {children: ReactNode}) {
  const [isOpen, setIsOpen] = useState(false);
  const [productHandle, setProductHandle] = useState<string | null>(null);

  const openQuickView = useCallback((handle: string) => {
    setProductHandle(handle);
    setIsOpen(true);
  }, []);

  const closeQuickView = useCallback(() => {
    setIsOpen(false);
    setProductHandle(null);
  }, []);

  return (
    <QuickViewContext.Provider
      value={{isOpen, productHandle, openQuickView, closeQuickView}}
    >
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
}
