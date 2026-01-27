import {useEffect, useCallback} from 'react';
import {useQuickView} from '~/context/QuickViewContext';
import {IconClose} from '~/components/Icon';

export function QuickViewModal({children}: {children: React.ReactNode}) {
  const {isOpen, closeQuickView} = useQuickView();

  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeQuickView();
      }
    },
    [closeQuickView],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary/40 backdrop-blur-sm"
        onClick={closeQuickView}
        aria-hidden="true"
      />
      
      {/* Modal content */}
      <div
        className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-contrast rounded-lg shadow-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-primary/10 transition-colors"
          aria-label="Close quick view"
        >
          <IconClose />
        </button>
        
        {children}
      </div>
    </div>
  );
}
