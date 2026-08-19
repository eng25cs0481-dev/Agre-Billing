import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

/**
 * Hook for keyboard shortcuts — TallyPrime-inspired navigation
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = e.key === shortcut.key || e.key === shortcut.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrl === (e.ctrlKey || e.metaKey);
        const altMatch = !!shortcut.alt === e.altKey;
        const shiftMatch = !!shortcut.shift === e.shiftKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          // Don't override if typing in an input
          const target = e.target as HTMLElement;
          if (
            !shortcut.ctrl &&
            !shortcut.alt &&
            (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
          ) {
            continue;
          }

          e.preventDefault();
          e.stopPropagation();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Hook for global navigation shortcuts (F-keys)
 */
export function useGlobalShortcuts() {
  const navigate = useNavigate();

  useKeyboardShortcuts([
    { key: 'F5', action: () => navigate('/transactions/payment'), description: 'Payment' },
    { key: 'F6', action: () => navigate('/transactions/receipt'), description: 'Receipt' },
    { key: 'F8', action: () => navigate('/transactions/sale'), description: 'Sales' },
    { key: 'F9', action: () => navigate('/transactions/purchase'), description: 'Purchase' },
    { key: 'Escape', action: () => navigate(-1 as any), description: 'Back' },
  ]);
}
