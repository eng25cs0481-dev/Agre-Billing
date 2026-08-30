import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

interface Registration {
  getShortcuts: () => ShortcutConfig[];
  priority: number;
}

/**
 * Global keyboard dispatcher.
 *
 * All shortcut sets register into one module-level list served by a single
 * window listener. Handlers fire in priority order (highest first), so the
 * relationship between page-level shortcuts and the global F-keys is explicit
 * and stable — it no longer depends on `addEventListener` call order, which
 * used to shift on every route change (the global listener mounts once and
 * stays, while page listeners re-register on each navigation, so after the
 * first navigation the global handler would run *before* the page's and steal
 * events like Escape from a page's modal-close logic).
 */
const registrations: Registration[] = [];
let listening = false;

function handleKeyDown(e: KeyboardEvent) {
  // A more specific handler (a modal, or the autocomplete dropdown, which stops
  // propagation before this window listener) already consumed the event.
  if (e.defaultPrevented) return;

  // Highest priority first; ties keep registration order (stable sort).
  const ordered = [...registrations].sort((a, b) => b.priority - a.priority);

  for (const reg of ordered) {
    for (const shortcut of reg.getShortcuts()) {
      const keyMatch =
        e.key === shortcut.key || e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrl === (e.ctrlKey || e.metaKey);
      const altMatch = !!shortcut.alt === e.altKey;
      const shiftMatch = !!shortcut.shift === e.shiftKey;

      if (!keyMatch || !ctrlMatch || !altMatch || !shiftMatch) continue;

      // Only suppress single printable characters typed without Ctrl/Alt while
      // the user is editing a field. Function keys (F5, F8…), Escape, Enter and
      // the like must keep working even when an input/select is focused — that
      // is the whole point of these shortcuts on a data-entry voucher screen.
      if (shortcut.key.length === 1 && !shortcut.ctrl && !shortcut.alt) {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target?.isContentEditable
        ) {
          continue;
        }
      }

      e.preventDefault();
      shortcut.action();
      return;
    }
  }
}

function ensureListening() {
  if (listening) return;
  window.addEventListener('keydown', handleKeyDown);
  listening = true;
}

function maybeStopListening() {
  if (listening && registrations.length === 0) {
    window.removeEventListener('keydown', handleKeyDown);
    listening = false;
  }
}

/**
 * Register a set of keyboard shortcuts — TallyPrime-inspired navigation.
 *
 * `priority` controls precedence when more than one set matches the same key.
 * Page-level shortcuts use the default (0); global navigation uses a lower
 * value so a page can always override it. The live shortcut list is read from a
 * ref, so callers may pass a freshly-built array each render without churn.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], priority = 0) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const reg: Registration = { getShortcuts: () => shortcutsRef.current, priority };
    registrations.push(reg);
    ensureListening();
    return () => {
      const i = registrations.indexOf(reg);
      if (i >= 0) registrations.splice(i, 1);
      maybeStopListening();
    };
  }, [priority]);
}

/** Priority for the always-mounted global shortcuts — below any page. */
const GLOBAL_PRIORITY = -100;

/**
 * Global navigation shortcuts (F-keys). Mounted once in the app layout. Any
 * page-level Escape/handler takes precedence via the priority ordering above.
 */
export function useGlobalShortcuts() {
  const navigate = useNavigate();

  useKeyboardShortcuts(
    [
      { key: 'F3', action: () => navigate('/select-company'), description: 'Company Selection' },
      { key: 'F5', action: () => navigate('/transactions/payment'), description: 'Payment' },
      { key: 'F6', action: () => navigate('/transactions/receipt'), description: 'Receipt' },
      { key: 'F7', action: () => navigate('/transactions/expense'), description: 'Journal / Expense' },
      { key: 'F8', action: () => navigate('/transactions/sale'), description: 'Sales' },
      { key: 'F9', action: () => navigate('/transactions/purchase'), description: 'Purchase' },
      { key: 'Escape', action: () => navigate(-1), description: 'Back' },
      { key: 'k', alt: true, action: () => navigate('/select-company'), description: 'Company Menu' },
      { key: 'y', alt: true, action: () => navigate('/utilities/sync'), description: 'Data Menu' },
      { key: 'z', alt: true, action: () => navigate('/utilities/sync'), description: 'Exchange Menu' },
      { key: 'g', alt: true, action: () => navigate('/'), description: 'Go To' },
      { key: 'o', alt: true, action: () => navigate('/utilities/import'), description: 'Import Data' },
      { key: 'e', alt: true, action: () => navigate('/utilities/export'), description: 'Export Data' },
      { key: 'p', alt: true, action: () => window.print(), description: 'Print' },
      { key: 'F1', action: () => alert('Agre Billing Help & Shortcuts: F5=Payment, F6=Receipt, F8=Sales, F9=Purchase, Ctrl+S=Save, Esc=Quit'), description: 'Help' },
    ],
    GLOBAL_PRIORITY
  );
}
