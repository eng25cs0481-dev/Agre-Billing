import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface AutocompleteOption {
  /** Text shown in the field and the primary line of the row. */
  label: string;
  /** Secondary muted text (e.g. phone, price, balance). */
  sublabel?: string;
  /** Stable identity for the option. */
  value: string;
  /** Original record, handed back via onSelect. */
  data?: any;
}

interface AutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (opt: AutocompleteOption) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  autoFocus?: boolean;
  /** Called on Enter when the dropdown has nothing to select (e.g. add a new row). */
  onEnter?: () => void;
  maxItems?: number;
}

/**
 * Free-text field with a master-data suggestion dropdown (TallyPrime style).
 *
 * The user can still type any value (walk-in customers, ad-hoc items), but any
 * matching master record is offered for selection. The menu is portaled to
 * <body> with fixed positioning so it is never clipped by scrollable table/form
 * containers.
 */
export default function Autocomplete({
  value,
  onChange,
  onSelect,
  options,
  placeholder,
  className,
  style,
  inputRef,
  autoFocus,
  onEnter,
  maxItems = 50,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [rect, setRect] = useState<{ left: number; top: number; width: number } | null>(null);

  const innerRef = useRef<HTMLInputElement>(null);
  const ref = inputRef || innerRef;

  const query = value.trim().toLowerCase();
  const filtered = (
    query
      ? options.filter(
          (o) =>
            o.label.toLowerCase().includes(query) ||
            (o.sublabel || '').toLowerCase().includes(query)
        )
      : options
  ).slice(0, maxItems);

  const updateRect = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ left: r.left, top: r.bottom + 2, width: r.width });
  }, [ref]);

  const openMenu = useCallback(() => {
    updateRect();
    setHighlight(0);
    setOpen(true);
  }, [updateRect]);

  // Reposition the fixed menu while it is open (scroll/resize can move the input).
  useEffect(() => {
    if (!open) return;
    const reposition = () => updateRect();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, updateRect]);

  // Keep the highlighted index within bounds as the filtered list changes.
  useEffect(() => {
    if (highlight > filtered.length - 1) {
      setHighlight(filtered.length > 0 ? filtered.length - 1 : 0);
    }
  }, [filtered.length, highlight]);

  const choose = useCallback(
    (opt: AutocompleteOption) => {
      onChange(opt.label);
      onSelect?.(opt);
      setOpen(false);
    },
    [onChange, onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      if (!open) {
        openMenu();
      } else {
        setHighlight((h) => Math.min(h + 1, filtered.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      if (!open) return;
      e.preventDefault();
      e.stopPropagation();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && filtered[highlight]) {
        e.preventDefault();
        e.stopPropagation();
        choose(filtered[highlight]);
      } else if (onEnter) {
        e.preventDefault();
        onEnter();
      }
    } else if (e.key === 'Escape') {
      if (open) {
        // Close the dropdown without letting the page-level Escape navigate away.
        e.stopPropagation();
        setOpen(false);
      }
    }
  };

  const showMenu = open && rect && filtered.length > 0;

  return (
    <>
      <input
        ref={ref}
        type="text"
        className={className}
        style={style}
        placeholder={placeholder}
        value={value}
        autoFocus={autoFocus}
        role="combobox"
        aria-expanded={!!showMenu}
        aria-autocomplete="list"
        autoComplete="off"
        onChange={(e) => {
          const val = e.target.value;
          onChange(val);
          if (!open) openMenu();
          else updateRect();
        }}
        onFocus={() => {
          openMenu();
        }}
        onClick={() => {
          if (!open) openMenu();
        }}
        onBlur={() => {
          // Delay so an option's onMouseDown selection registers before closing.
          window.setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={handleKeyDown}
      />
      {showMenu &&
        createPortal(
          <div
            className="ac-menu"
            style={{
              position: 'fixed',
              left: rect!.left,
              top: rect!.top,
              width: Math.max(rect!.width, 240),
              zIndex: 4000,
            }}
            // Keep input focus so the input's onBlur doesn't close us mid-click.
            onMouseDown={(e) => e.preventDefault()}
          >
            {filtered.map((opt, i) => (
              <div
                key={opt.value + '__' + i}
                className={`ac-option ${i === highlight ? 'active' : ''}`}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(opt);
                }}
              >
                <span className="ac-label">{opt.label}</span>
                {opt.sublabel && <span className="ac-sub">{opt.sublabel}</span>}
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
